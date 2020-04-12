import React, { useState, Fragment, useEffect } from 'react'
import styled from 'styled-components'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import type { Entry } from 'contentful'

import { Boat } from '../shapes/boat'
import { useEvent, send, on, off } from '../socket'

import type { BoatDocument } from '../../server/models/boat'
import type { Stats, CrewDocument } from '../../server/models/crew'

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
  ? <>B: {current.bravery} / {base.bravery} , I: {current.intelligence} / {base.intelligence} , C: {current.charm} / {base.charm} , D: {current.dexterity} / {base.dexterity} </>
  : <>B: {current.bravery}, I: {current.intelligence}, C: {current.charm}, D: {current.dexterity}</>
}

export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const boat = useEvent<BoatDocument>('fetchBoat', { _id: props.match.params._id })
  const crewList = useEvent<Entry<{ title: string, bio: string } & Stats>[]>('listCrewMembers')

  const watch = useEvent<CrewDocument[]>('watchCrew', { boat_id: props.match.params._id })

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

  return boat && <>
    <Boat />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2>{boat.name}</h2>
      <Card>
        <List>
          {boat.crew && crewList && (watch || boat.crew).map(member => ({
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
    </div>
  </>
}