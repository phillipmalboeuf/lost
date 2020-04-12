
import { createModel, ModelDocument } from './_model'
import { Position, MapDocument, IslandDocument } from './map'
import { PlayerDocument } from './player'

export interface BoatDocument extends ModelDocument {
  name: string
  position: Position
  map: MapDocument
  home: IslandDocument
  players: PlayerDocument
}

export const Boat = createModel<BoatDocument>('boats')