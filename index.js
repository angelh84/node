const http = require('http');

const server = http.createServer((req, res) => {
    // data emit event
    req.on('data', data => {});

    // request end event
    req.on('end', () => {
        router.hello((statusCode, payload) => {
            //  Covert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
})

// Router that assigns pathname handlers
let router = {
    hello: (callback) => {
        callback(200, {'message' : 'Hello there, Pirple!'});
    }
};

// Start the server
server.listen(3000, () => {
    console.log('The server is listening on port 3000 now')
});