# Skeleton frontend application with Auth0 and Fauna

### New Fauna features

This skeleton explains how to use the new Fauna features in combination with Auth0. These new features introduce a new concept called an Access Provider which allows you to configure your Fauna database to accept JWT tokens from an external IdP such as Auth0. In this skeleton we start by setting up Auth0 and Fauna for authentication (delivering SSO to your Fauna app) as explained in [this article](https://fauna.com/blog/setting-up-sso-authentication-in-fauna-with-auth0) and then continue with different authorization patterns as described in the [second article](https://fauna.com/blog/setting-advanced-role-based-access-patterns-in-your-spa-with-fauna-and-auth0). 

### About this repository

This repository contains a Skeleton application which shows how to implement a login flow with Auth0 and React, retrieve the user and access token (access JWT) and directly access Fauna with the Auth0 access JWT. The [default](https://github.com/fauna-brecht/faunadb-auth-skeleton-frontend-with-auth0/tree/default) branch contains the code (roles and access provider) to set up authentication with Auth0. The [extras](https://github.com/fauna-brecht/faunadb-auth-skeleton-frontend-with-auth0/tree/extras/) branch then builds upon this setup and implements three different more advanced authorization approaches. This skeleton goes along with a two-part blog post (link will be inserted later) that explains the setup and the different authorization approaches. 

The current approach is a frontend-only approach to avoid adding extra complexity. The approaches detailed here are similar and should be applicable to a more secure approach that includes a backend. The main change will probably be how you interact with Auth0 to retrieve the access token. 

### Repository folder structure

There are two main folders in this repository:

```
faunadb-auth-skeleton-frontend-with-auth0
  > fauna-queries      (fauna queries and setup scripts)
  > frontend           (a react example frontend)
```

Splitting off fauna queries makes it easier to find anything that is fauna related and and makes it easier for us to provide an example later on with a backend.



### Setup

#### Installing npm libraries

To set up the project, make sure to run npm install in the root folder and the previously mentioned folders (fauna-queries and frontend). For example, with the following series of commands.

```shell
npm install
cd frontend
npm install
cd ../fauna-queries
npm install
cd ..

```

### Set up the Fauna resources

A script was provided to set up Fauna resources which needs two variables to work properly:

<u>Getting the configuration variables</u>

1. **Get an Admin key:** to provide the script with privileges you will need an **Admin** key.  Go to http://dashboard.fauna.com/ and go to your preferred database or create a new database. Go to the **Security tab** within that database and select **New Key**. 

2. **Configure your Auth0 domain:**  you will need to inform the script about your Auth0 domain which typically is of the form  ```your-auth0-account.auth0.com```. Your account can be found in the upper right corner of your Auth0 dashboard and/or in your account settings. If you are unsure, the full URL can as be found in the basic information under the settings tab when you make a new Auth0 application (making an Auth0 app is explained in the blog post). As an example, since my Auth0 account is: ```faunadb-auth0``` my Auth0 domain is ```faunadb-auth0.auth0.com```.



<u>Where to configure this information.</u>

An .env example was provided in both the frontend as the fauna-queries folder. This configuration needs to be placed in the **fauna-queries** folder for which you can simply rename the ```/fauna-queries/.env.local.example``` to ```/fauna-queries/.env.local ```and fill in the following two variables:

```
FAUNADB_ADMIN_KEY=
AUTH0_DOMAIN=
```

Other variables are extra configuration options for your or development convenience which are explained at the bottom of this README. 

<u>Run the script</u>

Once those variables are set, simply run:

```
npm run setup
```

If everything goes according to plan, the script should print out the newly created **Access Provider** since it will contain the **audience** which will be needed to further configure Auth0 (we'll need it to create an Auth0 API).



<u>What does the script do for you?</u>

The script creates Fauna resources via the Fauna Query languages such as

* **Collections:** to contain some dummy data.
* **Documents:** we add some dummy data.
* **Indexes:** indexes to retrieve specific data (only in the extras branch)
* **Access Providers:** an access provider is what allows you to configure your database to accept Auth0 tokens. 
* **Roles**: roles to configure what data the tokens from the access provider can access. 

The script also writes environment variables to your frontend folder (it will create the .env.local) so you do not have to repeat yourself. One important variable there is the **audience** which will be taken from the newly created access provider, see the blog post for more details. 

### Set up the Auth0 resources

In order for this to work we need Auth0 resources, more specifically an **Application** and **API**. The finer details are beyond the scope of this README since an extensive tutorial has been written that goes along with this repository to set these up (todo, insert link) but in case you are familiar with Auth0, you will need: 

1. An Auth0 **Application**, for which the client ID will need to be assigned to the `REACT_APP_LOCAL___AUTH0_CLIENTID` variable  in `frontend/.env.local `

2. An Auth0 **API** with an **identifier** that equals the **audience** and **RS256**  as the signing algorithm. The audience is a property that can be found on the Access Provider that was creatd via the `npm run setup` command. You can find that audience 

   a)  in the output of the script 

   b) in the Fauna dashboard by going to the Security tab > Access Providers > the newly created access provider 

   c) in the`frontend/.env.local `  as the `REACT_APP_LOCAL___AUTH0_AUDIENCE` variable since the script already configured it there for you when you ran `npm run setup`. 

   Note that if you would restart this setup from scratch with a different database or destroy the database and start again that the audience will be different since the audience is derived from the databases global identifier and you need to set up a **new** Auth0 API. 

