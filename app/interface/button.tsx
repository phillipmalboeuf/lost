import React, { FunctionComponent } from 'react'
import styled, { css } from 'styled-components'
import { ink } from '../settings/colors'
import { text } from '../settings/sizes'

const Sutton = styled.button<{ transparent?: boolean }>`
  outline: none;
  cursor: pointer;
  color: white;
  background: ${ink[0]};
  font-family: 'Inter';
  font-size: ${text[1]};
  padding: ${text[1]};
  border: none;
  border-radius: ${text[2]};

  ${props => props.transparent && css`
    color: inherit;
    padding: 0;
    background: none;
  `}

  ${props => props.disabled && css`
    text-decoration: line-through;
    background: ${ink[1]};
    opacity: 0.33;
  `}

  &:active {
    transform: scale(0.96);
  }
`

export const Button: FunctionComponent<{
  to?: string
  transparent?: boolean
  disabled?: boolean
  onClick?: () => void | Promise<void>
}> = ({ children, onClick, transparent, disabled }) => {
  return <Sutton onClick={onClick} transparent={transparent} disabled={disabled}>
    {children}
  </Sutton>
}