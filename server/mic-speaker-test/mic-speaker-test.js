const Mic = require('mic')
const Speaker = require('speaker')

const mic = Mic({
    rate: 44100,
    bitwidth: 16,
    channels: 1,
    encoding: 'signed-integer',
    device: 'hw:1,0', // USB soundcard mic
    bufferSize: 1024 // custom option
})

const speaker = new Speaker({
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1,
    signed: true,
    device: 'hw:0,0', // onboard speaker jack
    samplesPerFrame: 1024
})

let micInputStream = mic.getAudioStream()

micInputStream.pipe(speaker)

mic.start()
