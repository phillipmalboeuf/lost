console.log('Lost at Sea')

import json from 'json-complete'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import type { FunctionComponent } from 'react'
import type { Entry } from 'contentful'

import { Boat } from './shapes/boat'
import { Map } from './shapes/map'
import { Wave } from './shapes/wave'
import { Island } from './shapes/island'
import { Button } from './interface/button'
import { Title } from './interface/text'
import { Input } from './interface/input'



// ws.onopen = function open() {
//   ws.send('something')
// }


const App: FunctionComponent<{}> = () => {
  const ws = new WebSocket('ws://localhost:8088')

  const [map, setMap] = useState({ _id: 'id' })
  const [boat, setBoat] = useState<{ name: string }>()
  const [crew, setCrew] = useState<Entry<{ title: string }>[]>()

  useEffect(() => {
    ws.onmessage = function incoming({ data }) {
      const { event, body } = json.decode(data)
      return ({
        newMap: () => setMap(body),
        newBoat: () => setBoat(body),
        boatChange: () => setBoat(body),
        listCrewMembers: () => setCrew(body)
      }[event])()
    }
  }, [])

  function send(event: string, body?: object) {
    ws.send(json.encode({
      event,
      body
    }))
  }

  function newMap() {
    send('newMap', {})
  }

  function newBoat(name: string) {
    send('newBoat', { name })
    send('listCrewMembers')
  }

  return <>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Title>Lost at Sea</Title>

      {!map && <>
        <Button onClick={newMap}>Create a New Map</Button>
      </>}

      {map && !boat && <form onSubmit={e => {
        e.preventDefault()
        newBoat(e.currentTarget['boatname'].value)
      }}>
        <label htmlFor='name'>Name your boat</label>
        <Input name='boatname' />
        <Button>Anchor Away!</Button>
      </form>}

      {boat && boat.name}
      {boat && crew && <ul>
        {crew.map(member => <li key={member.sys.id}>{member.fields.title}</li>)}  
      </ul>}
    </div>

    
    {map && <Map speed={400}>
      {boat && <Boat />}
      <Island lat={400} lng={400} />
      {/* {new Array(33).fill(null).map((v, i) => <Wave key={`wave_${i}`} lat={(Math.random() * 1600) - 800} lng={(Math.random() * 1600) - 800} />)} */}
    </Map>}
  </>
}


ReactDOM.render(<App />, document.getElementById('app'))