import { CreateOrUpdateProvider } from './../helpers/fql'
import urljoin from 'url-join'

const faunadb = require('faunadb')
const q = faunadb.query
const { Role, Query, Lambda, ContainsValue, Select, Var } = q

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

const AssignRole = (faunaRole, auth0Role) => {
  return {
    role: Role(faunaRole),
    predicate: Query(
      Lambda('accessToken', ContainsValue(auth0Role, Select(['https:/db.fauna.com/roles'], Var('accessToken'))))
    )
  }
}

const CreateAuth0ProviderRoles = CreateOrUpdateProvider(
  {
    name: 'Auth0',
    issuer: 'https://' + process.env.AUTH0_DOMAIN + '/',
    jwks_uri: 'https://' + urljoin(process.env.AUTH0_DOMAIN, '.well-known/jwks.json'),
    roles: [
      AssignRole('loggedin_normal', 'Normal'),
      AssignRole('loggedin_admin', 'Admin'),
      AssignRole('loggedin_public', 'Public')
    ]
  },
  'Auth0'
)

const CreateAuth0ProviderFineGrained = CreateOrUpdateProvider(
  {
    name: 'Auth0',
    issuer: 'https://' + process.env.AUTH0_DOMAIN + '/',
    jwks_uri: 'https://' + urljoin(process.env.AUTH0_DOMAIN, '.well-known/jwks.json'),
    roles: [Role('loggedin_fine_grained')]
  },
  'Auth0'
)

export { CreateAuth0ProviderRoles, CreateAuth0ProviderSimple, CreateAuth0ProviderFineGrained }
