import { createClient } from 'contentful'
import { CONF } from '../config'

const client = createClient({
  space: CONF('CONTENTFUL_SPACE_ID'),
  accessToken: CONF('CONTENTFUL_ACCESS_TOKEN')
})
export default client