'use strict'

const ExpressPeerServer = require('peer').ExpressPeerServer
const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.use(express.static('public'))

const server = app.listen(port)
const io = require('socket.io').listen(server)

console.log(`Listening on port ${port}.`)

const peerServer = ExpressPeerServer(server,
{
    debug: true
})

app.use('/peer', peerServer)

peerServer.on('connection', id =>
{
    io.emit('user-connected', id)
    console.log(`User '${id}' connected`)
})

peerServer.on('disconnect', id =>
{
    io.emit('user-disconnected', id)
    console.log(`User '${id}' disconnected`)
})
