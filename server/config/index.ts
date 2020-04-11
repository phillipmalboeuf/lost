import nconf from 'nconf'

nconf.argv().env()
nconf.file('secret', { file: 'server/config/secret.json' })
nconf.file('default', { file: 'server/config/default.json' })

export const CONF = (key: string)=> nconf.get(key)
