// Initialize server constants
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

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
    console.log('A user connected!');

    /*
    socket.on('message', (msg) =>
    {
        arduino.write(msg);
    }
    */
});

/*
io.sockets.emit('open');
io.sockets.emit('data', data);
io.sockets.emit('close');


// Initialize arduino communication
const Arduino = require('./arduino.js');
const arduino = new Arduino('/dev/ttyACM0');

arduino.registerEvents(function(sensor, value)
{
    document.getElementById('messages').innerHTML +=
        `Sensor "${sensor}" changed to value "${value}". <br>`;
});
*/
