import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { ink, sand } from '../settings/colors'
import { text } from '../settings/sizes'

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`

const Back = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${ink[0]};
  opacity: 0.88;
`

const Content = styled.div`
  position: relative;
  zIndex: 1;
  max-height: 100%;
  overflow: auto;
`

export const Overlay: FunctionComponent<{
  
}> = ({ children }) => {
  return <Wrapper>
    <Back />
    <Content>{children}</Content>
  </Wrapper>
}