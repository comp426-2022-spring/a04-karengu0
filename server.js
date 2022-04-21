const db = require('./database.js')
const morgan = require('morgan')
const fs = require('fs')

/** Coin flip functions 

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */
function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
  }
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
  function coinFlips(flips) {
    let resultsArray = [];
    for (var i = 0; i < flips; i++) {
      let flip = coinFlip();
      resultsArray[i] = flip;
    }
    return resultsArray;
  }
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
  function countFlips(array) {
    let heads = 0;
    let tails = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i]=='heads') {
        heads++;
      } else if (array[i] == 'tails') {
        tails++;
      }
    }
    if (heads == 0) {
      return {"tails": tails};
    } else if (tails == 0) {
      return {"heads": heads};
    }
    return {"heads": heads, "tails": tails};
  }
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
  function flipACoin(call) {
    let flip = coinFlip();
    let result = "";
    if (flip = call) {
      result = "win";
    } else if (flip != call) {
      result = "lose";
    }
    return {"call": call, "flip": flip, "result": result};
  }

// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// Require Express.js
const express = require('express')
// See what is stored in the object produced by minimist
console.log(args)
const port = args.port || process.env.PORT || 5555

// Require Express.js
//const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true}))
app.use(express.json())

var argument = minimist(process.argv.slice(2))
var name = 'port'
const HTTP_PORT = argument[name] || 5000

// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});

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

//log
if (args.log == true) {
    const accessLog = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('combined', {stream:accessLog}))
}

//middleware
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers["referer"],
        useragent: req.headers["user-agent"]
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next();
})

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
    res.json({'flip': coinFlip()})
})

// Endpoint returning JSON of flip array & summary
app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.params.number)
    const count = countFlips(flips)
    res.statusCode = 200;
    res.json({'raw':flips,'summary':count})
})

// Endpoint that returns result of calling heads
app.get('/app/flip/call/heads', (req, res) => {
    const flipH = flipACoin(req.params.heads)
    res.statusCode = 200;
    res.json(flipH)
})

//Endpoint that returns the result of calling tails
app.get('/app/flip/call/tails', (req, res) => {
    const flipT = flipACoin(req.params.tails)
    res.statusCode = 200;
    res.json(flipT)
})

// Default endpoints
if (args.debug) {
    app.get('/app/log/access', (req, res) => {
        const stmt = db.prepare("SELECT * FROM accesslog".all());
        res.statusCode = 200;
        res.json = stmt;
    })
    app.get('/app/error', (req, res) => {
        throw new Error("Error Test Successful.");
    })
}

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})