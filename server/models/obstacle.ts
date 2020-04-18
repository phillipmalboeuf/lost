
import { createModel, ModelDocument } from './_model'
import { Entry } from 'contentful'


export interface ObstacleDocument extends ModelDocument {
  boat_id: string
  trigger: number
  content_id: string
  content?: Entry<{
    title: string
    description: string
    overcome: string
  }>
  contributions: string[]
}

export const Obstacle = createModel<ObstacleDocument>('obstacles', null, null, { 'created_at': -1 })