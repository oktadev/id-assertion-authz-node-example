> ⚠️ **Important:**
> To run this Cross-App Access demo app, you'll need an Okta Preview account. If you don't already have one, or if you're interested in testing Cross-App Access with Okta as your Identity Provider (IdP), please [sign up for our early access offering](https://www.okta.com/saas-security/sign-up/?_gl=1*pp31c*_gcl_au*NjgzNDkyOTQxLjE3NTA4Nzg2Njk.*_ga*MTk5NjYyODgxMi4xNzUwMjg1MDM3*_ga_QKMSDV5369*czE3NTEyOTY4OTYkbzgkZzEkdDE3NTEyOTg0MjEkajM5JGwwJGgw).

# Identity Assertion Authorization Grant – Node Example

A proof-of-concept for the [Identity Assertion Authorization Grant](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant) flow, demonstrating secure token exchange between SSO-enabled applications using Node.js. For a visual overview, see the [explainer video](https://www.youtube.com/watch?v=I0vdmg79Ga4).

![Test Flow](images/id_assertion_authz_grant_flow.gif)

# Table of Contents

- [Quickstart & Dev Setup](#quickstart--dev-setup)
- [Common Issues](#common-issues)
- [Troubleshooting](#troubleshooting)
- [Non-VSCode Alternative Option](#non-vscode-alternative-option)
- [Dev Tips](#dev-tips)
- [How to Integrate into an Existing Service](#how-to-integrate-into-an-existing-service)

# Quickstart & Dev Setup

**Highly Recommended:**

- **Run in GitHub Codespaces** - Just click "Code" → "Create codespace on main" in the GitHub UI and your environment will be ready in minutes.

  ![Codespaces Screenshot](images/codespace.png)

**Alternative (Local Dev):**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for local containers)
- [VS Code](https://code.visualstudio.com/) (required for Dev Containers)
- [Dev Containers VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## 1. Clone and Open in VS Code

> **Note:** If you are using GitHub Codespaces, you can skip this step as the repository will be automatically cloned for you.

```sh
git clone https://github.com/oktadev/id-assertion-authz-node-example.git
cd id-assertion-authz-node-example
```

- Open VS Code Command Palette and run "Dev Containers: Open Folder in Container". To open Command Palette, select **View** → **Command Palette...**, MacOS keyboard shortcut `Cmd+Shift+P`, or Windows keyboard shortcut `Ctrl+Shift+P`.

## 2. Configure Environment

```sh
yarn setup:env
```

> **Note:** The `yarn setup:env` command copies template `.env.default` files to `.env` so you can fill in your credentials.

Edit the following files to fill in required values:

- `packages/authorization-server/.env.todo`
- `packages/authorization-server/.env.wiki`

**Required fields:**

| File                                      | Variable Name             | Values                                |
| ----------------------------------------- | ------------------------- | ------------------------------------- |
| `packages/authorization-server/.env.todo` | `CUSTOMER1_EMAIL_DOMAIN`  | `tables.fake`                         |
|                                           | `CUSTOMER1_AUTH_ISSUER`   | `https://{orgDomain}.oktapreview.com` |
|                                           | `CUSTOMER1_CLIENT_ID`     | `<OIDC client id at IdP>`             |
|                                           | `CUSTOMER1_CLIENT_SECRET` | `<OIDC client secret at IdP>`         |
| `packages/authorization-server/.env.wiki` | `CUSTOMER1_EMAIL_DOMAIN`  | `tables.fake`                         |
|                                           | `CUSTOMER1_AUTH_ISSUER`   | `https://{orgDomain}.oktapreview.com` |
|                                           | `CUSTOMER1_CLIENT_ID`     | `<OIDC client id at IdP>`             |
|                                           | `CUSTOMER1_CLIENT_SECRET` | `<OIDC client secret at IdP>`         |

> **How to retrieve these values:**
>
> - These values are provided by your Identity Provider (IdP) when you register your OIDC application.
> - Typically, you can find them in your IdP's admin console or developer portal under the application/client settings.
> - For example, in Okta, Azure AD, Auth0, or similar providers, look for the "Issuer URL" and "Client ID" fields.
> - If unsure, consult your IdP documentation or administrator for guidance.

## 3. Install Dependencies & Seed the Database

```sh
yarn bootstrap
```

> **Note:**
> The `yarn bootstrap` command will also run `yarn resetdb` to initialize your databases. During this process, you’ll see a prompt:
>
> `Are you sure you want to reset your database? All data will be lost.`
>
> This prompt appears for each application (both wiki and todo) to make sure you really want to erase all existing data and start fresh.
>
> - Type `y` and press Enter at each prompt to confirm you want to reset and re-seed the databases for both apps.
> - This is required the first time you run the project, or whenever you want to start with clean test data in both the wiki and todo apps.

## 4. Start All Services

```sh
yarn dev:all
```

> **Note:**
>
> - This command launches all backend and frontend services in parallel, each on its own port, so you can develop and test the full system at once.
> - If you prefer, you can manually open 4 terminals and run the following commands individually for more control:
>   - `yarn dev:wiki`
>   - `yarn auth:wiki`
>   - `yarn dev:todo`
>   - `yarn auth:todo`

## Optionally, open the application UIs in your browser

Open a new terminal window or tab before running this command

```sh
yarn open:apps # Opens both todo0 and wiki0 application UIs in your browser.
```

> **Note:**
>
> - If you are running inside a dev container or remote environment, the browser may not open automatically.
> - In that case, please open the following URLs manually in your browser:
>   - [http://localhost:3000/](http://localhost:3000/) (Wiki0)
>   - [http://localhost:3001/](http://localhost:3001/) (Todo0)

## 5. Verify Your Setup

After starting all services, you can verify that your environment is working as expected by following these steps:

1. Open both application UIs (todo0 and wiki0) in your browser. You can use `yarn open:apps` or manually visit the URLs shown in the terminal output.
2. Log in to both applications using the test credentials provided (for example, email: `bob@tables.fake`)
3. Perform a basic operation in each app (e.g., create a todo item in todo0, create or edit a wiki page in wiki0).
4. Confirm that the operation succeeds and the UI updates as expected.

![Test Flow](images/screenshot.png)

### What to do if a test fails

- If an operation does not work as expected (e.g., you cannot log in, create, or edit items), check the terminal output for errors.
- Common issues include misconfigured `.env` files, missing database migrations, or services not running.
- Review the "Common Issues" and "Troubleshooting" sections above for guidance.

# Common Issues

- **App not starting?** Ensure all `.env` files are present and filled in.
- **Database errors?** Try `yarn resetdb` to re-seed the database.
- **Ports in use?** Make sure no other apps are running on ports `3000`, `3001`, `5000`, or `5001`.

# Troubleshooting

If you have any trouble, try re-authenticating to both applications by signing out and signing in again.

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

Follow the section [Configure Environment](#2-configure-environment) to set up your environment variables.

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

Then, follow the section [Quickstart & Dev Setup](#quickstart--dev-setup)

## Cleanup

To stop the application, stop all running node processes using Ctrl + C and run:

```
cd local-development
docker-compose down
```

</details>
<br />
<br />

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

> [!TIP]
> Checkout the Debug Console in the App for detailed views of the requests!

1. Configure SSO with an IdP which supports this flow.
1. After the Login SSO flow for a user, store the `id_token` or the `refresh_token` returned from the IdP. These are needed to make the token exchange request. (If the `id_token` expires before you want to make the exchange, use the `refresh_token` to receive a new `id_token`.)

1. When you want to load a resource for a user in your application logic, make a token exchange request to the IdP within the lifetime of the `id_token`. Follow [this code example](https://github.com/oktadev/id-assertion-authz-node-example/blob/2a4068213845f4907c90b40823395b14f5dc20a6/packages/wiki0/src/server/controllers/oidc.ts#L110), and/or see the specifics of the request in Section 5 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).

1. Using the result of the exchange, make an `access_token` request to the authorization server. Follow [this code example](https://github.com/oktadev/id-assertion-authz-node-example/blob/2a4068213845f4907c90b40823395b14f5dc20a6/packages/wiki0/src/server/controllers/oidc.ts#L143), and/or see the specifics of the request in Section 6 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).

1. Store and use the `access_token` as your normally would with the 3rd party resource server.

### Best Practices for Requesting Apps

1.  **Do not add to login flow**. It is not necessary to preload all the JAG tokens, so it is not necessary to mint all of the possible JAG tokens at the time of login. The side effects can be extended login times for users.
1.  **Only request when needed**. JAG tokens should be requested at the last responsible moment. JAG tokens are not meant to be long lived. Loading does not need to be bulk loaded and optimized. Trying to optimize the requests for multiple JAG tokens can result in poor performance at scale.
1.  **Do not store JAG Tokens. Store ID, Access and Refresh Tokens**. JAGs are really short lived. As mentioned earlier, JAGs are passed from Requesting Apps to Resource Apps to exchange for an Access Token to access the Resource App. The Access Token is the valuable artifact to be stored and protected. The JAG token is effectively useless once exchanged, so it should be discarded.

## Resource App Steps

The Resource App is the application that owns protected resources normally accessed via OAuth2.0 by Requesting App users. This section describes the specific steps to support the ID Assertion Authorization Grant into the application. The Resource App is responsible for validating `ID-JAG` tokens before issuing OAuth `access_tokens` as it normally would.

> [!TIP]
> Checkout the Debug Console in the App for detailed views of the requests!

1. Configure SSO with an IdP which supports this flow.
1. Modify your Authorization Server logic accept these requests at your OAuth2.0 token endpoint. Seethe specifics of the incoming request in Section 6 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).
1. Validate the `ID-JAG` tokens properly before issuing an `access_token` as your normally would. Ensure all validations your authorization makes in regular OAuth2.0 flows also apply to this exhcange when evaluating user atuhorization, such as scope validation. Follow [this code example](id-assertion-authz-node-example/packages/authorization-server/jwt-authorization-grant.js), and/or see the specifics of the processing rules in Section 6.1 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).
1. Respond with an access token, as outlined in Section 6.1 of the [spec](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-identity-assertion-authz-grant).
