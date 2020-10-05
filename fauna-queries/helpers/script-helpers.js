require('dotenv').config({ path: '.env.' + process.argv[2] })
console.log(process.argv[2])

const { executeFQL } = require('../helpers/fql')

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateKey, Exists, Database, CreateDatabase, If, Get } = q
const readline = require('readline-promise').default

const keyQuestion = `----- 1. Please provide a FaunaDB admin key) -----
You can get one on https://dashboard.fauna.com/ on the Security tab of the database you want to use.

An admin key is powerful, it should only be used for the setup script, not to run your application!
At the end of the script a key with limited privileges will be returned that should be used to run your application
Enter your key or set it .env.local as 'FAUNADB_ADMIN_KEY' (do not push this to git):`

const explanation = `
Thanks!
This script will (Do not worry! It will all do this for you):
 - Setup the access provider
 - Create different example roles for the access provider to use
 - Create the collections that the application uses for it's data)
`

export async function askKeyOrGetFromtEnvVars() {
  let adminKey = process.env.FAUNADB_ADMIN_KEY
  // Ask the user for a key if it's not provided in the environment variables yet.
  if (!adminKey || adminKey === 'undefined') {
    const interactiveSession = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    await interactiveSession.questionAsync(keyQuestion).then(key => {
      adminKey = key
      interactiveSession.close()
    })
    console.log(explanation)
  }
  return adminKey
}

export async function getClient(adminKey) {
  // either we just use the admin key that we received for the client
  const opts = { secret: adminKey }
  if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
  if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
  let client = new faunadb.Client(opts)

  const childDbName = process.env.CHILD_DB_NAME
  // except if the childDbName env var was set.
  if (childDbName && typeof childDbName !== 'undefined') {
    // If this option is provided, the db will be created as a child db of the database
    // that the above admin key belongs to. This is useful to destroy/recreate a database
    // easily without having to wait for cache invalidation of collection/index names.
    const CreateDBQuery = If(
      Exists(Database(childDbName)),
      Get(Database(childDbName)),
      CreateDatabase({ name: childDbName })
    )
    const database = await executeFQL(client, CreateDBQuery, 'database - create child database if it doesnt exist')
    const CreateKeyQuery = CreateKey({ database: Database(childDbName), role: 'admin' })
    const key = await executeFQL(client, CreateKeyQuery, 'database admin key - create child database admin key')

    // in that case, we'll use a key from the child database to continue.
    const opts = { secret: key.secret }
    if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
    if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
    client = new faunadb.Client(opts)
    // If the admin key was a database called: 'example'
    // and our CHILD_DB_NAME was 'local', then we just
    // created a database structure as follows:
    // |--- example (parent db)               > initial admin key
    //         |---- local (child db)         > our current key
  }
  return client
}
