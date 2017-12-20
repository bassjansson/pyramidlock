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
const arduino = new Arduino('/dev/cu.usbmodem14241');
//const arduino = new Arduino('/dev/ttyACM0');


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

    socket.on('control-data', (controlData) =>
    {
        console.log('Arduino control data received: ', controlData);

        arduino.sendControlData(controlData.control, controlData.data);
    });
});

/*
io.sockets.emit('open');
io.sockets.emit('data', data);
io.sockets.emit('close');
*/
