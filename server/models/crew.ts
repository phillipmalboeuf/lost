
import { createModel, ModelDocument } from './_model'

export interface Stats {
  bravery: number
  intelligence: number
  charm: number
  dexterity: number
}

export interface CrewDocument extends Stats, ModelDocument {
  content_id: string
  name: string
  slept: number
}

export const Crew = createModel<CrewDocument>('crew', null, null, { 'created_at': 1 })