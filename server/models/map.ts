
import { createModel, ModelDocument } from './_model'
import { extendPosition } from '../../helpers/geometry'
import { TAU } from 'zdog'

export interface Position {
  lat: number
  lng: number
}

export interface IslandDocument {
  name: string
  position: Position
  rotation: number
  home?: boolean
  port?: boolean
}

export interface MapDocument extends ModelDocument {
  scale: number
  islands: IslandDocument[]
}

const model = createModel<MapDocument>('maps')

export const Map = {
  ...model,
  createOne: async ({ distance, island_count }: { 
    distance: number
    island_count: number
  }) => {
    const direction = TAU * Math.random()
    const position = extendPosition({ lat: 0, lng: 0 }, direction, distance)
    const home: IslandDocument = {
      name: 'Home',
      position,
      rotation: TAU * Math.random(),
      home: true
    }
    
    let port = true
    const spread = distance * 0.33

    const islands: IslandDocument[] = [
      home,
      ...new Array(island_count).fill(undefined).map(() => {
        port = !port
        return {
          name: 'Island',
          position: extendPosition({ lat: (Math.random() * spread) - (spread / 2), lng: (Math.random() * spread) - (spread / 2) }, direction, distance - (distance * Math.random())),
          rotation: TAU * Math.random(),
          port
        }
      })
    ]
    return model.createOne({
      islands
    })
  }
}