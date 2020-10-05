import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const { Collection } = q

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

export { CreateLoggedRoleInBasic }
