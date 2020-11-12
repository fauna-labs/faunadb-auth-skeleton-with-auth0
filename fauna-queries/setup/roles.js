import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const { Collection, Query, Lambda, Select, Not, Equals, Get, Var } = q

const CreateLoggedRoleInBasic = CreateOrUpdateRole({
  name: 'loggedin_basic',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: true
      }
    }
  ]
})

/****
 * Example of a simple role in case we want to define the access via the predicates.
 * We'll assign this role in case the predicate sees teh 'role:normal' permission.
 * Normal users have access to all dinos except the legendary ones.
 **/
const CreateLoggedInRoleNormal = CreateOrUpdateRole({
  name: 'loggedin_normal',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: Query(
          Lambda(['dinoReference'], Not(Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'legendary')))
        )
      }
    }
  ]
})

/****
 * Example of a simple role in case we want to define the access via the predicates on the Access Provider.
 * We'll assign this role in case the predicate sees teh 'role:admin' permission.
 * Administrators have access to the whole collection.
 **/
const CreateLoggedInRoleAdmin = CreateOrUpdateRole({
  name: 'loggedin_admin',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: true
      }
    }
  ]
})

/****
 * Example of a simple role in case we want to define the access via the predicates on the Access Provider.
 * We'll assign this role in case the predicate sees teh 'role:normal' permission.
 * Public users only have access to common dinos. Since public users are not logged in, we will
 * create this token in advance via the Auth0 API.
 **/
const CreateLoggedInRolePublic = CreateOrUpdateRole({
  name: 'loggedin_public',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: Query(Lambda(['dinoReference'], Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'common')))
      }
    }
  ]
})

export { CreateLoggedRoleInBasic, CreateLoggedInRolePublic, CreateLoggedInRoleAdmin, CreateLoggedInRoleNormal }
