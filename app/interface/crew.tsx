import React, { FunctionComponent, useEffect, useState, Fragment } from 'react'

import type { BoatDocument } from '../../server/models/boat'
import type { ObstacleDocument, ObstacleContent } from '../../server/models/obstacle'
import type { CrewDocument, Stats } from '../../server/models/crew'

import { useEvent, send, on, off } from '../socket'

import { Overlay } from './overlay'
import { Card } from './card'
import { Button } from './button'
import { Title, Subtitle, Paragraph } from './text'
import { Flex, OneThird, TwoThirds } from './flex'
import { List, ListItem } from './list'
import { Entry } from 'contentful'
import { Input } from './input'


function stats(current: Stats, base?: Stats, onClick?: (stat: string) => void) {
  return base
  ? <>B: {onClick ? <Button transparent onClick={() => onClick('bravery')}>{current.bravery}</Button> : current.bravery} / {base.bravery}, I: {onClick ? <Button transparent onClick={() => onClick('intelligence')}>{current.intelligence}</Button> : current.intelligence} / {base.intelligence}, C: {onClick ? <Button transparent onClick={() => onClick('charm')}>{current.charm}</Button> : current.charm} / {base.charm}, D: {onClick ? <Button transparent onClick={() => onClick('dexterity')}>{current.dexterity}</Button> : current.dexterity} / {base.dexterity} </>
  : <>B: {current.bravery}, I: {current.intelligence}, C: {current.charm}, D: {current.dexterity}</>
}

export const Crew: FunctionComponent<{
  boat: BoatDocument
  crew: CrewDocument[]
}> = ({ boat, crew }) => {

  const crewList = useEvent<Entry<{ title: string, bio: string } & Stats>[]>('listCrewMembers')

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

  function contribute(crew_id: string) {
    return (stat: string) =>
      send('contribute', { obstacle_id: boat.current_obstacle_id, crew_id, stat })
  }

  function recover(crew_id: string) {
    return (stat: string) =>
      send('recover', { crew_id, stat })
  }

  function buy(crew_id: string) {
    return (stat: string) =>
      send('buy', { crew_id, stat })
  }
  
  return <Card z={2}>
    <List>
      {crew && crewList && crew.map(member => ({
        ...member,
        content: crewList.find(c => c.sys.id === member.content_id)
      })).map(member => <ListItem key={member._id}>
        <Subtitle>{member.name} – {member.content.fields.title}</Subtitle>
        {stats(member, member.content.fields, boat.current_obstacle_id
          ? contribute(member._id)
          : boat.at_port
            ? buy(member._id)
            : member.slept ? recover(member._id) : undefined)}
      </ListItem>)}
    </List>
        
    {crew && (!crew.length || !boat.triggers) && <Button onClick={() => setAdding(true)}>+ Add a Crew Member</Button>}
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
              newCrew(e.currentTarget['crewname'].value, pick, boat._id)
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
}