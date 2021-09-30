// server.js
// where your node app starts
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes.js');

const app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Middleware to protect our routes from non auth trello users

// Our routes for handling saved db data
routes(app);

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

