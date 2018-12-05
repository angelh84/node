/*
* Primary file for the API
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
let config = require('./lib/config');
let fs = require('fs');
let _data = require('./lib/data');
let handlers = require('./lib/handlers');
let helpers = require('./lib/helpers');


// Instantiate the HTTP server
let httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
});

// Start the server
httpServer.listen(config.httpPort, () => {
    console.log('The server is listening on port ' + config.httpPort)
});

// Instantiate the HTTPS server
let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log('The server is listening on port ' + config.httpsPort)
});

// All the server logic for both the http and https createServer
let unifiedServer = (req, res) => {
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    let method = req.method.toLowerCase();

    // Get the headers as an object
    let headers = req.headers;

    // Get the payload if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data)
    });
    req.on('end', () => {
        buffer += decoder.end()

        // Choose the handler this request should go to
        // if one is not found, use the notFound handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined'
            ? router[trimmedPath]
            : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code caleld back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number'
                ? statusCode
                : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object'
                ? payload
                : {};

            //  Covert the payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log('Request received on path: ' + trimmedPath)
            console.log('With this method: ' + method)
            console.log('With these query string parameters ', queryStringObject)
            console.log('With these headers: ', headers)
            console.log('With this payload: ', buffer)
            console.log('Returning this reponse: ', statusCode, payloadString)
        })
    });
};


// Define a request router
let router = {
    'ping': handlers.ping,
    'users': handlers.users
}