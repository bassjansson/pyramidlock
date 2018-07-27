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

    socket.on('lp-factor', (factor) =>
    {
        console.log('Received lowpass factor: ', factor);

        if (factor >= 0 && factor < 1)
            pole = factor;
    });

    socket.on('db-smooth', (smooth) =>
    {
        console.log('Received decibel smoothing: ', smooth);

        if (smooth >= 0 && smooth < 1)
            dBsmooth = smooth;
    });

    socket.on('db-range', (range) =>
    {
        console.log('Received decibel range: ', range);

        if (range >= 0 && range <= 200)
            dBrange = range;
    });
});


//===================================//
//========== Arduino Setup ==========//
//===================================//

/*
arduino.receiveSensorData((sensorData) =>
{
    console.log('Sending arduino sensor data: ', sensorData);

    io.sockets.emit('sensor-data', sensorData);
});
*/


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

const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 1024;
const BIT_DEPTH = 16;
const SIGNED_INT = true;
const CHANNELS = 1;
const MAX_VALUE = 32768; // 16 bit signed integer max

const Mic = require('mic');

const mic = Mic({
    rate: SAMPLE_RATE,
    bufferSize: BUFFER_SIZE, // custom option
    bitwidth: BIT_DEPTH,
    encoding: SIGNED_INT ? 'signed-integer' : 'unsigned-integer',
    channels: CHANNELS,
    device: 'hw:1,0' // USB soundcard mic
});

let micInputStream = mic.getAudioStream();

let pole = 0.95;
let lowpass = 0;

let dBlow = 0;
let dBhigh = 0;

let dBsmooth = 0;
let dBrange = 100;

// RMS range 0 to 1
// dB range 0 to 255
function rmsToDb(rms)
{
    let db = (Math.log10(rms) * 20 + dBrange) * 255 / dBrange;

    if (db < 0) db = 0;
    if (db > 255) db = 255;

    return db;
}

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
    });

    RMSlow = Math.sqrt(RMSlow / data.length * 2);
    RMShigh = Math.sqrt(RMShigh / data.length * 2);

    dBlow = dBlow * dBsmooth + rmsToDb(RMSlow) * (1 - dBsmooth);
    dBhigh = dBhigh * dBsmooth + rmsToDb(RMShigh) * (1 - dBsmooth);
});

mic.start();

setTimeout(function () {
    setInterval(function () {
        arduino.sendControlData({
            control: 100, // RMS control value
            data: [Math.floor(dBlow), Math.floor(dBhigh)]
        });
    }, 40);
}, 2000);


//====================================//
//========== Speaker Output ==========//
//====================================//

const Speaker = require('speaker');

const speaker = new Speaker({
    sampleRate: SAMPLE_RATE,
    samplesPerFrame: BUFFER_SIZE,
    bitDepth: BIT_DEPTH,
    signed: SIGNED_INT,
    channels: CHANNELS,
    device: 'hw:0,0' // onboard speaker jack
});

micInputStream.pipe(speaker);
