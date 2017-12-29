// Initialize socket.io
const socket = io();

// Sensor data list
var sensorDataList = document.getElementById("sensor-data-list");

// Socket.io listeners
socket.on('sensor-data', (sensorData) =>
{
    console.log('Received arduino sensor data: ', sensorData);

    sensorDataList.innerHTML =
        sensorData.sensor + " - " +
        sensorData.data.toString() + "<br>" +
        sensorDataList.innerHTML;
});

// Slider handling
var phaseFreqSlider = document.getElementById("phase-freq-slider");
var hueFreqSlider = document.getElementById("hue-freq-slider");

phaseFreqSlider.oninput = function()
{
    var phaseFreq = Math.floor(Math.pow(2.0, this.value / 50.0 - 10.0) * 1000.0);

    console.log('Sending phase frequency: ', phaseFreq);

    socket.emit('phase-freq', phaseFreq);
};

hueFreqSlider.oninput = function()
{
    var hueFreq = Math.floor(Math.pow(2.0, this.value / 50.0 - 10.0) * 1000.0);

    console.log('Sending hue frequency: ', hueFreq);

    socket.emit('hue-freq', hueFreq);
};

// Radio button handling
function onControlChange(control)
{
    socket.emit('led-control', control);
}

// Send default values
socket.emit('led-control', 202);
socket.emit('phase-freq', 100.0);
socket.emit('hue-freq', 100.0);
