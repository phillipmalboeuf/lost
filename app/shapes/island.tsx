import React, { FunctionComponent, useRef, useEffect, useContext, Component } from 'react'
import { Shape, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Group, Anchor, Rect, Box } from 'zdog'

import { MapContext } from './map'
import type { Position } from '../../server/models/map'
import { sand, grass, wood, ink } from '../settings/colors'

interface Props {
  position: Position
  rotation: number
  home?: boolean
  port?: boolean
}
interface State {}

export class Island extends Component<Props, State> {
  static contextType = MapContext
  declare context: React.ContextType<typeof MapContext>

  componentDidMount() {
    const { anchor, illo } = this.context
    const { position: { lat, lng }, rotation, port, home } = this.props

    let island = new Anchor({
      addTo: anchor,
      translate: { x: lng, z: lat },
      rotate: { y: rotation }
    });

    let periphery = new Anchor({
      addTo: island
    })

    let land = new Anchor({
      addTo: island
    })
    
    if (port) {
      new Box({
        addTo: land,
        width: 140,
        height: 100,
        depth: 100,
        stroke: 40 * illo.scale.x,
        color: wood[0],
        fill: true,
        translate: { x: 0, y: -300 },
      })

      new Box({
        addTo: land,
        width: 200,
        height: 100,
        depth: 30,
        stroke: 40 * illo.scale.x,
        color: wood[1],
        fill: true,
        translate: { x: 0, z: 500, y: -30 },
        rotate: { x: TAU/4, z: TAU/2.5 },
      })
    }
    
    let translate
    (port ? [600, 400] : home ? [800, 500] : [400, 300]).forEach((n, i, a) => {
      translate = { x: i && (a[i-1] / 2.5), z: i && (a[i-1] / 2.5) }
      new Ellipse({
        addTo: periphery,
        diameter: n,
        color: sand[0],
        fill: true,
        stroke: 30 * illo.scale.x,
        rotate: { x: TAU/4 },
        translate
      })

      new Hemisphere({
        addTo: land,
        diameter: n*0.9,
        color: home ? ink[0] : grass[0],
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

