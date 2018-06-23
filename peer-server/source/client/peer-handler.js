'use strict'

import io from 'socket.io-client'
import Peer from 'peerjs'

export default class PeerHandler
{
    constructor(options)
    {
        // Process options
        options = options || {}

        options.host = options.host || location.hostname
        options.port = options.port || 8080

        // Create user info
        this.userInfo = {
            id: Math.random().toString(36).substr(2, 8),
            info: {
                name: options.userName || "Anonymous"
            }
        }

        // Create socket to server
        this.socket = io(`${options.host}:${options.port}`)

        // Create peer connection
        this.peer = new Peer(this.userInfo.id,
        {
            host: options.host,
            port: options.port,
            path: '/peer',
            debug: true
        })

        // Socket callbacks
        this.socket.on('reconnect', () =>
        {
            if (this.peer.disconnected)
                this.peer.reconnect()
        })

        // Peer callbacks
        this.peer.on('open', id =>
        {
            console.log(`Connected to peer server with id '${id}'`)

            this.userInfo.id = id

            this.socket.emit('user-info', this.userInfo)
        })

        this.peer.on('disconnected', () =>
            console.log(`Connection to peer server lost...`))
    }
}
