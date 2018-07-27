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

/*
const stream = require('youtube-audio-stream');
const url = 'https://www.youtube.com/watch?v=2HzTdmeSgjU';
const Decoder = require('lame').Decoder;
const Speaker = require('speaker');

var decoder = Decoder();
var speaker = new Speaker();

stream(url).pipe(decoder).pipe(speaker);
*/


//======================================//
//========== Microphone Input ==========//
//======================================//

const Mic = require('mic');
const MAX_VALUE = 32768;

const mic = Mic({
    rate: 44100,
    bitwidth: 16,
    channels: 1,
    encoding: 'signed-integer',
    device: 'hw:1,0', // USB soundcard mic
    bufferSize: 1024 // custom option
});

let micInputStream = mic.getAudioStream();

let pole = 0.95;
let lowpass = 0;

let low = 0;
let high = 0;

micInputStream.on('data', data =>
{
    let value = 0;
    let RMSlow = 0;
    let RMShigh = 0;

    data.forEach((item, index) =>
    {
        if (index % 2)
        {
            value += item << 8;
            value /= MAX_VALUE;

            if (value > 1.0)
                value -= 2.0;

            lowpass = value * (1 - pole) + lowpass * pole;
            let highpass = value - lowpass;

            RMSlow += lowpass * lowpass;
            RMShigh += highpass * highpass;
        }
        else
        {
            value = item;
        }
    })

    RMSlow = Math.sqrt(Math.sqrt(RMSlow / data.length * 2) * 20.0) * 255;
    RMShigh = Math.sqrt(Math.sqrt(RMShigh / data.length * 2) * 20.0) * 255;

    if (RMSlow > 255) RMSlow = 255;
    if (RMShigh > 255) RMShigh = 255;

    low = low * 0.6 + RMSlow * 0.4;
    high = high * 0.6 + RMShigh * 0.4;
});

mic.start();

setTimeout(function () {
    setInterval(function () {
        arduino.sendControlData({
            control: 100,
            data: [low, high]
        });
    }, 60);
}, 2000);


//====================================//
//========== Speaker Output ==========//
//====================================//

const Speaker = require('speaker');

const speaker = new Speaker({
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1,
    signed: true,
    device: 'hw:0,0', // onboard speaker jack
    samplesPerFrame: 1024
});

micInputStream.pipe(speaker);
