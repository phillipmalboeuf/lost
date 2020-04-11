console.log('Lost at Sea')

import json from 'json-complete'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import type { FunctionComponent } from 'react'
import { Boat } from './shapes/boat'
import { Map } from './shapes/map'
import { Wave } from './shapes/wave'
import { Island } from './shapes/island'
import { Button } from './interface/button'



// ws.onopen = function open() {
//   ws.send('something')
// }

const App: FunctionComponent<{}> = () => {
  const ws = new WebSocket('ws://localhost:8088')
  
  const [map, setMap] = useState()
  const [boat, setBoat] = useState()

  useEffect(() => {
    ws.onmessage = function incoming({ data }) {
      const { event, body } = json.decode(data);
      
      ({
        newMap: () => setMap(body),
        newBoat: () => setBoat(body)
      }[event])()
    }
  }, [])

  function newMap() {
    ws.send(json.encode({
      event: 'newMap',
      body: {

      }
    }))
  }

  return <>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h1>Lost at Sea</h1>
    </div>

    {!map && <>
      <Button onClick={newMap}>Create a New Map</Button>
    </>}

    {map && !boat && <>
      {console.log(map)}
    </>}
    
    {map && boat && <Map speed={400}>
      <Boat />
      <Island lat={400} lng={400} />
      {/* {new Array(33).fill(null).map((v, i) => <Wave key={`wave_${i}`} lat={(Math.random() * 1600) - 800} lng={(Math.random() * 1600) - 800} />)} */}
    </Map>}
  </>
}


ReactDOM.render(<App />, document.getElementById('app'))