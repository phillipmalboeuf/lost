import React, { FunctionComponent, useRef, useEffect, createContext, useState, Component } from 'react'
import { Illustration, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Vector, Anchor } from 'zdog'
import anime from 'animejs'

import { water } from '../settings/colors'
import { Compass } from './compass'
import type { Position } from '../../server/models/map'

export const MapContext = createContext({
  canvas: undefined as HTMLCanvasElement,
  illo: undefined as Illustration,
  anchor: undefined as Anchor,
  rotation: 0,
  move: undefined as (position: Position, animated?: boolean) => void,
  moving: false
})


interface Props {
  // speed: number
}
interface State {
  illo?: Illustration
  anchor?: Anchor
  rotation: number
  moving: boolean
}

export class Map extends Component<Props, State> {
  
  canvas: HTMLCanvasElement
  state: State = {
    rotation: -TAU/4,
    moving: false
  }

  componentDidMount() {
    let illo = new Illustration({
      element: this.canvas,
      // dragRotate: true,
      rotate: { x: -TAU/13 },
      zoom: 0.25,
    })

    let anchor = new Anchor({
      addTo: illo
    })

    this.setState({
      illo,
      anchor
    })
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    requestAnimationFrame(() => {
      this.state.illo.rotate.y = this.state.rotation
      this.state.illo.updateRenderGraph()
    })
  }


  move(position: Position, animated = true) {
    if (!this.state.moving) {
      if (animated) {
        this.setState({
          moving: true
        })

        anime({
          targets: this.state.anchor.translate,
          x: -position.lng,
          z: -position.lat,
          easing: 'easeOutQuad',
          update: () => {
            requestAnimationFrame(() => this.state.illo.updateRenderGraph())
          },
          complete: () => {
            this.setState({ moving: false })
          }
        })
      } else {
        this.state.anchor.translate.x = -position.lng
        this.state.anchor.translate.z = -position.lat
        this.state.illo.updateRenderGraph()
      }
    }
  }

  render() {
    const { canvas, move } = this
    const { illo, anchor, moving, rotation } = this.state
    const { children } = this.props

    return <MapContext.Provider value={{ canvas, illo, anchor, move: move.bind(this), moving, rotation }}>
      <canvas style={{ position: 'fixed', top: 0, left: 0, backgroundColor: water[1] }} ref={element => this.canvas = element} width={window.innerWidth} height={window.innerHeight} />
      {illo && children}
      <Compass onRotate={rotation => this.setState({ rotation })} />
    </MapContext.Provider>
  }
}
