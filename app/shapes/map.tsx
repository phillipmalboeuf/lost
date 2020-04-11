import React, { FunctionComponent, useRef, useEffect, createContext, useState, Component } from 'react'
import { Illustration, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Vector, Anchor } from 'zdog'
import hotkeys from 'hotkeys-js'
import anime from 'animejs'

import { water } from '../settings/colors'
import { Compass } from './compass'

export const MapContext = createContext({
  illo: undefined as Illustration,
  anchor: undefined as Anchor,
  direction: 0,
  speed: 400,
  moving: false
})


interface Props {
  speed: number
}
interface State {
  illo?: Illustration
  anchor?: Anchor
  direction: number
  rotation: number
  coordinates: {
    lat: number
    lng: number
  }
  moving: boolean
}

export class Map extends Component<Props, State> {
  
  svg: SVGSVGElement
  state: State = {
    direction: 0,
    rotation: 0,
    coordinates: {
      lat: 0,
      lng: 0
    },
    moving: false
  }

  componentDidMount() {
    let illo = new Illustration({
      element: this.svg,
      // dragRotate: true,
      rotate: { x: -TAU/13 },
      scale: 0.33,
    })

    let anchor = new Anchor({
      addTo: illo
    })

    this.setState({
      illo,
      anchor
    })

    this.svg.addEventListener('pointermove', event => {
      this.setState({
        direction: Math.atan2(event.y - (window.innerHeight/2), event.x - (window.innerWidth/2)) - this.state.rotation
      })
    })

    this.svg.addEventListener('click', this.onward.bind(this))
    hotkeys('space', this.onward.bind(this))
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.state.illo.rotate.y = this.state.rotation
    this.state.illo.updateRenderGraph()
  }


  onward(e: Event) {
    e.preventDefault()

    if (!this.state.moving) {
      let coordinates = {
        lat: this.state.coordinates.lat + (Math.sin(this.state.direction) * this.props.speed),
        lng: this.state.coordinates.lng + (Math.cos(this.state.direction) * this.props.speed)
      }

      this.setState({
        coordinates,
        moving: true
      })

      anime({
        targets: this.state.anchor.translate,
        x: -coordinates.lng,
        z: -coordinates.lat,
        easing: 'easeOutQuad',
        update: () => {
          this.state.illo.updateRenderGraph()
        },
        complete: () => {
          this.setState({ moving: false })
        }
      })
    }
  }

  render() {
    const { illo, anchor, direction, moving } = this.state
    const { children, speed } = this.props

    return <MapContext.Provider value={{ illo, anchor, direction, moving, speed }}>
      <svg style={{ position: 'fixed', top: 0, left: 0, backgroundColor: water[1] }} ref={element => this.svg = element} width={window.innerWidth} height={window.innerHeight} />
      {illo && children}
      <Compass onRotate={rotation => this.setState({ rotation })} />
    </MapContext.Provider>
  }
}
