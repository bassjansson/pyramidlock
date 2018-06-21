'use strict'

// Import React
import React from 'react'
import ReactDOM from 'react-dom'

// Import Peer Handler
import PeerHandler from './peer-handler'

// Main app component
class App extends React.Component
{
    constructor(props)
    {
        super(props)

        this.peerHandler = new PeerHandler()
    }

    render()
    {
        return (
            <div>
                Hello World!
            </div>
        )
    }
}

// Render app in root element
ReactDOM.render(<App/>, document.getElementById('app'))
