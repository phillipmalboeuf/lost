import polka from 'polka'
import WebSocket from 'ws'
import json from 'json-complete'

import contentful from './clients/contentful'

import { Boat } from './models/boat'
import { Map } from './models/map'
import { Crew, Stats } from './models/crew'
import { Obstacle } from './models/obstacle'


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
    const [boat, crew] = await Promise.all([
      Boat.one({ _id }),
      Crew.list({ boat_id: _id })
    ])
    return {
      ...boat,
      crew
    }
  },
  watchBoat: async ({ _id }, ws: WebSocket) => {
    Boat.watch({ 'documentKey._id': _id }).then(stream => {
      stream.on('change', (change) => {
        ws.send(json.encode({
          event: 'watchBoat',
          data: change.fullDocument
        }))
      })

      ws.onclose = () => stream.close()
    })
  },
  watchCrew: async ({ boat_id }, ws: WebSocket) => {
    
    Crew.watch({ 'fullDocument.boat_id': boat_id }).then(stream => {
      stream.on('change', async (change) => {
        ws.send(json.encode({
          event: 'watchCrew',
          body: await Crew.list({ boat_id })
        }))
      })

      ws.onclose = () => stream.close()
    })
  },
  newCrew: async ({ name, content_id, boat_id }) => {
    const { fields: { bravery, intelligence, charm, dexterity } } = await contentful.getEntry<Stats>(content_id)
    return await Crew.createOne({ name, content_id, boat_id, bravery, intelligence, charm, dexterity })
  },
  listCrewMembers: async () => {
    return (await contentful.getEntries({ content_type: 'crewMember' })).items
  },
  onward: async ({ position, boat_id }) => {

    const trigger = Math.round(Math.random() * 12) + 1

    const [boat, content] = await Promise.all([
      Boat.one({ _id: boat_id }),
      contentful.getEntries({ content_type: 'obstacle', 'fields.trigger': trigger })
    ])
    
    const obstacle = await Obstacle.createOne({
      boat_id,
      trigger,
      content_id: content.items[0].sys.id
    })

    return Boat.updateOne({ _id: boat_id }, {
      position,
      current_obstacle_id: obstacle._id,
      triggers: [...(boat.triggers ?? []), trigger]
    })
  }
}

wss.on('connection', function connection(ws) {  
  ws.on('message', async function incoming(message) {
    const { event, body } = json.decode(message)
    const response = await events[event](body, ws)
    ws.send(json.encode({
      event,
      body: response
    }))
  })
})