'use strict'

import io from 'socket.io-client'
import Peer from 'peerjs'

export default class PeerHandler
{
    constructor(options)
    {
        options = options || {}

        options.host = options.host || location.hostname
        options.port = options.port || 8080

        options.userName = options.userName || "Guest"

        // Create user id
        this.userId = Math.random().toString(36).substr(2, 8)

        // Create socket to server
        this.socket = io(`${options.host}:${options.port}`)

        // Create peer
        this.peer = new Peer(this.userId,
        {
            host: options.host,
            port: options.port,
            path: '/peer',
            debug: true
        })

        // Callbacks
        this.socket.on('reconnect', () =>
        {
            if (this.peer.disconnected)
                this.peer.reconnect()
        })

        this.peer.on('open', id =>
        {
            this.userId = id

            console.log(`Connected to peer server with id '${this.userId}'`)

            this.socket.emit('user-info',
            {
                id: this.userId,
                info: {
                    name: options.userName
                }
            })
        })

        this.peer.on('disconnected', () =>
            console.log(`Connection to peer server lost...`))
    }
}
