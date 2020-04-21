import React, { useState, Fragment, useEffect, useContext } from 'react'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import type { Entry } from 'contentful'
import hotkeys from 'hotkeys-js'

import { Boat } from '../shapes/boat'
import { MapContext } from '../shapes/map'
import { useEvent, send, on, off } from '../socket'

import type { BoatDocument } from '../../server/models/boat'
import type { Stats, CrewDocument } from '../../server/models/crew'
import { ObstacleDocument } from '../../server/models/obstacle'
import type { Position } from '../../server/models/map'

import { Card } from '../interface/card'
import { Button } from '../interface/button'
import { Overlay } from '../interface/overlay'
import { Title, Subtitle, Paragraph } from '../interface/text'
import { Input } from '../interface/input'
import { List, ListItem } from '../interface/list'
import { Obstacle } from '../interface/obstacle'
import { Crew } from '../interface/crew'
import { extendPosition } from '../../helpers/geometry'


const speed = 400

export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const { canvas, move, moving, rotation } = useContext(MapContext)

  const boat = useEvent<BoatDocument>('watchBoat', { _id: props.match.params._id })
  const crew = useEvent<CrewDocument[]>('watchCrew', { boat_id: props.match.params._id })

  const [direction, setDirection] = useState(0)

  useEffect(() => {
    canvas.addEventListener('pointermove', direct)
    return () => {
      canvas.removeEventListener('pointermove', direct)
    }
  }, [rotation])

  function direct (event: PointerEvent){
    setDirection(
      Math.atan2(event.y - (window.innerHeight/2), event.x - (window.innerWidth/2)) - rotation
    )
  }

  if (boat) {
    useEffect(() => {
      move(boat.position, false)
    }, [])

    useEffect(() => {
      // if (boat.current_obstacle_id) {
        move(boat.position)
      // }
    }, [boat.position])

    useEffect(() => {
      canvas.addEventListener('click', onward)
      hotkeys('space', onward)

      return () => {
        canvas.removeEventListener('click', onward)
        hotkeys.unbind('space', onward)
      }
    }, [boat.position, direction])
  }

  function onward(event: Event) {
    event.preventDefault()

    if (!moving) {
      send('onward', { position: extendPosition(boat.position, direction, speed), boat_id: props.match.params._id })
    }
  }

  function overcome() {
    send('overcome', { obstacle_id: boat.current_obstacle_id })
  }

  return boat && <>
    <Boat speed={speed} direction={direction} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2>{boat.name}<br />{boat.gold} gold</h2>
      
      <Crew crew={crew} boat={boat} />

      {!moving && boat.current_obstacle_id
        && <Obstacle _id={boat.current_obstacle_id} onOvercome={overcome} crew={crew} />}

      {/* {boat && <div>
        <small>{boat.position.lat} {boat.position.lng}</small>
      </div>} */}
    </div>
  </>
}