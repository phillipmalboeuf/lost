
import type { Db, FilterQuery } from 'mongodb'
import { nanoid } from 'nanoid'

import { db } from '../clients/mongo'

export interface ModelDocument {
  _id: string
  created_at: Date
}


let database: Db = undefined
db().then(_ => database = _)

export const createModel = <T, F = { _id: string }>(
  name: string,
  preprocess=async(data)=>data,
  postprocess=async(data)=>data,
  defaultSort?: object
) => {
  
  const processes = {
    preprocess: async (data: any) => preprocess ? preprocess(data) : data,
    postprocess: async (data: any): Promise<T> => postprocess ? postprocess(data) : data
  }

  return {
    ...processes,
    
    list: async (filters: FilterQuery<F>, limit=50, page=0, sort?: object) => {
      return database.collection(name).find(filters, {
        limit,
        skip: limit ? page * limit : 0,
        sort: sort || defaultSort
      }).toArray()
        .then(models => Promise.all(models.map(processes.postprocess)))
    },

    count: async (filters: FilterQuery<F>) => {
      return database.collection(name).countDocuments(filters)
    },

    one: async (filters: FilterQuery<F>) => {
      return database.collection(name).findOne(filters).then(processes.postprocess)
    },

    createOne: async (data: any) => {
      return database.collection(name).insertOne({
        _id: nanoid(),
        created_at: new Date(),
        ...(await processes.preprocess(data))
      }).then(result => ({ _id: result.insertedId as string }))
    },

    updateOne: async (filters: FilterQuery<F>, data: any, method = '$set') => {
      return database.collection(name).findOneAndUpdate(filters, {
        [method]: await processes.preprocess(data)
      }, { returnOriginal: false }).then(result => processes.postprocess(result.value))
    },

    destroyOne: async (filters: FilterQuery<F>) => {
      return database.collection(name).deleteOne(filters)
        .then(result => ({ deleted: result.result.n }))
    },

    aggregate: async (pipeline: object[]) => {
      return database.collection(name).aggregate(pipeline)
    },

    watch: async (filters: FilterQuery<F>) => {
      return database.collection(name).watch([{ '$match': filters }], { fullDocument : 'updateLookup' })
    }
  }
}

