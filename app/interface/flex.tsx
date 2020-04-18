import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink } from '../settings/colors'
import { text } from '../settings/sizes'

export const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const Half = styled.div`
  width: 50%;
`

export const TwoThirds = styled.div`
  width: ${(2/3)*100}%;
`

export const OneThird = styled.div`
  width: ${(1/3)*100}%;
`