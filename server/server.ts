
import WebSocket, { Server, LostSocket } from 'ws'
import json from 'json-complete'

import { db } from './clients/mongo'
import contentful from './clients/contentful'

import { Boat } from './models/boat'
import { Map } from './models/map'
import { Crew, Stats } from './models/crew'
import { Obstacle, ObstacleContent, ObstacleDocument } from './models/obstacle'
import { distanceBetween } from '../helpers/geometry'


declare module 'ws' {
  type LostSocket = WebSocket & {
    boat: string
    obstacle: string
  }
}

const wss = new Server({
  port: 8088
}, () => {
  console.log(`> Running on localhost:8088`)
})


Boat.watch({ }).then(stream => {
  stream.on('change', async (change) => {
    wss.clients.forEach((ws: LostSocket) => {
      if (ws.boat === change.documentKey._id) {
        ws.send(json.encode({
          event: 'watchBoat',
          body: change.fullDocument
        }))
      }
    })
  })
})

Obstacle.watch({ }).then(stream => {
  stream.on('change', async (change) => {
    wss.clients.forEach((ws: LostSocket) => {
      if (ws.obstacle === change.documentKey._id) {
        ws.send(json.encode({
          event: 'watchObstacle',
          body: change.fullDocument
        }))
      }
    })
  })
})

Crew.watch({ }).then(stream => {
  stream.on('change', async (change) => {
    wss.clients.forEach(async (ws: LostSocket) => {
      if (ws.boat === change.fullDocument.boat_id) {
        ws.send(json.encode({
          event: 'watchCrewMember',
          body: change.fullDocument
        }))
      }
    })
  })
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
  watchBoat: async ({ _id }, ws: LostSocket) => {
    ws.boat = _id
    return Boat.one({ _id })
  },
  fetchCrew: async ({ boat_id }, ws: WebSocket) => {
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
      (await contentful.getEntries<ObstacleContent>({ content_type: 'obstacle', 'fields.trigger': trigger })).items[0]
    ])

    const map = await Map.one({ _id: boat.map_id })
    
    let at_port = false
    if (!boat.at_port) {
      at_port = !!map.islands.filter(island => island.port).find(island => {
        return distanceBetween(position, island.position) < 1000
      })
    }

    let current_obstacle_id: string
    if (!at_port) {
      current_obstacle_id = (await Obstacle.createOne({
        boat_id,
        trigger,
        content_id: content.sys.id
      }))._id

      if (content.fields.loseCrew) {
        const crew = await Crew.list({ boat_id })
        const randomCrew = Math.floor(Math.random() * crew.length)

        Crew.updateOne({ _id: crew[randomCrew]._id }, { lost: true })
      }
    }

    Boat.updateOne({ _id: boat_id }, {
      position,
      at_port,
      current_obstacle_id,
      triggers: [...(boat.triggers ?? []), trigger]
    })
  },
  watchObstacle: async ({ _id }, ws: LostSocket) => {
    ws.obstacle = _id
    const obstacle = await Obstacle.one({ _id })

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

    if (content.fields.loseCrew) {
      Crew.updateMany({ boat_id: obstacle.boat_id }, { lost: false })
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
    const response = await events[event](body, ws)
    ws.send(json.encode({
      event,
      body: response
    }))
  }

  ws.on('message', incoming)

  ws.on('close', () => {
    ws.off('message', incoming)
  })
})