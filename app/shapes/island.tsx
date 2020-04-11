import React, { FunctionComponent, useRef, useEffect, useContext, Component } from 'react'
import { Shape, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Group, Anchor } from 'zdog'

import { MapContext } from './map'
import { Position } from '../../server/models/map'
import { sand, grass } from '../settings/colors'

interface Props {
  lat: number
  lng: number
}
interface State {}

export class Island extends Component<Props, State> {
  static contextType = MapContext
  declare context: React.ContextType<typeof MapContext>

  componentDidMount() {
    const { anchor } = this.context
    const { lat, lng } = this.props

    let island = new Anchor({
      addTo: anchor,
      translate: { x: lng, z: lat },
      rotate: { y: (TAU/4) * Math.random()*4 }
    });

    let periphery = new Group({
      addTo: island
    })

    let land = new Group({
      addTo: island
    })
    
    let translate
    [400, 300].forEach((n, i, a) => {
      translate = { x: i && (a[i-1] / 2.5), z: i && (a[i-1] / 2.5) }
      new Ellipse({
        addTo: periphery,
        diameter: n,
        color: sand[0],
        fill: true,
        stroke: 10,
        rotate: { x: TAU/4 },
        translate
      })

      new Hemisphere({
        addTo: land,
        diameter: n*0.9,
        color: grass[0],
        rotate: { x: TAU/4 },
        translate
      })
    })

    
  }

  componentDidUpdate() {
    
  }

  render() {
    return null
  }
}

