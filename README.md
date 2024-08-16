# id-assertion-authz-node-example

This repo is proof-of-concept example of the proposed [Identity Assertion Authorization Grant](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant) flow. This flow is a subset of the Token Exchange grant which allows identity assertions received by a client via SSO to be exchanged with a trusted Identity Provider for an `id-jag` token. Such a token can then be exchanged for an access token with the resource authorization server. For for information, watch the explainer video [here](https://www.youtube.com/watch?v=I0vdmg79Ga4).

<img src="images/id_assertion_authz_grant_flow.gif" alt="gif" width="450"/>

# How To

To demonstrate the usage of this flow, this repo currently contains two applications: **Wiki0** and **Todo0**.

When links to Todo0 tasks are pasted into a Wiki0 page, will unfurl and show task details automatically.
<br />

> [!NOTE]
> When running locally, you must use a domain stored in the local database.
> You should use the email `bob@tables.fake` to login to both applications, and this will initiate the login flow using the IDP information configured.

Steps:

- Login to Todo0
- Create a task in Todo0
- Copy the link to the task by clicking the "#"
  <br />
- Login to Wiki0
- Create a new page
- Edit the page by pasting in the link to the Todo0 task
- See the unfurled task populate! (Example below)

<img src="images/example.png" alt="example" width="200"/>

# Dev Setup

This application runs locally using [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/tutorial). If you cannot use VSCode, you can follow the instructions [here](#non-vscode-alternative-option).

## Requirements

- [Docker desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/)
- [Dev Containers VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Configuration

At the project root, copy over the default files into `.env` files:

> [!NOTE]
> You can run this application in either SAML or OIDC mode. In SAML mode, the Wiki0 authorization server will use SAML to SSO to the Idp as opposed to OIDC.

```
cp todo0/.env.default todo0/.env &&
cp wiki0/.env.default wiki0/.env &&
cp authorization-server/.env.wiki.default authorization-server/.env.wiki &&
cp authorization-server/.env.todo.default authorization-server/.env.todo
```

You must specify the following the issuer and client id in both your `.env.todo` & `.env.wiki` files to hook up the authorization server to your IDP:

```
CUSTOMER1_AUTH_ISSUER="<FILL IN>"
CUSTOMER1_CLIENT_ID="<FILL IN>"
```

### For SAML
For `.env.wiki` you must also specify your SAML configuraiton:

```
USE_SAML_SSO="true"
CUSTOMER1_SAML_ENTRY_POINT="<FILL IN>"
CUSTOMER1_SAML_ISSUER="<FILL IN>"
CUSTOMER1_SAML_CERTIFICATE="<FILL IN>"
```

## Setup

Activate Dev Containers by:

- Typing `cmd+shift+P`
- Searching for "Dev Containers: Open Folder In Container"
- Navigating to the folder where the repo was cloned (e.g. `~/gitpublic/id-assertion-authz-node-example`)

This will automatically begin installing dependencies in a terminal window in VSCode.

If running the app for the first time, seed the database to get your db in a baseline state:

```
yarn resetdb
```

## Running Locally

Open a new terminal window within VSCode for below commands to run each application and its respective authorization server. Then, you may open the "PORTS" tab and click on the mapped "Forwarded Address" to open the app in your browser.

### Wiki0

```
yarn dev:wiki
```

Running at http://localhost:3000/

```
yarn auth:wiki
```

Running at http://localhost:5000/

### Todo0

```
yarn dev:todo
```

Running at http://localhost:3001/

```
yarn auth:todo
```

Running at http://localhost:5001/

### Cleanup

Stop the running node processes in the terminal, and stop the VSCode Dev Container or stop the container in Docker Desktop.

# Non-VSCode Alternative Option

Alternative option for users who want to run this application locally without using VSCode Dev Containers.

<details>
  <summary>Instructions</summary>

## Requirements

[Docker](https://www.docker.com/products/docker-desktop/)

[Node 20+](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm install-latest-npm
```

Yarn

```
npm install --global yarn
```

## Setup

### Configuration

Follow the section [Configuration](#Configuration)

### Installation

This install dependencies at the root and in the authorization sever, builds a local dependency package, and runs the initial DB schema migration.

```
yarn install && yarn postinstall
```

### Database

If running the app for the first time, seed the database to get your db in a baseline state:

```
yarn resetdb
```

## Running Locally

First, standup Redis and MariaDB containers in a terminal window:

```
cd local-development
docker-compose up
```

#### Running Apps

Then, follow the section [Running Locally](#Running-Locally)

## Cleanup

To stop the application, stop all running node processes using Ctrl + C and run:

```
cd local-development
docker-compose down
```

</details>
<br />
<br />

# Troubleshooting

If you have any trouble, try re-authenticating to ~both~ applications by signing out and signing in again.

# Dev Tips

**Access the mysql database directly with the following:**

```
mariadb -u root --password=avocado -P 3306
```

**Run the following after making schema changes to a schema.prisma file**

Make sure to replace the content in `<>`.

```
export WIKI_DATABASE_URL=<DB_URL>
export TODO_DATABASE_URL=<DB_URL>
```

```
yarn dlx prisma migrate dev --name <some nice description of the changes you made> --schema <project>/prisma/schema.prisma
```

**Remove all Redis keys with a given prefix**

```
# PREFIX could be, for example, "todo0:"
redis-cli --scan --pattern "<PREFIX>" | xargs redis-cli del
```


# How to Integrate into an Existing Service
This section outlines the steps needed to implement ID Assertion Authorization Grant in your existing application.
There are three actors in this flow, the Identity Provider (IdP), the Requesting Application, and the Resource application.

1. The Identity Provider issues `ID-JAG` tokens, and is the SSO provider for the Requesting and Resource apps for a given user.

1. The **Requesting Application** is the Client application which will make the token exchange request to the IdP, ultimately requesting protected resource access from the Resource Server. 

1. The **Resource Application** is the application which owns the protected resources and must issue access tokens to the Requesting Application using the flow.

You app can support this flow as a **Requesting App**, a **Resource App**, or both! We recommend integrating in only on way to get started. The section will also cover best practices based on the architecture of the given apps.

## Requesting App Steps
The Requesting App is the application that is requesting or querying objects or pulling data from another application. This section describes the specific steps to build the ID Assertion Authorization Grant into the application. The Requesting App must make a separate request to IdP for an `ID-JAG` token for each unique resource the user wants to access. To prevent performance issues, follow these best practices:

> **Tip!**  Checkout the Debug Console in the App for detailed views of the requests!

1. Configure SSO with an IdP which supports this flow.
1. After the Login SSO flow for a user, store the `id_token` or the `refresh_token` returned from the IdP. These are needed to make the token exchange request. (If the `id_token` expires before you want to make the exchange, use the `refresh_token` to receive a new `id_token`.)

1. When you want to load a resource for a user in your application logic, make a token exchange request to the IdP within the lifetime of the `id_token`. Follow [this code example](https://github.com/oktadev/id-assertion-authz-node-example/blob/2a4068213845f4907c90b40823395b14f5dc20a6/packages/wiki0/src/server/controllers/oidc.ts#L110), and/or see the specifics of the request in Section 5 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).


1. Using the result of the exchange, make an `access_token` request to the authorization server. Follow [this code example](https://github.com/oktadev/id-assertion-authz-node-example/blob/2a4068213845f4907c90b40823395b14f5dc20a6/packages/wiki0/src/server/controllers/oidc.ts#L143), and/or see the specifics of the request in Section 6 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).

1. Store and use the `access_token` as your normally would with the 3rd party resource server.


### Best Practices for Requesting Apps
 1. **Do not add to login flow**. It is not necessary to preload all the JAG tokens, so it is not necessary to mint all of the possible JAG tokens at the time of login. The side effects can be extended login times for users.
 1. **Only request when needed**. JAG tokens should be requested at the last responsible moment. JAG tokens are not meant to be long lived. Loading does not need to be bulk loaded and optimized. Trying to optimize the requests for multiple JAG tokens can result in poor performance at scale.
 1. **Do not store JAG Tokens. Store ID, Access and Refresh Tokens**. JAGs are really short lived. As mentioned earlier, JAGs are passed from Requesting Apps to Resource Apps to exchange for an Access Token to access the Resource App. The Access Token is the valuable artifact to be stored and protected. The JAG token is effectively useless once exchanged, so it should be discarded.


## Resource App Steps

The Resource App is the application that owns protected resources normally accessed via OAuth2.0 by Requesting App users. This section describes the specific steps to support the ID Assertion Authorization Grant into the application. The Resource App is responsible for validating  `ID-JAG` tokens before issuing OAuth `access_tokens` as it normally would.

> **Tip!**  Checkout the Debug Console in the App for detailed views of the requests!

1. Configure SSO with an IdP which supports this flow.
1. Modify your Authorization Server logic accept these requests at your OAuth2.0 token endpoint. Seethe specifics of the incoming request in Section 6 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).
1. Validate the `ID-JAG` tokens properly before issuing an `access_token` as your normally would. Ensure all validations your authorization makes in regular OAuth2.0 flows also apply to this exhcange when evaluating user atuhorization, such as scope validation. Follow [this code example](id-assertion-authz-node-example/packages/authorization-server/jwt-authorization-grant.js), and/or see the specifics of the processing rules in Section 6.1 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).
1. Respond with an access token, as outlined in Section 6.1 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).