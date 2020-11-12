import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const {
  Collection,
  Query,
  Lambda,
  Select,
  Not,
  Equals,
  Get,
  Var,
  Let,
  And,
  CurrentToken,
  Any,
  Paginate,
  Match,
  Index,
  CurrentIdentity
} = q

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

/****
 * Example of an advanced role where fine-grained permissions such as:
 *   "read:dinosaurs",
 *   "read:dinosaurs:common",
 *   "read:dinosaurs:epic",
 *   "read:dinosaurs:exotic",
 *   "read:dinosaurs:legendary",
 *   "read:dinosaurs:rare",
 *   "read:dinosaurs:uncommon"
 * are verified. At first this seems complex but we'll use a small helper to simplify the process.
 * If it makes sense to manage such fine-grained permissions via Auth0 for your usecase, do not hesitate
 * since you can easily take this one step further and generate these kind of roles programmatically.
 **/
const CreateLoggedInRoleFineGrained = () =>
  CreateOrUpdateRole({
    name: 'loggedin_fine_grained',
    privileges: [
      {
        resource: Collection('dinos'),
        actions: {
          read: Query(
            Lambda(
              ['dinoRef'],
              And(
                HasAccessToCollection('dinosaurs', 'read'),
                HasAccessToDinosaurType('dinosaurs', 'read', Select(['data', 'rarity'], Get(Var('dinoRef'))))
              )
            )
          )
        }
      }
    ]
  })

/*****
 * Function to easily enforce collection-level read rules
 * those will come in on the permissions attribute in the token as:
 *   read:dinosaurs
 * which a helper FQL function will parse to:
 * {
 *  action: "read",
 *  collection: "dinosaurs",
 *  type: "common"
 * }
 * All we then have to do is verify whether the action and collection
 * is present in one of the permissions objects. The helper function
 * 'HasAccessGeneric' will loop over them and verify that for us.
 */
const HasAccessToCollection = (collectionName, accessType) => {
  return HasAccessGeneric(
    And(
      Equals(accessType, Select(['action'], Var('splitString'))),
      Equals(collectionName, Select(['collection'], Var('splitString')))
    )
  )
}

const HasAccessToDinosaurType = (collectionName, accessType, dinoType) => {
  return HasAccessGeneric(
    And(
      Equals(dinoType, Select(['type'], Var('splitString'))),
      Equals(accessType, Select(['action'], Var('splitString'))),
      Equals(collectionName, Select(['collection'], Var('splitString')))
    )
  )
}

/*****
 * Loops over the incoming permissions and verifies whether the defined rules returns true
 * for any of them.
 */
const HasAccessGeneric = Rule => {
  return Any(
    q.Map(
      Select(['permissions'], CurrentToken()),
      Lambda(
        ['permissionString'],
        Let(
          {
            splitString: GetActionCollectionType(Var('permissionString'))
          },
          Rule
        )
      )
    )
  )
}

/*****
 * turns the strings into a more convenient object. going from read:dinosaurs:common
 * to
 * {
 *   action: "read",
 *   collection: "dinosaurs",
 *   type: "common"
 * }
 * so we can mor eeasily work with them.
 */
const GetActionCollectionType = permissionString =>
  Let(
    {
      split: q.FindStrRegex(permissionString, q.Concat(['[^\\', ':', ']+'])),
      action: Select([0, 'data'], Var('split'), false),
      collection: Select([1, 'data'], Var('split'), false),
      dinoType: Select([2, 'data'], Var('split'), false)
    },
    { action: Var('action'), collection: Var('collection'), type: Var('dinoType') }
  )

const CreateLoggedInRoleWithFaunaDBGeneric = (roleName, FQLStatement) =>
  Query(
    Lambda(
      ['dinoReference'],
      Select(
        ['data', 0],
        Any(
          q.Map(
            Paginate(Match(Index('users_to_roles_by_user'), CurrentIdentity()), {
              size: 100000
            }),
            Lambda(
              ['roleMapping'],
              Let(
                {
                  role: Get(Select(['data', 'role'], Get(Var('roleMapping')))),
                  roleName: Select(['data', 'name'], Var('role'))
                },
                And(Equals(Var('roleName'), roleName), FQLStatement)
              )
            )
          )
        )
      )
    )
  )

const CreateLoggedInRoleWithFaunaDBPublic = CreateOrUpdateRole({
  name: 'loggedin_fauna_collections_public',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: CreateLoggedInRoleWithFaunaDBGeneric(
          'Public',
          Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'common')
        )
      }
    }
  ]
})

const CreateLoggedInRoleWithFaunaDBNormal = CreateOrUpdateRole({
  name: 'loggedin_fauna_collections_normal',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: CreateLoggedInRoleWithFaunaDBGeneric(
          'Normal',
          Not(Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'legendary'))
        )
      }
    }
  ]
})

const CreateLoggedInRoleWithFaunaDBAdmin = CreateOrUpdateRole({
  name: 'loggedin_fauna_collections_admin',
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: CreateLoggedInRoleWithFaunaDBGeneric('Admin', true)
      }
    }
  ]
})

export {
  CreateLoggedRoleInBasic,
  CreateLoggedInRolePublic,
  CreateLoggedInRoleAdmin,
  CreateLoggedInRoleNormal,
  CreateLoggedInRoleFineGrained,
  CreateLoggedInRoleWithFaunaDBPublic,
  CreateLoggedInRoleWithFaunaDBNormal,
  CreateLoggedInRoleWithFaunaDBAdmin
}
