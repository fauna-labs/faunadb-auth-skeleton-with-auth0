import { askKeyOrGetFromtEnvVars, getClient } from './../helpers/script-helpers'
require('dotenv').config({ path: '.env.' + process.argv[2] })

const fs = require('fs')

const envfile = require('envfile')
const envFrontend = './../frontend/.env.local'
const envFrontendExample = './../frontend/.env.local.example'
// This script sets up the database to be used for this example application.
// Look at the code in src/fauna/setup/.. to see what is behind the magic

const { setupDatabase } = require('../setup/database')

const main = async () => {
  // To set up we need an admin key either set in env vars or filled in when the script requests it.
  const adminKey = await askKeyOrGetFromtEnvVars()
  const client = await getClient(adminKey, true)

  try {
    const provider = await setupDatabase(client)
    writeExampleEnvFile(envFrontend, envFrontendExample, {
      REACT_APP_LOCAL___AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      REACT_APP_LOCAL___FAUNADB_DOMAIN: process.env.FAUNADB_DOMAIN,
      REACT_APP_LOCAL___FAUNADB_SCHEME: process.env.FAUNADB_SCHEME,
      REACT_APP_LOCAL___AUTH0_AUDIENCE: provider.audience
    })
  } catch (err) {
    console.error('Unexpected error', err)
  }
}

// -------------- Helpers -------------------

function writeExampleEnvFile(path, examplePath, extra) {
  // Write frontend .env.local
  let json = null
  try {
    json = envfile.parseFileSync(path)
  } catch (err) {
    json = envfile.parseFileSync(examplePath)
  }
  Object.keys(extra).forEach(k => {
    json[k] = extra[k]
  })
  fs.writeFileSync(path, envfile.stringifySync(json))
}

main()
