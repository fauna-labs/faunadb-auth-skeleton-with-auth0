import faunadb from 'faunadb'

import { GetAllDinos } from './../../../fauna-queries/queries/dinos'
import { LogoutAccount } from './../../../fauna-queries/queries/auth-login'

/* Initialize the client to contact FaunaDB
 * The client has no token to start with giving it no permission.
 * If you would require public data to be freely available you could create a bootstrap key.
 * that provides these permissions that you could insert here instead of null.
 */

class QueryManager {
  constructor() {
    const opts = { secret: null }
    this.setDefaults(opts)
    this.client = new faunadb.Client(opts)
  }

  setToken(auth0AccessToken) {
    const opts = { secret: auth0AccessToken }
    this.setDefaults(opts)
    this.client = new faunadb.Client(opts)
  }

  logout() {
    return this.client.query(LogoutAccount()).then(res => {
      const opts = { secret: null }
      this.setDefaults(opts)
      this.client = new faunadb.Client(opts)
    })
  }

  getDinos(handle) {
    console.log('get dinos')
    return this.client.query(GetAllDinos)
  }

  async postData(url, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      return response.json().then(err => {
        throw err
      })
    } else {
      return response.json()
    }
  }

  // Helper for connecting to local docker instances / preview cluster.
  setDefaults(opts) {
    if (process.env.REACT_APP_LOCAL___FAUNADB_SCHEME) opts.scheme = process.env.REACT_APP_LOCAL___FAUNADB_SCHEME
    if (process.env.REACT_APP_LOCAL___FAUNADB_DOMAIN) opts.domain = process.env.REACT_APP_LOCAL___FAUNADB_DOMAIN
  }
}
const faunaQueries = new QueryManager()
export { faunaQueries }
