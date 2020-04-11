console.log('Lost at Sea')

import json from 'json-complete'
import React from 'react'
import ReactDOM from 'react-dom'
import type { FunctionComponent } from 'react'
import { Boat } from './shapes/boat'
import { Map } from './shapes/map'
import { Wave } from './shapes/wave'
import { Island } from './shapes/island'

// const ws = new WebSocket('ws://localhost:8088')

// ws.onopen = function open() {
//   ws.send('something')
// }

// ws.onmessage = function incoming({ data }) {
//   console.log(json.decode(data))
// }

const App: FunctionComponent<{}> = () => {
  return <>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h1>Lost at Sea</h1>
    </div>
    
    <Map>
      <Boat />
      <Island lat={400} lng={400} />
      {/* {new Array(33).fill(null).map((v, i) => <Wave key={`wave_${i}`} lat={(Math.random() * 1600) - 800} lng={(Math.random() * 1600) - 800} />)} */}
    </Map>
  </>
}


ReactDOM.render(<App />, document.getElementById('app'))