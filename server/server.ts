import polka from 'polka'
import WebSocket from 'ws'
import json from 'json-complete'

import { Boat } from './models/boat'



polka()
  .get('/', (req, res) => {
    res.end('Lost at Sea')
  }).listen(8089, err => {
    if (err) throw err
    console.log(`> Running on localhost:3000`)
  })


const wss = new WebSocket.Server({
  port: 8088
})

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })

  ws.send(json.encode('something'))

  Boat.watch({}).then(stream => {
    stream.on('change', ({ fullDocument }) => {
      ws.send(json.encode(fullDocument))
    })
  })
})