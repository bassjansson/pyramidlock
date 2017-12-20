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

// Hue slider handling
var slider = document.getElementById("hue-slider");

handleRgb(hslToRgb(0.5, 1.0, 0.5));

slider.oninput = function()
{
    handleRgb(hslToRgb(this.value / 100.0, 1.0, 0.5));
};

function handleRgb(rgb)
{
    document.body.style.backgroundColor = 'rgb(' + rgb.join(',') + ')';

    var controlData = {
        control: 200, // Color wipe
        data: rgb
    };

    console.log('Sending arduino control data: ', controlData);

    socket.emit('control-data', controlData);
}

function hslToRgb(h, s, l)
{
    var r, g, b;

    if (s == 0)
    {
        r = g = b = l; // achromatic
    }
    else
    {
        var hue2rgb = function hue2rgb(p, q, t)
        {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
