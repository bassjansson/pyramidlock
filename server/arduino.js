// Private shared constants
const SerialPort = require('serialport');
const BAUD_RATE = 9600;
const SEPARATOR = ' ';

// Constructor
function Arduino(port)
{
    console.log('Initializing arduino serial communication on port ' + port + '.');

    this.port = port;

    this.serial = new SerialPort(this.port,
    {
        baudRate: BAUD_RATE,
        autoOpen: false
    });

    this.parser = this.serial.pipe(new SerialPort.parsers.Readline());

    this.open();
}

// Register events method
Arduino.prototype.registerEvents = function(onSensorValue)
{
    console.log('Registering events of arduino serial port ' + this.port + '.');

    this.serial.on('open', () =>
    {
        console.log('Serial port ' + this.port + ' opened!');
    });

    this.serial.on('close', () =>
    {
        console.log('Serial port ' + this.port + ' closed.');

        this.open();
    });

    this.parser.on('data', (data) =>
    {
        //console.log('Serial port ' + this.port + ' received data: ', data);

        var stringArray = data.split(SEPARATOR);
        var sensor = parseInt(stringArray[0]);
        var value = parseFloat(stringArray[1]);

        onSensorValue(sensor, value);
    });
};

// Open method
Arduino.prototype.open = function()
{
    console.log('Trying to open arduino serial port ' + this.port + '.');

    this.serial.open((error) =>
    {
        if (error) setTimeout(() =>
        {
            this.open();
        }, 2000);
    });
}

// Export class
module.exports = Arduino;
