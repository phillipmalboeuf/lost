import React, { FunctionComponent } from 'react'
import styled, { css } from 'styled-components'
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
  ${({ z }) => z && css`
    position: relative;
    z-index: ${z}; 
  `}
  ${({ wide }) => wide && css`
    width: 66ch;
  `}
`

export const Card: FunctionComponent<{
  z?: number
  wide?: boolean
}> = ({ children, z, wide }) => {
  return <Div z={z} wide={wide}>
    {children}
  </Div>
}