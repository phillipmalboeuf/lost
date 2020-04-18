import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink } from '../settings/colors'
import { text } from '../settings/sizes'

export const Title = styled.h1`
  color: ${ink[0]};
  font-size: ${text[0]};
  line-height: 1;
  margin: 0;
`

export const Subtitle = styled.h3`
  font-size: ${text[1]};
  font-weight: bold;
  line-height: 1;
  margin: 0;
`

export const Paragraph = styled.p`
  font-size: ${text[1]};
  line-height: 1.33;
  margin: ${text[1]} 0;

  &:first-child {
    margin-top: 0;
  }
`