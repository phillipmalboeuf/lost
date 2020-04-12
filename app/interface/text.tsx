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