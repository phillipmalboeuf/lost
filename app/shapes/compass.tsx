import React, { FunctionComponent, useRef, useEffect, createContext, useState, Component } from 'react'
import { Illustration, Ellipse, Cylinder, Hemisphere, TAU, Dragger, Vector, Anchor, Polygon } from 'zdog'
import { sand } from '../settings/colors'

interface Props {
  onRotate: (rotation: number) => void
}
interface State {
  down: boolean
  rotation: number
}

export class Compass extends Component<Props, State> {

  
  canvas: HTMLCanvasElement
  state: State = {
    down: false,
    rotation: -TAU/4
  }

  illo: Illustration
  arrow: Polygon

  componentDidMount() {
    this.illo = new Illustration({
      element: this.canvas,
      scale: 0.5
    })

    new Ellipse({
      addTo: this.illo,
      diameter: 200,
      color: sand[0],
      fill: true,
      stroke: 10
    })

    this.arrow = new Polygon({
      addTo: this.illo,
      radius: 100,
      sides: 3,
      color: 'red',
      fill: true,
      scale: { x: 0.333 }
    })


    let rotation: number
    this.canvas.addEventListener('pointermove', event => {
      event.preventDefault()
      if (this.state.down) {
        rotation = Math.atan2(event.offsetY - (this.canvas.clientHeight/2), event.offsetX - (this.canvas.clientWidth/2))
        this.props.onRotate(rotation)
        this.setState({ rotation })
      }
    })

    this.canvas.addEventListener('pointerdown', () => this.setState({ down: true }))
    window.addEventListener('pointerup', () => this.setState({ down: false }))
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // this.illo.rotate.y = this.state.rotation
    this.arrow.rotate.z = this.state.rotation + (TAU/4)
    
    this.illo.updateRenderGraph()
  }

  render() {

    return <canvas style={{ position: 'fixed', bottom: '5vh', right: '5vw' }} ref={element => this.canvas = element} width={window.innerWidth / 6} height={window.innerHeight / 6} />
  }
}
