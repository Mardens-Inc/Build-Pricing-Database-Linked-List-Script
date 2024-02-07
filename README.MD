# Build Pricing Database Linked List Script

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
    - [getDatabaseList](#getDatabaseList)
    - [getPath](#getPath)
    - [getDatabaseInformation](#getDatabaseInformation)
3. [Feedback](#feedback)
4. [License](#license)

## Installation
clone project from git
```bash
git clone https://github.com/Mardens-Inc/Build-Pricing-Database-Linked-List-Script
```

## Usage
> **Note**: This project is in NODE.js, hence, it does not directly run in the browser.

### getDatabaseList

Function fetches list of databases from the server.

**Returns**: Promise<JSON|null> - A Promise that resolves with the list of databases if the retrieval is successful, or null if there is an error.

**Example**:

```javascript
getDatabaseList()
    .then(data => console.log(data))
    .catch(e => console.error(e));
```

### getPath

The function retrieves the path for each item in the provided JSON array.


**Parameters**:
- `*json* (Array<JSON>) - The JSON array containing the items.`

**Returns**: Array<JSON> - The updated JSON array with the "path" property added to each item.

**Example**:

```javascript
let jsonData =  [ {...}, {...}, {...}]; // Your json data
let result = getPath(jsonData);
```

### getDatabaseInformation

The function retrieves the given database information from a JSON array.

**Parameters**:
- `*json* (Array<JSON>) - The JSON array containing the information.`

**Returns**: Promise<Array<JSON>> - A promise that resolves to an array of objects where 'db_name' and 'table' properties have been defined.

**Example**:

```javascript
let jsonData =  [ {...}, {...}, {...}]; // Your json data
getDatabaseInformation(jsonData)
    .then(result => console.log(result))
    .catch(e => console.error(e));
```
## Feedback

If you have any feedback or questions, please reach out to **Drew Chase** at [drew.chase@mardens.com](mailto:drew.chase@mardens.com).

## License

This Library is [GNU General Public License v3.0](./LICENSE).

****