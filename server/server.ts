import polka from 'polka'
import WebSocket from 'ws'
import json from 'json-complete'

import contentful from './clients/contentful'

import { Boat } from './models/boat'
import { Map } from './models/map'
import { Crew, Stats } from './models/crew'
import { Obstacle, ObstacleContent } from './models/obstacle'
import { distanceBetween } from '../helpers/geometry'


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
    return await Map.createOne({
      distance: 60000,
      island_count: 30
    })
  },
  fetchMap: async ({ _id }) => {
    return Map.one({ _id })
  },
  newBoat: async ({ name, map_id }) => {
    return {
      ...await Boat.createOne({ name, map_id, gold: 5, position: { lat: 0, lng: 0 } }),
      map_id
    }
  },
  watchBoat: async ({ _id }, ws: WebSocket) => {
    Boat.watch({ 'documentKey._id': _id }).then(stream => {
      stream.on('change', async (change) => {
        ws.send(json.encode({
          event: 'watchBoat',
          body: change.fullDocument
        }))
      })

      // ws.on('close', () => stream.close())
    })

    return Boat.one({ _id })
  },
  watchCrew: async ({ boat_id }, ws: WebSocket) => {
    Crew.watch({ 'fullDocument.boat_id': boat_id }).then(stream => {
      stream.on('change', async (change) => {
        ws.send(json.encode({
          event: 'watchCrew',
          body: await Crew.list({ boat_id })
        }))
      })

      // ws.on('close', () => stream.close())
    })

    return Crew.list({ boat_id })
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

    const map = await Map.one({ _id: boat.map_id })
    
    let at_port = false
    if (!boat.at_port) {
      at_port = !!map.islands.filter(island => island.port).find(island => {
        return distanceBetween(position, island.position) < 1000
      })
    }

    return Boat.updateOne({ _id: boat_id }, {
      position,
      at_port,
      current_obstacle_id: !at_port ? (await Obstacle.createOne({
        boat_id,
        trigger,
        content_id: content.items[0].sys.id
      }))._id : undefined,
      triggers: [...(boat.triggers ?? []), trigger]
    })
  },
  watchObstacle: async ({ _id }, ws: WebSocket) => {
    const obstacle = await Obstacle.one({ _id })

    Obstacle.watch({ 'documentKey._id': _id }).then(stream => {
      stream.on('change', async (change) => {
        ws.send(json.encode({
          event: 'watchObstacle',
          body: change.fullDocument
        }))
      })

      // ws.on('close', () => stream.close())
    })

    return {
      ...obstacle,
      content: await contentful.getEntry(obstacle.content_id)
    }
  },
  fetchObstacleContent: async ({ _id }) => {
    const obstacle = await Obstacle.one({ _id })
    return contentful.getEntry(obstacle.content_id)
  },
  contribute: async ({ obstacle_id, crew_id, stat }) => {
    Obstacle.updateOne({ _id: obstacle_id }, { [`contributions.${crew_id}.${stat}`]: 1 }, '$inc')
    return Crew.updateOne({ _id: crew_id }, { [stat]: -1 }, '$inc')
  },
  overcome: async ({ obstacle_id }) => {
    const obstacle = await Obstacle.one({ _id: obstacle_id })
    const content = await contentful.getEntry<ObstacleContent>(obstacle.content_id)

    if (content.fields.money) {
      Boat.updateOne({ _id: obstacle.boat_id }, {
        gold: Math.round(Math.random() * content.fields.money) + content.fields.money
      }, '$inc')  
    }

    if (content.fields.loseSleep) {
      Crew.updateMany({ boat_id: obstacle.boat_id }, { slept: 1 })
    }

    return Boat.updateOne({ _id: obstacle.boat_id }, { current_obstacle_id: undefined })
  },
  recover: async ({ crew_id, stat }) => {
    return Crew.updateOne({ _id: crew_id }, { [stat]: 1, slept: -1 }, '$inc')
  },
  buy: async ({ crew_id, stat }) => {
    const member = await Crew.updateOne({ _id: crew_id }, { [stat]: 1 }, '$inc')
    Boat.updateOne({ _id: member.boat_id }, { gold: -1 }, '$inc')
    return member
  },
  leavePort: async ({ boat_id }) => {
    return Boat.updateOne({ _id: boat_id }, { at_port: false })
  },
}

wss.on('connection', function connection(ws) {
  async function incoming(message) {
    const { event, body } = json.decode(message)
    console.log(event, body)
    
    const response = await events[event](body, ws)
    ws.send(json.encode({
      event,
      body: response
    }))
  }

  ws.on('message', incoming)

  // ws.on('close', () => {
  //   ws.off('message', incoming)
  // })
})
