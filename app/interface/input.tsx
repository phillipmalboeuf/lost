import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink, sand } from '../settings/colors'
import { text } from '../settings/sizes'

const Snput = styled.input`
  outline: none;
  display: block;
  color: ${ink[0]};
  background: ${sand[0]};
  font-family: 'Tiempos Headline Test';
  font-size: ${text[1]};
  padding: ${text[1]};
  border: none;
  border-radius: ${text[2]};
  margin-bottom: 0.5em;

  &:active {
    transform: scale(0.96);
  }
`

export const Input: FunctionComponent<{
  name: string
  type?: 'text' | 'email'
  label?: string | JSX.Element
}> = ({ name, label }) => {
  return <>
    {label && <label htmlFor={name}>{label}</label>}
    <Snput name={name} id={name} type='text' />
  </>
}