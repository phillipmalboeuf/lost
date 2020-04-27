import json from 'json-complete'
import { useState, useEffect } from 'react'

let ws = new WebSocket(process.env.NODE_ENV === 'production' ? 'wss://socket.playlostatsea.com' : 'ws://localhost:8088')

ws.onopen = function connected() {
  ws.dispatchEvent(new CustomEvent('ready'))
}

ws.onmessage = function incoming({ data }) {
  const { event, body } = json.decode(data)
  console.log(event, body)
  ws.dispatchEvent(new CustomEvent(event, { detail: body }))
}

export function on(event: string, callback: (e: CustomEvent) => void) {
  ws.addEventListener(event, callback)
}

export function off(event: string, callback: (e: CustomEvent) => void) {
  ws.removeEventListener(event, callback)
}

export function send(event: string, body?: object) {
  ws.send(json.encode({
    event,
    body
  }))
}

export function useEvent<T>(event: string, body?: object) {
  const [response, setResponse] = useState<T>()
  const [ready, setReady] = useState(ws.readyState)
  
  function respond(e: CustomEvent) {
    setResponse(e.detail)
  }

  function retry() {
    setReady(1)
  }

  useEffect(() => {
    if (ws.readyState) {
      send(event, body)
      on(event, respond)
      return () => off(event, respond)
    } else {
      ws.addEventListener('ready', retry)
      return () => ws.removeEventListener('ready', retry)
    }
  }, [ready])

  return response
}