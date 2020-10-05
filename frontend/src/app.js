import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Home from './pages/home'
import Login from './pages/login'

import Logout from './pages/logout'
import Layout from './components/layout'

const App = () => {
  // Return the header and either show an error or render the loaded profiles.
  return (
    <React.Fragment>
      <Auth0Provider
        domain={process.env.REACT_APP_LOCAL___AUTH0_DOMAIN}
        clientId={process.env.REACT_APP_LOCAL___AUTH0_CLIENTID}
        audience={process.env.REACT_APP_LOCAL___AUTH0_AUDIENCE}
        redirectUri={window.location.origin}
      >
        <Router>
          <Layout>
            <Switch>
              <Route exact path="/accounts/login">
                <Login />
              </Route>
              <Route exact path="/accounts/logout">
                <Logout />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Layout>
        </Router>
      </Auth0Provider>
    </React.Fragment>
  )
}

export default App
