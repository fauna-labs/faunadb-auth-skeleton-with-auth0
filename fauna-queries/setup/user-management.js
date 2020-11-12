import { IfNotExists } from '../helpers/fql'
const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, Collection, CreateIndex, Index, Create, Do } = q

const CreateUsersToRolesCollection = CreateCollection({ name: 'users_to_roles' })
const CreateRolesCollection = CreateCollection({ name: 'roles' })

const CreateIndexUserToRolesByUser = CreateIndex({
  name: 'users_to_roles_by_user',
  source: Collection('users_to_roles'),
  serialized: true,
  terms: [
    {
      field: ['data', 'user']
    }
  ]
})

const CreateIndexRolesByName = CreateIndex({
  name: 'roles_by_name',
  source: Collection('roles'),
  serialized: true,
  terms: [
    {
      field: ['data', 'name']
    }
  ]
})

async function createUsersToRolesCollection(client) {
  // We don't have users since those are managed in Auth0.
  // However, we can still link users to FaunaDB resources.
  await client.query(IfNotExists(Collection('users_to_roles'), CreateUsersToRolesCollection))
  await client.query(IfNotExists(Collection('roles'), CreateRolesCollection))
  await client.query(IfNotExists(Index('users_to_roles_by_user'), CreateIndexUserToRolesByUser))
  await client.query(IfNotExists(Index('roles_by_name'), CreateIndexRolesByName))
}

const PopulateRoles = Do(
  Create(Collection('roles'), {
    data: {
      name: 'Admin'
    }
  }),
  Create(Collection('roles'), {
    data: {
      name: 'Normal'
    }
  }),
  Create(Collection('roles'), {
    data: {
      name: 'Public'
    }
  })
)

export { createUsersToRolesCollection, PopulateRoles }
