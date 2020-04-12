import React, { FunctionComponent, useRef, useEffect, useContext, Component } from 'react'
import { Shape, Ellipse, Cylinder, Hemisphere, TAU, Dragger } from 'zdog'

import { MapContext } from './map'
import type { Position } from '../../server/models/map'

interface Props {
  lat: number
  lng: number
}
interface State {}

export class Wave extends Component<Props, State> {
  static contextType = MapContext
  declare context: React.ContextType<typeof MapContext>

  componentDidMount() {
    const { anchor } = this.context
    const { lat, lng } = this.props
    
    let wave = new Shape({
      addTo: anchor,
      path: [
        { x: 0, y: 0 },
        { bezier: [
          { x:  20, y: 0 },
          { x:  60, y:  -30 },
          { x:  60, y:  -60 },
        ]},
        { bezier: [
          { x:  60, y: -60 },
          { x:  120, y:  -30 },
          { x:  120, y:  0 },
        ]}
      ],
      closed: false,
      stroke: 10,
      color: '#a4d4ae',
      // fill: true,
      scale: 0.5,
      translate: { x: lng, z: lat, y: 20 }
    })
  }

  componentDidUpdate() {
    
  }

  render() {
    return null
  }
}

