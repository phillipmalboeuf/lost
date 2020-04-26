import { MongoClient, Db } from 'mongodb'

import { CONF } from '../config'

let database: Db

export const db = async () => {
  if (!database) {
    database = (await MongoClient.connect(CONF('MONGO_URI'), { useNewUrlParser: true, useUnifiedTopology: true })).db(CONF('MONGO_DB'))
  }
  
  return database
}