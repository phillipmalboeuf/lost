import { MongoClient, Db } from 'mongodb'

import { CONF } from '../config'

export const db = async () => {
  const client = await MongoClient.connect(CONF('MONGO_URI'), { useNewUrlParser: true, useUnifiedTopology: true })
  return client.db(CONF('MONGO_DB'))
}