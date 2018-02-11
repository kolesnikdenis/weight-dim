    var port = require("serialport");
    const Readline = port.parsers.Readline;
    var port1 = new port("/dev/ttyUSB0", {
      baudrate: 1200, autoOpen: false 
    });
port1.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }
 
  // Because there's no callback to write, write errors will be emitted on the port:
  port1.write('main screen turn on');
});
const Hoek = require('hoek');

// The open event is always emitted
port1.on('open', function() {
  // open logic
console.log("opeeeeen");
	port1.on('data', function(data) {
        console.log('data received: ' + data);
      });
});
