import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink, sand } from '../settings/colors'
import { text } from '../settings/sizes'

const Div = styled.div`
  pointer-events: auto;
  display: inline-block;
  background: ${sand[0]};
  font-size: ${text[1]};
  padding: ${text[1]};
  border: none;
  border-radius: ${text[2]};
`

export const Card: FunctionComponent<{
  
}> = ({ children }) => {
  return <Div>
    {children}
  </Div>
}