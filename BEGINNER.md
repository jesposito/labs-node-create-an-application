# Your first login flow

You don't have to be a developer to try this. The app is already built, and the tour walks you through adding login. You'll make small changes, see what happens and learn why they matter. There's even an error you're meant to run into.

The app tracks two imaginary expenses: pizza and coffee for a coding session. By the end, anyone can open its home page, but people must sign in to see expenses or their profile.

## What you'll need

- A personal GitHub account. GitHub Codespaces supplies the editor and computer in your browser, so you don't need to install a development environment. Check your included Codespaces usage before starting; stop the workspace when you're finished.
- An Auth0 account with a development tenant for practice. A tenant is your own area for configuring applications and login. Use sample data for this exercise.

You do not need an Alexa device, a paid course, or previous Auth0 experience. The guided steps explain the code you add.

## Get the workspace ready

1. Open [this lab on GitHub](https://github.com/jesposito/labs-node-create-an-application).
2. Select **Code**, then **Codespaces**, then create a Codespace from **main**. Leave the tab open while it prepares the workspace.
3. When the tour appears, follow its sign-in link for the Auth0 Labs extension. Authorize the development tenant you created for this exercise.
4. Follow the tour to register **Lab: Web App**. Use that name exactly: the extension looks it up when connecting your account to the code.
5. Continue through the tour. Use **Insert Code** where offered. These are real edits, and the explanation beside them tells you what they're for.

If the tour is hidden, open the **CodeTour** section in the VS Code sidebar. Its files also live in `.auth0/lab/guides`. The [Auth0 lab FAQ](https://auth0-training.github.io/) covers sign-in and setup problems.

## A few names you'll meet

**VS Code** is the editor. **Codespaces** runs that editor and the sample app on a remote computer. **CodeTour** puts explanations beside particular lines in the editor.

An **environment variable** is a setting the app reads when it starts. The extension puts your app's settings in a private `.env` file so you don't have to paste them into source code.

A **route** is an address within the app, such as `/expenses`. **Middleware** is code that runs as a request passes through the app. The authentication middleware checks whether someone has signed in.

A **callback URL** is where Auth0 sends the browser after login. Auth0 needs an approved address so it knows where it can send the result. The lab lets you encounter a mismatch and then fix it.

## What to try at the end

1. Open the home page while signed out. It should welcome an anonymous visitor.
2. Select **Expenses**. You should be asked to log in.
3. Sign up with a test account and continue. You should return to the expenses page.
4. Go home and select your name to see the profile.
5. Log out. The home page should still be available; expenses should ask for login again.

If you can explain why the home page and expenses behave differently, you've understood the main idea.

When finished, stop the app and your Codespace. Save or commit your work before deleting the Codespace if you want to keep your changes.
