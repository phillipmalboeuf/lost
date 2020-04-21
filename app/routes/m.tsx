import React from 'react'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import { Map } from '../shapes/map'
import { Island } from '../shapes/island'
import { useEvent } from '../socket'

import type { MapDocument } from '../../server/models/map'


export const M: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const m = useEvent<MapDocument>('fetchMap', { _id: props.match.params._id })

  return <Map>
    {props.children}
    {m && m.islands && m.islands.map((island, index) => <Island key={index} {...island} />)}
    {/* {new Array(33).fill(null).map((v, i) => <Wave key={`wave_${i}`} lat={(Math.random() * 1600) - 800} lng={(Math.random() * 1600) - 800} />)} */}
  </Map>
}