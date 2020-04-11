import { ObjectId } from 'mongodb'
import { createModel, ModelDocument } from './_model'

export interface PlayerDocument extends ModelDocument {
  username: string
}

export const Player = createModel<PlayerDocument>('players')