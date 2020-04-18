import styled, { css } from 'styled-components'

import { text } from '../settings/sizes'
import { ink } from '../settings/colors'

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const ListItem = styled.li`
  ${({ onClick }) => onClick && css`cursor: pointer;`}
  font-size: ${text[1]};
  padding: ${text[1]} 0;
  border-bottom: 2px solid ${ink[0]};

  &:last-child {
    margin-bottom: ${text[1]};
  }
`