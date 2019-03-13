var ejs =  require('ejs');
//let template = ejs.compile(str, options);
var fs = require('fs');

var request = require('request');

var options = {
	url: 'http://193.138.246.2:5000/',
	    path: '/',
	    method: 'GET',
	    json:true,
	timeout:500
}
request(options, function(error, response, body){
	    if(error) console.log(error);
	    if (response && response.statusCode && response.statusCode =='200' ) {  
		    console.log(body);
		    console.log(JSON.parse(JSON.stringify(response.body)).scan);
	    }
});



/*
request('http://193.138.246.2:5000/', function (error, response, body) {
	  console.log('error:', error); // Print the error if one occurred
	  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	  console.log('body:', body); // Print the HTML for the Google homepage.
});
*/
