var SerialPort = require("serialport");
var data = {'state': 0};


var serialPort = new SerialPort(port, {
  baudrate: 115200,
  parser: SerialPort.parsers.readline('\r\n'),
});

serialPort.on('open', function() {
  console.log('Serial port Open');
  serialPort.on('data', function(buffer) { data.buffer = buffer, data.state = 1 });
});

function readConfig(cmd, paramNb) {
  var cmd = String.fromCharCode(cmd);
  var param = String.fromCharCode(paramNb);
  if (serialPort.isOpen() == true) {
    serialPort.write(cmd + param + '\n', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  }
  return data;
};

