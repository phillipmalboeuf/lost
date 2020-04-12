import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink } from '../settings/colors'
import { text } from '../settings/sizes'

const Sutton = styled.button`
  outline: none;
  cursor: pointer;
  color: white;
  background: ${ink[0]};
  font-family: 'Inter';
  font-size: ${text[1]};
  padding: ${text[1]};
  border: none;
  border-radius: ${text[2]};

  &:active {
    transform: scale(0.96);
  }
`

export const Button: FunctionComponent<{
  to?: string
  onClick?: () => void | Promise<void>
}> = ({ children, onClick }) => {
  return <Sutton onClick={onClick}>
    {children}
  </Sutton>
}