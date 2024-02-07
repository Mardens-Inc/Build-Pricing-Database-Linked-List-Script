/**
 * This script fetches a list of databases from a server, processes the list to get the path details,
 * retrieves database information from the path, and then writes the output to a JSON file.
 * This is a ridiculous script, but I couldn't think of a better way.
 * Author: Drew Chase
 */


const fs = require('fs'); // File System module is used to read and write files
const path = require('path'); // Path module provides utilities for working with file and directory paths


getDatabaseList() // fetches list of databases from the server
    .then(data => getPath(data["data"])) // Upon successful fetch, it will process and get the path details
    .then(data => getDatabaseInformation(data)) // from the path, it will get the information about the database
    .then(data => exportJson(data)) // after fetching the database information, writes the output to a JSON file
    .catch((e) => console.error(e)); // Logs any error that occurs during the execution of the promises

/**
 * Retrieves a list of databases from the server using a specified URL.
 *
 * @returns {Promise<JSON|null>} A Promise that resolves with the list of databases if the retrieval is successful,
 *                            or null if there is an error.
 */
async function getDatabaseList() {
    // This is a constant variable named url. It's holding the Uniform Resource Locator(URL)
    // of a text file that contains the list of databases.
    const url = "https://fm.mardens.com/fmDataFiles/db_list.txt";

    // A try-catch block is used to test blocks of code for errors.
    // The try block contains the code to be tested for errors while it is being executed.
    try {
        // Fetch is a built-in function in JavaScript used to request to the server,
        // fetch resources and then return the promise that resolves with the Response object.
        const response = await fetch(url);

        // The json() method of the Body mixin takes a Response stream and reads it to completion.
        // It returns a promise that resolves with the result of parsing the body text as JSON.
        return await response.json();
    }

        // The catch block contains the code to be executed if an error occurs in the try block.
    catch (e) {
        // The console.error() method is used to log error messages in the browser console.
        // It is often used when debugging code.
        console.error("Unable to fetch data from the server\n", url, e);

        // Here we return a null value to signify that there was an error fetching data from the server.
        return null;
    }
}

/**
 * Retrieves the path for each item in the provided json array.
 * The path is obtained by extracting the folder name from the "link" property of each item in the json array.
 *
 * @param {Array<JSON>} json - The json array containing the items.
 * @returns {Array<JSON>} - The updated json array with the "path" property added to each item.
 *                   The path represents the directory path for each item.
 */
function getPath(json) {
    // Loop through each item in the provided json array
    for (let i = 0; i < json.length; i++) {
        try {
            // Assign the current item to a variable
            const item = json[i];
            // If the current item or it's "link" property is undefined, skip to the next iteration
            if (item === undefined || item["link"] === undefined) continue;
            // Replace the part of the URL in the "link" property with an empty string, then decode the URI and split it at each "/" to get the folder name
            const folder = decodeURIComponent(item["link"].replace("https://pricing.mardens.com/mard_db/", "").split("/")[0]);
            // If the folder is undefined, skip to the next iteration
            if (folder === undefined) continue;
            // Update the "path" property of the current item in json with the new path
            json[i]["path"] = `\\\\192.168.21.207\\c$\\inetpub\\wwwroot\\PricingWebSite\\mard_db\\${folder}`;
        } catch (e) {
            // Log any errors to the console
            console.error(e);
        }
    }
    // Return the updated json array
    return json;
}

/**
 * Retrieves database information from a JSON array.
 *
 * @param {Array<JSON>} json - The JSON array containing the information.
 * @returns {Promise<Array<JSON>>} - A promise that resolves to an array of objects where 'db_name' and 'table' properties have been defined.
 */
