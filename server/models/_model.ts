
import type { Db, FilterQuery } from 'mongodb'
import { nanoid } from 'nanoid'

import { db } from '../clients/mongo'

export interface ModelDocument {
  _id: string
  created_at: Date
}

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
      return (await db()).collection(name).find(filters, {
        limit,
        skip: limit ? page * limit : 0,
        sort: sort || defaultSort
      }).toArray()
        .then(models => Promise.all(models.map(processes.postprocess)))
    },

    count: async (filters: FilterQuery<F>) => {
      return (await db()).collection(name).countDocuments(filters)
    },

    one: async (filters: FilterQuery<F>) => {
      return (await db()).collection(name).findOne(filters).then(processes.postprocess)
    },

    createOne: async (data: any) => {
      return (await db()).collection(name).insertOne({
        _id: nanoid(),
        created_at: new Date(),
        ...(await processes.preprocess(data))
      }).then(result => ({ _id: result.insertedId as string }))
    },

    updateOne: async (filters: FilterQuery<F>, data: any, method = '$set') => {
      return (await db()).collection(name).findOneAndUpdate(filters, {
        [method]: await processes.preprocess(data)
      }, { returnOriginal: false }).then(result => processes.postprocess(result.value))
    },

    updateMany: async (filters: FilterQuery<F>, data: any, method = '$set') => {
      return (await db()).collection(name).updateMany(filters, {
        [method]: await processes.preprocess(data)
      }).then(result => result.result)
    },

    destroyOne: async (filters: FilterQuery<F>) => {
      return (await db()).collection(name).deleteOne(filters)
        .then(result => ({ deleted: result.result.n }))
    },

    aggregate: async (pipeline: object[]) => {
      return (await db()).collection(name).aggregate(pipeline)
    },

    watch: async (filters: FilterQuery<F>) => {
      return (await db()).collection(name).watch([{ '$match': filters }], { fullDocument : 'updateLookup' })
    }
  }
}

