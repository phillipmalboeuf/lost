import polka from 'polka'
import WebSocket from 'ws'
import json from 'json-complete'

import contentful from './clients/contentful'

import { Boat } from './models/boat'
import { Map } from './models/map'


// polka()
//   .get('/', (req, res) => {
//     res.end('Lost at Sea')
//   }).listen(8089, err => {
//     if (err) throw err
//     console.log(`> Running on localhost:8089`)
//   })


const wss = new WebSocket.Server({
  port: 8088
}, () => {
  console.log(`> Running on localhost:8088`)
})

const events = {
  newMap: async () => {
    return await Map.createOne({})
  },
  newBoat: async ({ name, map_id }) => {
    return {
      ...await Boat.createOne({ name, map_id }),
      map_id
    }
  },
  fetchBoat: async ({ _id }) => {
    return await Boat.one({ _id })
  },
  listCrewMembers: async () => {
    return (await contentful.getEntries({ content_type: 'crewMember' })).items
  }
}

wss.on('connection', function connection(ws) {  
  ws.on('message', async function incoming(message) {
    const { event, body } = json.decode(message)
    const response = await events[event](body)
    ws.send(json.encode({
      event,
      body: response
    }))
  })

  // Boat.watch({}).then(stream => {
  //   stream.on('change', ({ fullDocument }) => {
  //     ws.send(json.encode({
  //       event: 'boatChange',
  //       data: fullDocument
  //     }))
  //   })
  // })
})