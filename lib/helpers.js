/*
* Helpers for various tasks
*
*/

// Dependencies
let crypto = require('crypto');
let config = require('./config');

// Container for all the Helpers
let helpers = {};

// Create a SAH256 hash
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, wihtout throwing
helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
}

// Export the module
module.exports = helpers;