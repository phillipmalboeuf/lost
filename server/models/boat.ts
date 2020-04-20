
import { createModel, ModelDocument } from './_model'
import { Position, MapDocument, IslandDocument } from './map'
import { PlayerDocument } from './player'
import { CrewDocument } from './crew'

export interface BoatDocument extends ModelDocument {
  name: string
  position: Position
  current_obstacle_id: string
  gold: number
  map: MapDocument
  home: IslandDocument
  // players: PlayerDocument[]
  // crew: CrewDocument[]
  triggers: number[]
}

export const Boat = createModel<BoatDocument>('boats')