
import { createModel, ModelDocument } from './_model'

export interface Stats {
  bravery: number
  intelligence: number
  charm: number
  dexterity: number
}

export interface CrewDocument extends Stats, ModelDocument {
  boat_id: string
  content_id: string
  name: string
  slept: number
  lost: boolean
}

export const Crew = createModel<CrewDocument>('crew', null, null, { 'created_at': 1 })