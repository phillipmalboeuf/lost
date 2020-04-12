import React from 'react'
import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'

import { Boat } from '../shapes/boat'
import { useEvent } from '../socket'
import type { BoatDocument } from '../../server/models/boat'
import type { Entry } from 'contentful'


export const B: FunctionComponent<RouteComponentProps<{ _id: string }>> = props => {
  const boat = useEvent<BoatDocument>('fetchBoat', { _id: props.match.params._id })
  const crew = useEvent<Entry<{ title: string }>[]>('listCrewMembers')

  return boat && <>
    <Boat />
    <div style={{ position: 'relative', zIndex: 1 }}>
      {boat.name}
      {crew && <ul>
        {crew.map(member => <li key={member.sys.id}>{member.fields.title}</li>)}  
      </ul>}
    </div>
  </>
}