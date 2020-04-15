
import { createModel, ModelDocument } from './_model'


export interface ObstacleDocument extends ModelDocument {
  boat_id: string
  trigger: number
  content_id: string
  contributions: string[]
}

export const Obstacle = createModel<ObstacleDocument>('obstacles', null, null, { 'created_at': -1 })