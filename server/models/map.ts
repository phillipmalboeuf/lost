
import { createModel, ModelDocument } from './_model'

export interface Position {
  lat: number
  lng: number
}

export interface IslandDocument {
  name: string
  position: Position
}

export interface MapDocument extends ModelDocument {
  scale: number
  islands: IslandDocument[]
}

export const Map = createModel<MapDocument>('maps')