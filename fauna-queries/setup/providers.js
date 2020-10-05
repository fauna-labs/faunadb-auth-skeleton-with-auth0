import { CreateOrUpdateProvider } from './../helpers/fql'
import urljoin from 'url-join'

const faunadb = require('faunadb')
const q = faunadb.query
const { Role } = q

const CreateAuth0ProviderSimple = CreateOrUpdateProvider(
  {
    name: 'Auth0',
    issuer: 'https://' + process.env.AUTH0_DOMAIN + '/',
    jwks_uri: 'https://' + urljoin(process.env.AUTH0_DOMAIN, '.well-known/jwks.json'),
    roles: [Role('loggedin_basic')]
  },
  // optional parameter for in case we are changing the name of a previously created provider.
  // if the name didn't change, you can ignore it. If it did, use this parameter to
  // specify the old name to be able to update the previous provider.
  'Auth0'
)

export { CreateAuth0ProviderSimple }
