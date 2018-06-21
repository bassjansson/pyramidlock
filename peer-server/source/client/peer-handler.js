'use strict'

import io from 'socket.io-client'
import Peer from 'peerjs'

export default class PeerHandler
{
    constructor(options)
    {
        options = options || {}
        options.id = options.id || Math.random().toString(36).substr(2, 8)
        options.host = options.host || location.hostname
        options.port = options.port || 8080

        // Socket to server
        this.socket = io(`${options.host}:${options.port}`)
        this.socket.on('user-connected', id => console.log(`Server:  User '${id}' connected`))
        this.socket.on('user-disconnected', id => console.log(`Server:  User '${id}' disconnected`))

        // Connect as peer
        console.log(`Connecting as user '${options.id}'`)
        this.peer = new Peer(options.id,
        {
            host: options.host,
            port: options.port,
            path: '/peer',
            debug: true
        })
        this.peer.on('open', id => console.log(`Connected as user '${id}'`))
    }
}
