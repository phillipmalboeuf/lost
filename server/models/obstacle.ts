
import { createModel, ModelDocument } from './_model'
import { Entry } from 'contentful'

export interface ObstacleContent {
  title: string
  description: string
  loseSleep: boolean
  loseCrew: boolean
  overcome: string
  money: number
  bravery: number
  intelligence: number
  charm: number
  dexterity: number
  alternateOvercome: string
  alternate_bravery: number
  alternate_intelligence: number
  alternate_charm: number
  alternate_dexterity: number
}

export interface ObstacleDocument extends ModelDocument {
  boat_id: string
  trigger: number
  content_id: string
  contributions: { [crew: string]: { [stat: string]: number } }
}

export const Obstacle = createModel<ObstacleDocument>('obstacles', null, null, { 'created_at': -1 })