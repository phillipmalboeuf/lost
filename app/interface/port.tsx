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
import { BoatDocument } from '../../server/models/boat'

export const Port: FunctionComponent<{
  boat: BoatDocument
  crew: CrewDocument[]
  onFinish: () => void
}> = ({ onFinish, boat, crew }) => {

  return <Overlay>
    <Card wide>
      <Title>At Port</Title>
      <Subtitle>{boat.gold} Gold</Subtitle>
      <Paragraph>Spend gold to recover your stats.</Paragraph>
      <Button onClick={onFinish}>Finish</Button>
    </Card>
  </Overlay>
}