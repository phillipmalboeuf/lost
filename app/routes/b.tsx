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


function stats(current: Stats, base?: Stats, onContribute?: (stat: string, value: number) => void) {
  return base
  ? <>B: {onContribute ? <Button transparent onClick={() => onContribute('bravery', 1)}>{current.bravery}</Button> : current.bravery} / {base.bravery}, I: {onContribute ? <Button transparent onClick={() => onContribute('intelligence', 1)}>{current.intelligence}</Button> : current.intelligence} / {base.intelligence}, C: {onContribute ? <Button transparent onClick={() => onContribute('charm', 1)}>{current.charm}</Button> : current.charm} / {base.charm}, D: {onContribute ? <Button transparent onClick={() => onContribute('dexterity', 1)}>{current.dexterity}</Button> : current.dexterity} / {base.dexterity} </>
  : <>B: {current.bravery}, I: {current.intelligence}, C: {current.charm}, D: {current.dexterity}</>
}

const speed = 400

export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const { svg, move, moving, rotation } = useContext(MapContext)

  const boat = useEvent<BoatDocument>('watchBoat', { _id: props.match.params._id })
  const crew = useEvent<CrewDocument[]>('watchCrew', { boat_id: props.match.params._id })
  const crewList = useEvent<Entry<{ title: string, bio: string } & Stats>[]>('listCrewMembers')

  const [direction, setDirection] = useState(0)
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

    // useEffect(() => {
    //   if (boat.current_obstacle_id) {
    //     send('fetchObstacle', { _id: boat.current_obstacle_id })
    //   }
    // }, [boat.current_obstacle_id])
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

  function contribute(crew_id: string) {
    return (stat: string, value: number) =>
      send('contribute', { obstacle_id: boat.current_obstacle_id, crew_id, stat, value })
  }

  function overcome() {
    send('overcome', { obstacle_id: boat.current_obstacle_id })
  }

  return boat && <>
    <Boat speed={400} direction={direction} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2>{boat.name}</h2>
      <Card z={2}>
        <List>
          {crew && crewList && crew.map(member => ({
            ...member,
            content: crewList.find(c => c.sys.id === member.content_id)
          })).map(member => <ListItem key={member._id}>
            <Subtitle>{member.name} – {member.content.fields.title}</Subtitle>
            {stats(member, member.content.fields, boat.current_obstacle_id && contribute(member._id))}
          </ListItem>)}
        </List>
            
        {!boat.triggers && <Button onClick={() => setAdding(true)}>+ Add a Crew Member</Button>}
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
                <Paragraph>{member.fields.bio}</Paragraph>

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

      {!moving && boat.current_obstacle_id
        && <Obstacle _id={boat.current_obstacle_id} onOvercome={overcome} crew={crew} />}
      {/* {boat && <div>
        <small>{boat.position.lat} {boat.position.lng}</small>
      </div>} */}
    </div>
  </>
}