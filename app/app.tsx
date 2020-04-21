console.log('Lost at Sea')


import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import type { FunctionComponent } from 'react'
import type { Entry } from 'contentful'
import { BrowserRouter, Route, Switch, Redirect, Router } from 'react-router-dom'
import { createBrowserHistory, History, UnregisterCallback } from 'history'

import { Boat } from './shapes/boat'
import { Map } from './shapes/map'
import { Wave } from './shapes/wave'
import { Island } from './shapes/island'
import { Button } from './interface/button'
import { Title } from './interface/text'
import { Input } from './interface/input'

import { send, on, useEvent } from './socket'

import type { MapDocument } from '../server/models/map'
import type { BoatDocument } from '../server/models/boat'

import { M } from './routes/m'
import { B } from './routes/b'


const history = createBrowserHistory()


const App: FunctionComponent<{}> = () => {

  useEffect(() => {
    on('newMap', ({ detail }) => history.push(`/m/${detail._id}`))
    on('newBoat', ({ detail }) => history.replace(`/m/${detail.map_id}/b/${detail._id}`))
  }, [])

  function newMap() {
    send('newMap', {})
  }

  function newBoat(name: string, map_id: string) {
    send('newBoat', { name, map_id })
  }

  return <Router history={history}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Title>Lost at Sea</Title>

      <Switch>
        <Route exact path='/' render={props => <>
          <Button onClick={newMap}>Create a New Map</Button>
        </>} />
        <Route exact path='/m/:_id' render={props => <form onSubmit={e => {
          e.preventDefault()
          newBoat(e.currentTarget['boatname'].value, props.match.params._id)
        }}>
          <Input name='boatname' label={'Name your boat'} />
          <Button>Anchor Away!</Button>
        </form>} />
      </Switch>
    </div>
    
    <Switch>
      <Route path='/m/:_id' render={props => <M key={props.match.params._id} {...props}>
        <Route exact path='/m/:map_id/b/:_id' render={props => <B key={props.match.params._id} {...props} />} />
      </M>} />
    </Switch>
  </Router>
}


ReactDOM.render(<App />, document.getElementById('app'))