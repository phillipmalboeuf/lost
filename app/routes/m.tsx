import React from 'react'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import { Map } from '../shapes/map'
import { Island } from '../shapes/island'


export const M: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  return <Map speed={400}>
    {props.children}
    <Island lat={400} lng={400} />
    {/* {new Array(33).fill(null).map((v, i) => <Wave key={`wave_${i}`} lat={(Math.random() * 1600) - 800} lng={(Math.random() * 1600) - 800} />)} */}
  </Map>
}