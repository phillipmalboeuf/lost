import React, { FunctionComponent, useRef, useEffect, useContext, Component } from 'react'
import { Illustration, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Polygon, Rect, Group } from 'zdog'

import { MapContext } from './map'
import { sand, wood, grass, water } from '../settings/colors'

interface Props {
  direction: number
  speed: number
}
interface State {}

export class Boat extends Component<Props, State> {
  static contextType = MapContext
  declare context: React.ContextType<typeof MapContext>
  
  deck: Group
  sail: Group
  circle: Group

  componentDidMount() {
    const { illo } = this.context
    const { direction, speed } = this.props

    this.circle = new Group({
      addTo: illo,
      rotate: { y: direction }
    });
    
    new Ellipse({
      addTo: this.circle,
      diameter: speed * 2,
      color: water[0],
      // fill: true,
      stroke: 24 * illo.scale.x,
      rotate: { x: -TAU/4 },
    });

    new Polygon({
      addTo: this.circle,
      radius: 33,
      sides: 3,
      color: water[0],
      fill: true,
      stroke: 24 * illo.scale.x,
      rotate: { x: -TAU/4, z: TAU/4 },
      translate: { x: speed - 66 }
    })
    
    this.deck = new Group({
      addTo: illo,
      rotate: { y: direction }
    });

    [10, 8, 6, 4, 2, 0].forEach((n, i, a) => {
      new Polygon({
        addTo: this.deck,
        radius: 50 + n,
        sides: 5,
        stroke: 30 * illo.scale.x,
        color: wood[0],
        translate: { y: 10 - (n * 3) },
        rotate: { x: -TAU/4, z: TAU/4 },
        scale: { y: 2 },
        fill: i === a.length - 1
      })
    })

    let post = new Group({
      addTo: illo,
      translate: { y: -10 },
    });

    new Cylinder({
      addTo: post,
      diameter: 20,
      length: 160,
      stroke: false,
      color: wood[1],
      rotate: { x: -TAU/4 },
      translate: { y: -80 }
    });

    new Cylinder({
      addTo: post,
      diameter: 33,
      length: 15,
      stroke: false,
      color: wood[2],
      backface: wood[1],
      rotate: { x: -TAU/4 },
      translate: { y: -160 }
    });

    this.sail = new Group({
      addTo: illo,
      // translate: { y: -60, x: 20 },
    });

    [0, 4, 8, 10, 11, 12.5, 11.5, 10, 8, 4, 0].forEach((n, i, a) => {
      new Rect({
        addTo: this.sail,
        width: 133,
        height: 10,
        stroke: 30 * illo.scale.x,
        color: sand[0],
        rotate: { y: -TAU/4 },
        translate: { y: (-(120 / a.length) * i) - 50, x: n + 33 },
        fill: true
      })
    })
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { moving, illo } = this.context
    const { direction } = this.props
    
    if (!this.circle.visible && !moving) {
      this.circle.visible = true
    } else if (this.circle.visible && moving) {
      this.circle.visible = false
    }

    if (!moving) {
      this.deck.rotate.y = direction
      this.sail.rotate.y = direction
      this.circle.rotate.y = direction
    }

    illo.updateRenderGraph()
  }

  render() {
    return null
  }
}

