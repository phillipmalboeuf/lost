import React, { useState, Fragment, useEffect, useContext } from 'react'
import styled from 'styled-components'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import type { Entry } from 'contentful'
import hotkeys from 'hotkeys-js'

import { Boat } from '../shapes/boat'
import { MapContext } from '../shapes/map'
import { useEvent, send, on, off } from '../socket'

import type { BoatDocument } from '../../server/models/boat'
import type { Stats, CrewDocument } from '../../server/models/crew'
import type { ObstacleDocument } from '../../server/models/obstacle'
import type { Position } from '../../server/models/map'

import { Card } from '../interface/card'
import { Button } from '../interface/button'
import { Overlay } from '../interface/overlay'
import { text } from '../settings/sizes'
import { ink } from '../settings/colors'
import { Title, Subtitle } from '../interface/text'
import { Input } from '../interface/input'


const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const ListItem = styled.li`
  cursor: pointer;
  font-size: ${text[1]};
  padding: ${text[1]} 0;
  border-bottom: 2px solid ${ink[0]};

  &:last-child {
    margin-bottom: ${text[1]};
  }
`

function stats(current: Stats, base?: Stats) {
  return base
  ? <>B: {current.bravery} / {base.bravery}, I: {current.intelligence} / {base.intelligence}, C: {current.charm} / {base.charm}, D: {current.dexterity} / {base.dexterity} </>
  : <>B: {current.bravery}, I: {current.intelligence}, C: {current.charm}, D: {current.dexterity}</>
}

const speed = 400

export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const { svg, move, moving, rotation } = useContext(MapContext)

  const boat = useEvent<BoatDocument>('watchBoat', { _id: props.match.params._id })
  const crew = useEvent<CrewDocument[]>('watchCrew', { boat_id: props.match.params._id })
  const crewList = useEvent<Entry<{ title: string, bio: string } & Stats>[]>('listCrewMembers')

  const [direction, setDirection] = useState(0)
  const [obstacle, setObstacle] = useState<ObstacleDocument>()
  const [adding, setAdding] = useState(false)
  const [pick, setPick] = useState<string>()

  
  useEffect(() => {
    on('newCrew', success)
    return () => off('newCrew', success)
  }, [])
  
  function success() {
    setAdding(false)
  }

  function newCrew(name: string, content_id: string, boat_id: string) {
    send('newCrew', { name, content_id, boat_id })
  }

  useEffect(() => {
    on('fetchObstacle', ({ detail }) => setObstacle(detail))
  }, [])

  useEffect(() => {
    svg.addEventListener('pointermove', direct)
    return () => {
      svg.removeEventListener('pointermove', direct)
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
      if (boat.current_obstacle_id) {
        move(boat.position)
      }
    }, [boat.position])

    useEffect(() => {
      svg.addEventListener('click', onward)
      hotkeys('space', onward)

      return () => {
        svg.removeEventListener('click', onward)
        hotkeys.unbind('space', onward)
      }
    }, [boat.position, direction])

    useEffect(() => {
      if (boat.current_obstacle_id) {
        send('fetchObstacle', { _id: boat.current_obstacle_id })
      }
    }, [boat.current_obstacle_id])
  }

  function onward(event: Event) {
    event.preventDefault()

    if (!moving) {
      send('onward', { position: {
        lat: Math.round(boat.position.lat + (Math.sin(direction) * speed)),
        lng: Math.round(boat.position.lng + (Math.cos(direction) * speed))
      }, boat_id: props.match.params._id })
    }
  }

  function overcome() {
    setObstacle(undefined)
    send('overcome', { obstacle_id: obstacle._id })
  }

  return boat && <>
    <Boat speed={400} direction={direction} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2>{boat.name}</h2>
      <Card>
        <List>
          {crew && crewList && crew.map(member => ({
            ...member,
            content: crewList.find(c => c.sys.id === member.content_id)
          })).map(member => <ListItem key={member._id}>
            <Subtitle>{member.name} – {member.content.fields.title}</Subtitle>
            {stats(member, member.content.fields)}
          </ListItem>)}
        </List>
            
        <Button onClick={() => setAdding(true)}>+ Add a Crew Member</Button>
        {adding && <Overlay>
          <Card>
            {crewList && !pick && <List>
              {crewList.map(member => <ListItem key={member.sys.id} onClick={() => setPick(member.sys.id)}>
                <Subtitle>{member.fields.title}</Subtitle>
                {stats(member.fields)}
              </ListItem>)}
            </List>}
            {pick && <>
              <Button transparent onClick={() => setPick(undefined)}>← Pick a different crew member</Button>
              {crewList.filter(member => member.sys.id === pick).map(member => <Fragment key={member.sys.id}>
                <Title>{member.fields.title}</Title>
                <p>{member.fields.bio}</p>

                <form onSubmit={e => {
                  e.preventDefault()
                  newCrew(e.currentTarget['crewname'].value, pick, props.match.params._id)
                }}>
                  <Input name='crewname' label={`Name your ${member.fields.title}`} />
                  <Button>Hop aboard!</Button>
                </form>
              </Fragment>)}
            </>}

            <Button transparent onClick={() => setAdding(false)}>Cancel</Button>
          </Card>
        </Overlay>}
      </Card>

      {!moving && boat.current_obstacle_id && obstacle && <Overlay>
        <Card>
          <h1>{obstacle.content.fields.title}</h1>
          <p>{obstacle.content.fields.description}</p>
          <Button onClick={overcome}>{obstacle.content.fields.overcome}</Button>
        </Card>
      </Overlay>}
      {/* {boat && <div>
        <small>{boat.position.lat} {boat.position.lng}</small>
      </div>} */}
    </div>
  </>
}