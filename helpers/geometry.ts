import type { Position } from '../server/models/map'

export function extendPosition(position: Position, direction: number, length: number): Position {
  return {
    lat: Math.round(position.lat + (Math.sin(direction) * length)),
    lng: Math.round(position.lng + (Math.cos(direction) * length))
  }
}