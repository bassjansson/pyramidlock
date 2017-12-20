//==============================================//
//========== Private Shared Constants ==========//
//==============================================//

const SerialPort = require('serialport');
const BAUD_RATE = 9600;
const DATA_DELIMITER = ',';
const DATA_ENDLINE = '\n';
const OPEN_TIMEOUT = 2000;


//=================================//
//========== Constructor ==========//
//=================================//

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

    this.serial.on('open', () =>
    {
        console.log('Serial port ' + this.port + ' opened!');
    });

    this.serial.on('close', () =>
    {
        console.log('Serial port ' + this.port + ' closed.');

        this.open();
    });

    this.open();
}


//==========================//
//========== Open ==========//
//==========================//

Arduino.prototype.open = function()
{
    console.log('Trying to open arduino serial port ' + this.port + '.');

    this.serial.open((error) =>
    {
        if (error) setTimeout(() =>
        {
            this.open();
        }, OPEN_TIMEOUT);
    });
};


//=======================================//
//========== Send Control Data ==========//
//=======================================//

Arduino.prototype.sendControlData = function(control, data)
{
    var dataString = control.toString();

    data.forEach(function(value)
    {
        dataString += DATA_DELIMITER + value.toString();
    });

    dataString += DATA_ENDLINE;

    console.log('Sending arduino control data on serial port ' + this.port + ' as string: ', dataString);

    this.serial.write(dataString);
};


/*
Arduino.prototype.registerEvents = function(onSensorValue)
{
    console.log('Registering events of arduino serial port ' + this.port + '.');

    this.parser.on('data', (data) =>
    {
        //console.log('Serial port ' + this.port + ' received data: ', data);

        var stringArray = data.split(SEPARATOR);
        var sensor = parseInt(stringArray[0]);
        var value = parseFloat(stringArray[1]);

        onSensorValue(sensor, value);
    });
};
*/


//==================================//
//========== Export Class ==========//
//==================================//

module.exports = Arduino;
