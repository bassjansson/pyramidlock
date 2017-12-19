// Hue slider handling
var slider = document.getElementById("hue-slider");

setBackgroundColor(hslToRgb(0.5, 1.0, 0.5));

slider.oninput = function()
{
    setBackgroundColor(hslToRgb(this.value / 1000.0, 1.0, 0.5));
};

function setBackgroundColor(rgb)
{
    document.body.style.backgroundColor = 'rgb(' + rgb.join(',') + ')';
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

/*
// Initialize socket.io
const socket = io();

// Socket.io listeners
socket.on('open', () =>
{

});

socket.on('close', () =>
{

});

socket.on('data', (data) =>
{
    // To send message via socket.io, below are equivalent
    //socket.send('Hello!');
    //socket.emit('message', 'Hello!');
});
*/
