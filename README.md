# Configure a web application with Auth0

Add login to a small Express expenses app, then choose which routes require authentication. CodeTour guides you through the code inside VS Code. The Auth0 Labs extension connects the exercise to your own development tenant.

This is Jed Esposito's portfolio fork of [Auth0 Training's maintained lab](https://github.com/auth0-training/labs-node-create-an-application). I authored the original CodeTours and worked with Bobby Johnson on features in the lab extension. Bobby developed the extension. Auth0 colleagues have continued maintaining the lab since my time there; their history and the original licence are preserved here.

The application starts without authentication because adding it is the exercise. Use sample data and a disposable development tenant. This is a teaching project, not a production application.

## New to code?

Start with [Your first login flow](BEGINNER.md). It explains the setup, the terms you will meet and what to try when the app works.

## Start in Codespaces

1. Sign into GitHub, open **Code → Codespaces**, and create a Codespace. Check your account's included usage and billing limits before starting.
2. Wait for the container and dependency installation to finish. The container uses Node 22, and package versions are recorded in lockfiles.
3. Follow the CodeTour prompt to sign into the Auth0 Labs extension. Choose a development tenant you can safely use for this exercise.
4. Register the application as **Lab: Web App**, exactly as the tour describes. The extension uses that name to find its configuration.
5. Continue through the tour. It explains an expected callback-address error and then asks you to protect the expenses and profile routes.
6. Stop the Codespace when finished. Delete it when you no longer need its files; commit anything you want to keep first.

The lab asks you to make the forwarded app port public. Keep it open only while doing the exercise and use synthetic accounts and data. Your development tenant and application credentials stay in your workspace's ignored `.env` file.

## Run locally

Use Node 22 or newer. Install VS Code with CodeTour (`vsls-contrib.codetour`) and the Auth0 Labs extension (`auth0.vscode-labs`), then open this folder. Alternatively, open the included development container with VS Code and Docker.

```sh
npm ci
npm run init
npm run web-app:start
```

The app opens at `http://localhost:37500`. The extension's **Auth0: Configure Local Environment** command writes `src/web-app/.env` after you register **Lab: Web App** in the selected tenant. Missing `.env` usually means the tenant or application name does not match. The [Auth0 lab FAQ](https://auth0-training.github.io/) covers account and extension setup.

The app generates a fresh cookie key at startup. Set your own strong `SESSION_SECRET` in the ignored `.env` file if you want sessions to survive a restart. Keep credentials out of screenshots and source control.

## What changed in this fork

- Corrected the public Codespaces address used by the redirect middleware and kept the callback path and query intact.
- Replaced the shared placeholder cookie key with a fresh local key, respected configured environment values, and removed key logging.
- Pinned the development container to a named Node LTS line and moved setup to container creation. Installs use committed lockfiles.
- Removed an unused HTTP client and updated app dependencies. Corrected explanations of middleware environment-variable names and profile navigation.
- Added tests that replay the six CodeTour edits and exercise the completed app against a local OpenID Connect provider fixture, including login, protected routes, logout and invalid callback state.

Run `npm test` for the checks. The local provider fixture does not contact Auth0 or verify the VS Code extension's live tenant connection. A real Auth0 tenant is still needed for that check.

## History and maintenance

My original tour work is visible in commits such as [the first draft](https://github.com/auth0-training/labs-node-create-an-application/commit/551cb79), [adding executable commands](https://github.com/auth0-training/labs-node-create-an-application/commit/81dc27e) and [reworking the environment-configuration steps](https://github.com/auth0-training/labs-node-create-an-application/commit/fec8158). The upstream lab had updates in July 2026 when this fork was reviewed.

This fork is an independent portfolio example. Auth0's own training and extension remain maintained by their respective contributors. Report issues with this fork here; use upstream's instructions for the official lab.

## Licence

MIT. See [LICENSE](LICENSE) for Auth0's copyright and third-party notices. Original authorship and contribution history remain intact.
