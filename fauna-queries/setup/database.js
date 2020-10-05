import { createDinoCollection, PopulateDinos } from './dinos'
import { handleSetupError } from '../helpers/errors'
import { executeFQL } from '../helpers/fql'
import { CreateLoggedRoleInBasic } from './roles'
import { CreateAuth0ProviderSimple } from './providers'

async function setupDatabase(client) {
  const resDinos = await handleSetupError(createDinoCollection(client), 'collections/indexes - dinos collection')
  // Finally the membership role will give logged in Accounts (literally members from the Accounts collection)
  // access to the protected data.

  await executeFQL(client, CreateLoggedRoleInBasic, 'roles - collection-based role - logged in')

  // Create Identity providers
  const provider = await executeFQL(client, CreateAuth0ProviderSimple, 'provider - auth0 provider')
  console.log(
    `
The provider was created, copy the audience (which is dervied from the databases' global_id)
to configure the audience/identifier of the API at your Identity Providers side (Auth0 in this case)
!!! Make sure to place the audience in your frontends env variables as: REACT_APP_LOCAL___AUTH0_AUDIENCE (e.g. in .env.local)

`,
    provider
  )

  // Populate, add some mascottes if the collection was newly made
  // (resDinos will contain the collection if it's newly made, else false)
  if (resDinos) {
    await executeFQL(client, PopulateDinos, 'populate - add some mascot data')
  }
  return provider
}

export { setupDatabase }
