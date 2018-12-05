/*
* Library for storing and editing data
*
*/

// Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('./helpers');

// Container for the module (to be exported)

let lib = {};

// Define base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {
    // Open the file for writing.  'wx' is a flag
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            let stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {    
                    callback('Error writing to new file');
                }
            })
        } else {
            callback('Could not create new file, it may already exist');
        }
    })
};

// Read data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
        if (!err && data) {
            let parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err, data);
        }
    })
};

// Update data inside of an existing file
lib.update = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Covert data to string
            let stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file')
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};

// Delete a file
lib.delete = (dir, file, callback) => {
    // Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};


// CRUD EXAMPLE FUNCTIONS BELOW ------ 
// TEST - create file
// @TODO delete this
// _data.create('test', 'newFile', {'foo': 'bar'}, (err) => {
//     console.log('this was the error: ', err);
// });

// TEST - read file
// @TODO delete this
// _data.read('test', 'newFile', (err, data) => {
//     console.log('This is the error: ', err);
//     console.log('This is the data: ', data);
// });

// TEST - update file
// @TODO delete this
// _data.update('test', 'newFile', {'fizz': 'buzz'}, (err) => {
//     console.log('This was the error: ', err);
// });

// TEST - delete file
// @TODO delete this
// _data.delete('test', 'newFile', (err) => {
//     console.log('This was the error: ', err);
// });

// Export the module
module.exports = lib;