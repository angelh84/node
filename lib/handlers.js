/*
* Request handlers
*
*/

// Dependencies
let _data = require('./data');
let helpers = require('./helpers');

// Define the handlers
var handlers = {};

// Users
handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 
        ? data.payload.firstName.trim()
        : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10
        ? data.payload.phone.trim()
        : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true
        ? true
        : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password 
                let hashedPassword = helpers.hash(password);

                // Create the user object
                if (hashedPassword) {
                    let userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    }
                    
                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'})
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash the user\'s password'})
                }
            } else {
                // user already exists
                callback(400, {'Error': 'A user with that phone number already exists'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone elses
handlers._users.get = (data, callback) => {
    // Check that the phone number provided is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim()
        : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove the hashedPassword from the user object before returning it to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - put
// Required data : phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user update their own object. Don't let them update anyone elses
handlers._users.put = (data, callback) => {
    // Check for the required field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10
        ? data.payload.phone.trim()
        : false;

    // Check for the optional fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 
        ? data.payload.firstName.trim()
        : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup a user
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }

                    // Store the new updates
                    _data.update('users', phone, userData, (err) => {
                        if (!err) {
                             callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not update the user'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            })
        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - delete
// Required field: phone
// @TODO Only let an authenticated user delete their object, Don't let them delete anyone elses
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete  = (data, callback) => {
    // Check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim()
        : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove the hashedPassword from the user object before returning it to the requester
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete specified user'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not find specified user'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Ping handler
handlers.ping = (data, callback) => {
    // Callback an http status code and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404)
};

module.exports = handlers;