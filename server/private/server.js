//====================================//
//========== Server Objects ==========//
//====================================//

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;


//=====================================//
//========== Arduino Objects ==========//
//=====================================//

const Arduino = require('./arduino.js');
//const arduino = new Arduino('/dev/cu.usbmodem14241');
const arduino = new Arduino('/dev/ttyACM0');


//=========================//
//========== HSL ==========//
//=========================//

const hslToRgb = require('../public/hsl.js');

var controlData = {
    control: 202, // Rainbow
    data: [-1.0, -1.0]
};


//==================================//
//========== Server Setup ==========//
//==================================//

// Serve the public directory
app.use(express.static('public'));

// Start listening on the server port
server.listen(port, () =>
{
    console.log(`Listening on port ${port}!`);
});

// Connection established with client
io.on('connection', (socket) =>
{
    console.log('A client connected!');

    socket.on('phase-freq', (phaseFreq) =>
    {
        console.log('Received phase frequency: ', phaseFreq);

        controlData.data[0] = phaseFreq;

        arduino.sendControlData(controlData);
    });

    socket.on('hue-freq', (hueFreq) =>
    {
        console.log('Received hue frequency: ', hueFreq);

        controlData.data[1] = hueFreq;

        arduino.sendControlData(controlData);
    });

    socket.on('led-control', (control) =>
    {
        console.log('Received LED control: ', control);

        controlData.control = control;

        arduino.sendControlData(controlData);
    });
});


//===================================//
//========== Arduino Setup ==========//
//===================================//

arduino.receiveSensorData((sensorData) =>
{
    console.log('Sending arduino sensor data: ', sensorData);

    io.sockets.emit('sensor-data', sensorData);
});


//==========================================//
//========== Youtube Audio Stream ==========//
//==========================================//

const stream = require('youtube-audio-stream');
const url = 'https://www.youtube.com/watch?v=2HzTdmeSgjU';
const Decoder = require('lame').Decoder;
const Speaker = require('speaker');

var decoder = Decoder();
var speaker = new Speaker();

stream(url).pipe(decoder).pipe(speaker);
