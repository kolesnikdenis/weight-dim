// ================================================================
// get all the tools we need
// ================================================================
var express = require('express');
var session = require('express-session');
var request = require('request');
global.api_key="AIzaSyDPo7UL2B9sxTrqB5QQfavKz4CGcbgTvBo";

var routes = require('./routes/index.js');
var port = process.env.PORT || 3334;
var app = express();
// ================================================================
// setup our express application
// ================================================================
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: "sss",
    resave: true,
    saveUninitialized: true
}));

// ================================================================
// setup routes
// ================================================================
routes(app);
// ================================================================
// start our server
// ================================================================
app.listen(port, function() {
 console.log('Server listening on port ' + port + '..');
});
