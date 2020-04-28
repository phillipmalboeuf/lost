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

import { Obstacle } from '../interface/obstacle'
import { Crew } from '../interface/crew'
import { extendPosition } from '../../helpers/geometry'
import { Port } from '../interface/port'


const speed = 666

export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const { canvas, move, moving, rotation } = useContext(MapContext)

  const boat = useEvent<BoatDocument>('watchBoat', { _id: props.match.params._id })
  const crew = useCrew(props.match.params._id)

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
      if (boat.current_obstacle_id || boat.at_port) {
        move(boat.position)
      }
    }, [boat.position.lat, boat.position.lng])

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

  function overcome(alternate: boolean) {
    send('overcome', { obstacle_id: boat.current_obstacle_id, alternate })
  }

  function leavePort() {
    send('leavePort', { boat_id: boat._id })
  }

  return boat && <>
    <Boat speed={speed} direction={direction} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2>{boat.name}<br />{boat.gold} gold</h2>
      
      <Crew crew={crew} boat={boat} />

      {!moving && boat.current_obstacle_id
        && <Obstacle _id={boat.current_obstacle_id} onOvercome={overcome} crew={crew} />}

      {!moving && boat.at_port
        && <Port onFinish={leavePort} boat={boat} />}
    </div>
  </>
}

export function useCrew(boat_id: string) {
  const [crew, setCrew] = useState<{[id: string]: CrewDocument}>()
  const fetch = useEvent<CrewDocument[]>('fetchCrew', { boat_id })

  function updateMember(e: CustomEvent<CrewDocument>) {
    console.log(crew)
    console.log(e.detail)
    setCrew({
      ...crew,
      [e.detail._id]: e.detail
    })
  }

  useEffect(() => {
    if (fetch) {
      setCrew(fetch.reduce((reduced, member) => {
        return {
          ...reduced,
          [member._id]: member
        }
      }, {}))
    }
  }, [fetch])

  useEffect(() => {
    if (crew) {
      on('watchCrewMember', updateMember)
      return () => off('watchCrewMember', updateMember)
    }
  }, [crew])

  return crew && Object.values(crew)
}