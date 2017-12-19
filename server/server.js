// Initialize server constants
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

// Serve index HTML file
app.get('/', (req, res) =>
{
    res.sendFile('index.html',
    {
        root: __dirname
    });
});

// Start listening on the server port
server.listen(port, () =>
{
    console.log(`listening on *:${port}`);
});

// Connection established with client
io.on('connection', (socket) =>
{
    console.log('a user connected');

    /**
     * Socket listener to determine whether or not to send HIGH / LOW
     * values to Arduino.
     */
    /*
    socket.on('message', (msg) =>
    {
        console.log('Message received: ', msg);
        switch (msg)
        {
            case 'on':
                serial.write(HIGH);
                break;
            case 'off':
                serial.write(LOW);
                break;
            default:
                break;
        }
    });
    */

    /*
    io.sockets.emit('open');
    io.sockets.emit('data-byte-0', data[0]);
    io.sockets.emit('close');
    */
});

// Initialize arduino communication
const Arduino = require('./arduino.js');
const arduino = new Arduino('/dev/ttyACM0');

arduino.registerEvents(function(sensor, value)
{
    document.getElementById('messages').innerHTML +=
        `Sensor "${sensor}" changed to value "${value}". <br>`;
});
