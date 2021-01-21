import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

const Main = React.lazy(() => import('./pages/main'))
const DistortionMaterial = React.lazy(() => import('./pages/distortion-material'))
const Voronoi = React.lazy(() => import('./pages/voronoi'))
const MoreInstances = React.lazy(() => import('./pages/more-instances'))

import { Switch, Route } from 'wouter'

import './style.css'

function App() {
  return (
    <React.Suspense fallback={<>loading.</>}>
      <Switch>
        <Route path="/">{() => <Main />}</Route>
        <Route path="/distortion">{() => <DistortionMaterial />}</Route>
        <Route path="/voronoi">{() => <Voronoi />}</Route>
        <Route path="/more-instances">{() => <MoreInstances />}</Route>
      </Switch>
    </React.Suspense>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