async function getDatabaseInformation(json) {

    // Initialize counts of found database and table names
    let foundDatabaseNames = 0;
    let foundTableNames = 0;

// Iterate over all items in the JSON array
    for (let i = 0; i < json.length; i++) {
        const item = json[i];

        // Add a new 'connection' property to the current JSON item
        json[i]["connection"] = {};

        try {
            // If the item or its 'path' property is undefined, skip to the next item
            if (item === undefined || item["path"] === undefined) continue;

            // Read all files in the item's path
            const files = fs.readdirSync(item["path"]);

            for (let j = 0; j < files.length; j++) {

                // If the 'connection' property has already been defined with 'db_name' and 'table', break the loop
                if (json[i]["connection"] !== undefined && json[i]["connection"]["db_name"] !== undefined && json[i]["connection"]["table"] !== undefined) break;

                const file = files[j];
                try {
                    if (file === undefined) continue;

                    // Construct the absolute filepath
                    const filePath = path.join(item["path"], file);

                    // If the file is a directory, skip to the next file
                    if (fs.lstatSync(filePath).isDirectory()) continue;

                    // Skip if the file is not a PHP or JSON file
                    if (!file.endsWith(".php") && !file.endsWith(".json"))
                        continue;

                    // Read the content of the file
                    const content = fs.readFileSync(filePath, 'utf8');

                    // Split the content by newline characters to get an array of lines
                    const lines = content.split("\n");

                    for (let k = 0; k < lines.length; k++) {
                        const line = lines[k];
                        try {
                            // Skip if the line is undefined or empty
                            if (line === undefined || line === "") continue;

                            // Split the line by '=' to get an array of parts
                            const parts = line.split("=");

                            // If the line doesn't have exactly two parts, skip to the next line
                            if (parts.length !== 2) continue;

                            const key = parts[0].trim().toLowerCase();
                            const value = parts[1].trim();

                            // If the value does not start with '"' or contains spaces, skip to the next line
                            if (!value.startsWith("\"") || value.includes(" ")) continue;

                            // If the key includes any of the database-related strings, add the 'db_name' to the 'connection' property
                            if (key.includes("db_name") || key.includes("database_name") || key.includes("database") || key.includes("db")) {
                                json[i]["connection"]["db_name"] = value.replace(/"/g, "");
                                foundDatabaseNames++;
                            } // If the key includes any of the table-related strings, add the 'table' to the 'connection' property
                            else if (key.includes("table") || key.includes("layout") || key.includes("table_name") || key.includes("layout_name")) {
                                json[i]["connection"]["table"] = value.replace(/"/g, "");
                                foundTableNames++;
                            }
                        } catch (e) {
                            // Log an error if a line fails to be parsed
                            console.error(`Failed to parse line: ${line}`, e);
                        }
                    }
                } catch (e) {
                    // Log an error if a file fails to be read
                    console.error(`Failed to read file: ${file}`, e);
                }
            }
        } catch (e) {
            // Log an error if a JSON property fails to be parsed
            console.error(`Failed to parse json property: '${JSON.stringify(item)}'`, e);
        }
    }

// Log the counts and percentages of found database and table names
    console.log(`Found ${foundDatabaseNames} (${(foundDatabaseNames / json.length) * 100}%) database names and ${foundTableNames} (${(foundTableNames / json.length) * 100}%) table names out of ${json.length} items.`)

// Return only the items where 'db_name' and 'table' have been defined
    return json.filter(item => item["connection"]["db_name"] !== undefined && item["connection"]["table"] !== undefined);
}

/**
 * Exports the given data as a JSON file.
 *
 * @param {any} data - The data to be exported as JSON.
 * @returns {Promise<void>} - A promise that resolves when the file is successfully written.
 */
async function exportJson(data) {
    // Stringify data to JSON format, indented with 4 spaces
    const json = JSON.stringify(data, null, 4)

    // Generating filePath by joining current directory path with the name of the output file.
    const filePath = path.join(__dirname, "output.json");

    // Using the writeFileSync function from the 'fs' module to write the JSON data to a file
    fs.writeFileSync(filePath, json, 'utf8');

    // Logging the path of the file to the console
    console.log(`File written to: ${filePath}`);
}