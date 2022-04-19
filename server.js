import { coinFlips, countFlips, coinFlip, flipACoin } from "./modules/coin.mjs";
import minimist from 'minimist'; // parses argument options
import express from 'express'; // minimal & flexible Node.js web application framework
                                // provides features for web & mobile applications
                                // Node.js: asynchronous event-driven JS runtime environemtn
                                // for scalable network applications

// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// See what is stored in the object produced by minimist
console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Require Express.js
//const express = require('express')
const app = express()

var argument = minimist(process.argv.slice(2))
var name = 'port'
const HTTP_PORT = argument[name] || 5000

// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});

// Check status code endpoint
app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    // Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, { 'Content-Type' : 'text/plain'});
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

// Endpoint returning JSON of flip function result
app.get('/app/flip/', (req, res) => {
    res.statusCode = 200;
    let aFlip = coinFlip()
    res.json({flip: aFlip})
    res.writeHead(res.statusCode, {'Content-Type' : 'application/json'});
})

// Endpoint returning JSON of flip array & summary
app.get('/app/flips/:number', (req, res) => {
    res.statusCode = 200;
    var number = req.params.number;
    let flips = coinFlips(number);
    let summary = countFlips(flips);
    res.json({raw: flips, summary: summary}) //json: way to transfer data
                                                // like a dictionary, key-->string
    res.writeHead(res.statusCode, {'Content-Type': 'application/json'});
})

// Endpoint that returns result of calling heads
app.get('/app/flip/call/heads', (req, res) => {
    res.statusCode = 200;
    let answer = flipACoin('heads')
    res.send(answer) //converts to plain text without using json
    res.writeHead(res.statusCode, {'Content-Type': 'text/plain'});
})

//Endpoint that returns the result of calling tails
app.get('/app/flip/call/tails', (req, res) => {
    res.statusCode = 200;
    let answer = flipACoin('tails')
    res.send(answer)
    res.writeHead(res.statusCode, {'Content-Type': 'text/plain'});
})

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});