import React, { FunctionComponent } from 'react'

import type { ObstacleDocument, ObstacleContent } from '../../server/models/obstacle'
import type { CrewDocument } from '../../server/models/crew'

import { useEvent } from '../socket'

import { Overlay } from './overlay'
import { Card } from './card'
import { Button } from './button'
import { Title, Subtitle, Paragraph } from './text'
import { Flex, OneThird, TwoThirds } from './flex'
import { List, ListItem } from './list'
import { Entry } from 'contentful'

export const Obstacle: FunctionComponent<{
  _id: string
  crew: CrewDocument[]
  onOvercome: () => void
}> = ({ _id, onOvercome, crew }) => {

  const obstacle = useEvent<ObstacleDocument>('watchObstacle', { _id })
  const content = useEvent<Entry<ObstacleContent>>('fetchObstacleContent', { _id })

  const totals = Object.entries((obstacle && obstacle.contributions) || []).reduce((t, [crew_id, stats]) => {
    Object.entries(stats).forEach(([stat, value]) => {
      t[stat] += value
    })
    return t
  }, {
    bravery: 0,
    intelligence: 0,
    charm: 0,
    dexterity: 0
  })

  const overcame = Object.entries(totals).reduce((o, [stat, value]) => {
    return {
      ...o,
      [stat]: (content && obstacle)
        ? content.fields[stat] ? value >= content.fields[stat] : true
        : false
    }
  }, {
    bravery: false,
    intelligence: false,
    charm: false,
    dexterity: false
  })

  const alternateOvercame = Object.entries(totals).reduce((o, [stat, value]) => {
    return {
      ...o,
      [stat]: (content && obstacle)
        ? content.fields[`alternate_${stat}`] ? value >= content.fields[`alternate_${stat}`] : true
        : false
    }
  }, {
    bravery: false,
    intelligence: false,
    charm: false,
    dexterity: false
  })

  return obstacle && content && <Overlay>
    <Card wide>
      <Title>{content.fields.title}</Title>

      <Flex>
        <OneThird>    
          <Paragraph>{content.fields.description}</Paragraph>
          <Subtitle>{content.fields.overcome}</Subtitle>
          B: {content.fields.bravery}<br />
          I: {content.fields.intelligence}<br />
          C: {content.fields.charm}<br />
          D: {content.fields.dexterity}<br />
          {content.fields.alternateOvercome && <>
          <br />
          <Subtitle>{content.fields.alternateOvercome}</Subtitle>
          B: {content.fields.alternate_bravery}<br />
          I: {content.fields.alternate_intelligence}<br />
          C: {content.fields.alternate_charm}<br />
          D: {content.fields.alternate_dexterity}<br />
          </>}
        </OneThird>
        <TwoThirds>
          <Subtitle>Crew Contributions</Subtitle>
          <List>
            {obstacle.contributions
              && Object.entries(obstacle.contributions).map(([crew_id, stats]) => {
                const member = crew.find(m => m._id === crew_id)
                return Object.entries(stats).map(([stat, value]) => <ListItem key={`${crew_id}.${stat}`}>
                  {member.name} contributed {value} {stat}
                </ListItem>)
              })}
          </List>
          {function() {
            
            if (overcame.bravery && overcame.intelligence && overcame.charm && overcame.dexterity) {
              return <Button onClick={onOvercome}>{content.fields.overcome}</Button>
            }

            if (content.fields.alternateOvercome && alternateOvercame.bravery && alternateOvercame.intelligence && alternateOvercame.charm && alternateOvercame.dexterity) {
              return <Button onClick={onOvercome}>{content.fields.alternateOvercome}</Button>
            }

            return <Button disabled>Overcome</Button>
          }()}
        </TwoThirds>
      </Flex>
    </Card>
  </Overlay>
}