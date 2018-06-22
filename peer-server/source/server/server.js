'use strict'

// Create express peer server
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const server = app.listen(port)
const io = require('socket.io').listen(server)
const peerServer = require('peer').ExpressPeerServer(server, { debug: true })

app.use(express.static('public'))
app.use('/peer', peerServer)

console.log(`\nListening on port ${port}\n`)


// Users
let users = []


// Client connections with server
io.on('connection', socket =>
{
    // Log client connection and disconnection
    console.log(`[${socket.id}] Client connected`)

    socket.on('disconnect', reason =>
        console.log(`[${socket.id}] Client disconnected, reason: ${reason}`))

    // Add user info to connected user
    socket.on('user-info', userInfo =>
    {
        let user = users.find(user => user.id === userInfo.id)

        if (user)
        {
            user.info = userInfo.info

            console.log(`[${user.id}] User info added with name '${user.info.name}'`)
        }
        else
            console.error(`[${userInfo.id}][ERROR] Given user id does not match any connected user...`)
    })

    socket.emit('reconnect')
})


// User connections with peer server
peerServer.on('connection', userId =>
{
    if (users.findIndex(user => user.id === userId) === -1)
        users.push({ id: userId })
    else
        console.error(`[${userId}][ERROR] Given user id is already in use by another user...`)

    console.log(`[${userId}] User connected to peer server`)
})

peerServer.on('disconnect', userId =>
{
    users = users.filter(user => user.id !== userId)

    console.log(`[${userId}] User disconnected from peer server`)
})
