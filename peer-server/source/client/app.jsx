'use strict'

// Import React
import React from 'react'
import ReactDOM from 'react-dom'

// Main app component
class App extends React.Component
{
    constructor(props)
    {
        super(props)
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