### Set up and run the frontend
The frontend also requires a `frontend/.env.local` file which is already created for you via the `npm run setup` command. The frontend/.env.local should already contain the following populated environment variables (plus the extra optional variables as described at the bottom of this document):

```
REACT_APP_LOCAL___AUTH0_DOMAIN=...
REACT_APP_LOCAL___AUTH0_AUDIENCE=...
```

You still need to configure the following variables which as mentioned above is the client ID from your Auth0 Application. 

```
REACT_APP_LOCAL___AUTH0_CLIENTID=
```

Once these environment variables are set you can run the frontend with:

```
npm run start_frontend
```

If you corectly set up the Auth0

## Extra information

#### Behavior of setup  and destroy scripts

These scripts are provided for your convenience, they are not production setup scripts as they don't deal with migrations. However, they are conveniently set up to either create new resources or update existing resources if they don't exist.

* **npm run setup**: is setup in such a way that you can run it multiple times and it will automatically update the resources that can be updated. Resources that can not be updated are indexes, in that case a destroy is necessary or you need to manually delete and recreate the index.
* **npm run destroy**: will destroy all fauna resources in your database. Since the names of such resources are cached you will have to wait 60 seconds to run npm run setup again. Therefore, there is also the option (see below) to set a `CHILD_DB_NAME` in which case a child database is created by `npm run setup `and the whole database is destroyed with `npm run destroyed` which circumvents the caching but is, of course, only useful for local development/testing.  

If you are interested to see what the setup script does, take a look at [this file]() follow the imports. 

#### Extra environment variables

There are extra environment variables that can be set in the .env files for development convenience.

In fauna-queries/.env.local:

* **CHILD_DB_NAME**: providing a child db name will create a child db, which makes it easier to destroy / setup frequently as there is no caching involved. Instead of creating the resources directly in your database you will see a child database appear in the database for which you defined the Admin key.
* **FAUNADB_SCHEME**: optionally set the scheme to connect to FaunaDB, by default this is **https**, this variable can be used to force it to **http** in case you are using a local docker instance.
* **FAUNADB_DOMAIN**: optionally configure a different domain in case you are using a local docker instance or connecting to a non-default cluster such as the preview environment.

When running the `npm run setup` script with these variables, they  will be automatically copied to the `frontend/.env.local` file with the REACT prefix so that both the setup scripts as the frontend accesses the same database.:

* **REACT_APP_LOCAL___FAUNADB_DOMAIN**
* **REACT_APP_LOCAL___FAUNADB_SCHEME**
