# Cliff Royal Nest Lodge — Local development

This is a small static landing page. To run it locally on Windows PowerShell you have two simple options.

Option 1 — using npm (recommended if you have Node.js installed):

1. Open PowerShell in this folder.
2. Install (optional) dependencies and run the server:

```powershell
npm install
# then
npm start
```

This will serve the site at http://localhost:8080.

Option 2 — using Python (if you don't have Node):

PowerShell command (Python 3):

```powershell
# From this folder
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

Notes:
- The background image should be located at `assets/hotel.jpg`.
- If you want a different port, change the command port number.

What's included now:
- A responsive landing page with a glass-card hero, Amenities and Gallery sections.
- A modal booking form (client-side validation; submission currently logged to console as a stub).
- Instructions to deploy to GitHub Pages.

Deploy to GitHub Pages (exact steps for your repo):

1. Make sure this project is committed locally. If you haven't already created a GitHub repo, create a new repo named `CLIFF-ROYAL-NEST-LODGE` under your account `KIPRONO612`.
2. Add the remote (replace the URL if you use SSH):

```powershell
git init
git add .
git commit -m "Initial site"
git remote add origin https://github.com/KIPRONO612/CLIFF-ROYAL-NEST-LODGE.git
git branch -M main
git push -u origin main
```

3. Install dependencies and deploy:

```powershell
npm install
npm run deploy
```

After that, your site should be available at:

https://KIPRONO612.github.io/CLIFF-ROYAL-NEST-LODGE

Notes:
- If `npm run deploy` fails because `gh-pages` isn't installed globally, the script uses `npx` so it will still work.
- If you prefer continuous deploy, I can add a GitHub Action to run the deploy on push to `main`.

Backend (optional) — local bookings storage

This repo includes a simple Express server `server.js` that accepts POSTs to `/api/bookings` and saves them to `bookings.json` in the project root.

To run the server locally:

```powershell
npm install
node server.js
# server will be available at http://localhost:3000
```

If you run the Express server and serve the static files from the same host, the booking form will send data to `/api/bookings`. If you use `http-server` for static files, either run the Express server and configure your front-end to POST to `http://localhost:3000/api/bookings`, or use the built-in stub behavior.

CI Deploy (GitHub Actions)

A GitHub Actions workflow `/.github/workflows/deploy.yml` is included that runs `npm run deploy` when you push to `main`. Make sure the repo exists under your GitHub account and the `homepage` in `package.json` is set correctly.

Deploying the Express backend to a managed host (Render or Railway)
---------------------------------------------------------------

If you'd like the booking API and optional Twilio SMS sending to run on a managed host (so you don't need to run a server on your machine), Render and Railway are both simple options that support Node apps and environment variables.

Common prerequisites
- A GitHub repo for this project (you already pushed to `main`).
- Node.js is specified via the `start` script in `package.json` (this project uses `node server.js`).
- Create environment variables on the host for Twilio if you want SMS working (see `.env.example`).

Render (recommended, free-tier available)
1. Go to https://render.com and sign up / sign in.
2. Click "New" → "Web Service".
3. Connect your GitHub account and choose the `CLIFF-ROYAL-NEST-LODGE` repository.
4. Fill in the service settings:
	- Name: cliff-royal-nest-lodge (or your preferred name)
	- Environment: Node
	- Branch: main
	- Build Command: (leave empty) or `npm install` if Render doesn't auto-install.
	- Start Command: npm start
	- Region: choose closest region to your users
5. Add Environment Variables (in Render dashboard → Environment):
	- PORT (optional)
	- TWILIO_ACCOUNT_SID
	- TWILIO_AUTH_TOKEN
	- TWILIO_FROM (your Twilio phone number in E.164 format, e.g. +1234567890)
6. Create and deploy. Render will build and start your app. Your Express backend will be available at the URL Render provides.

Notes for Render:
- Because `npm start` runs `node server.js`, the Express server will serve the API at the root origin. If you also want Render to serve the static files, `server.js` already serves static files from the project root — no extra steps needed.

Railway (alternative — fast and simple)
1. Go to https://railway.app and sign up / sign in.
2. Click "New Project" → "Deploy from GitHub repo". Connect your repo and choose `CLIFF-ROYAL-NEST-LODGE`.
3. Railway will detect the Node project. Set the start command to `npm start` if prompted.
4. In the Railway project settings, add Environment Variables:
	- TWILIO_ACCOUNT_SID
	- TWILIO_AUTH_TOKEN
	- TWILIO_FROM
5. Deploy and visit the provided URL. The Express API will be accessible at `/api/bookings` on the Railway URL.

Setting Twilio environment variables (recommended)
- Use the host's environment or dashboard UI to set the `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` variables. Never commit these secrets to the repo.
- Locally, copy `.env.example` to `.env` and fill in values before running `node server.js`.

Testing after deploy
- After the app is deployed, open the hosted URL in the browser and test submitting the booking form. If the front-end is served by the same host and origin, the relative POST to `/api/bookings` will work without extra CORS configuration.
- If you host the frontend separately (e.g., GitHub Pages) and the backend on Render/Railway, update the front-end fetch URL in `script.js` to the backend origin (for example: `https://your-app.onrender.com/api/bookings`) and make sure CORS is enabled (the server already uses `cors()`).

Security and production notes
- Keep Twilio credentials secret. Use the host's secrets management UI.
- For production, consider replacing file-based `bookings.json` with managed storage (Postgres, MongoDB, or an external object store) if you expect many bookings or need durability across deploys.
- Optionally enable HTTPS, domain, and DNS settings from the host dashboard to use a custom domain.

If you want, I can prepare a small `render.yaml` manifest or a Railway template file to fully automate the deploy settings — tell me which provider and I'll add it.

Provider manifests included
-------------------------

This repository now contains automation manifests for two managed hosts to make deploys faster:

- `render.yaml` — a Render manifest which configures a web service that runs `npm start`.
- `railway.json` — a minimal Railway template that documents the build/start commands and environment variables.

Usage notes:
- For Render, commit `render.yaml` and create a new Web Service from the repo in the Render dashboard; Render will read the manifest and suggest the configured settings.
- For Railway, connect the repo in the Railway UI and use `railway.json` as a reference; Railway typically requires you to set environment variables in the project settings.

Remember: these manifest files do not contain secrets — set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` in the provider's environment settings (see `.env.example`).

Auto-deploy via GitHub Actions (Render & Railway)
------------------------------------------------

Two GitHub Actions workflows were added to help automate deployments when you push to `main`:

- `.github/workflows/deploy-render.yml` — If you set the following repository secrets, this workflow will call the Render API to trigger a deploy:
	- `RENDER_API_KEY` — your Render API key (keep secret).
	- `RENDER_SERVICE_ID` — the Render service ID for the web service created from this repo.

- `.github/workflows/deploy-railway.yml` — If you set the following repository secrets, this workflow will install the Railway CLI and attempt to deploy:
	- `RAILWAY_API_TOKEN` — your Railway API token.
	- `RAILWAY_PROJECT_ID` (optional) — the Railway project id to deploy to.

How to add repository secrets on GitHub
1. Go to your repository on GitHub → Settings → Secrets and variables → Actions → New repository secret.
2. Add the secrets mentioned above (for Render and/or Railway).

Notes and caveats
- The Render workflow uses the Render REST API to create a new deploy; you must provide a valid `RENDER_API_KEY` and `RENDER_SERVICE_ID` for it to succeed.
- The Railway workflow installs the Railway CLI and runs `railway up --yes`. Railway often works best via the web UI for initial setup; if you prefer I can add a GitHub Action using Railway's official action instead.
- The Railway workflow previously used the CLI; it has been updated to use Railway's GitHub Action for a simpler, non-interactive deploy.

Quick guide: add repository secrets from PowerShell (optional)
1. Create secrets locally (example using PowerShell to copy values into the clipboard) — replace values with your real tokens:

```powershell
# Copy a secret to the clipboard on Windows (PowerShell). Run this and then paste into GitHub's secret value field.
"your_render_api_key_here" | Set-Clipboard
```

2. In the GitHub UI: Repository → Settings → Secrets and variables → Actions → New repository secret.
	- Name: `RENDER_API_KEY` — Value: paste from clipboard
	- Name: `RENDER_SERVICE_ID` — Value: (from Render service page)
	- Name: `RAILWAY_API_TOKEN` — Value: (from Railway account)
	- Name: `RAILWAY_PROJECT_ID` — Value: (optional, from Railway)
	- Name: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` — Value: your Twilio credentials

If you'd like, I can also add example GitHub Actions secrets using the GitHub CLI (`gh`) commands in the README — tell me if you use `gh` and I will add the `gh secret` commands.

Set repository secrets using GitHub CLI (PowerShell)
-----------------------------------------------

If you prefer to set repository secrets from the command line, install the GitHub CLI (`gh`) and run the following PowerShell commands. Replace the placeholder values with your real tokens/IDs.

1. Install and authenticate `gh` (one-time):

```powershell
# Install GitHub CLI on Windows (use one that works for you). Example using winget:
winget install --id GitHub.cli

# Authenticate (follow the interactive prompts / browser):
gh auth login
```

2. Set secrets for this repository (replace values):

```powershell
$repo = 'KIPRONO612/CLIFF-ROYAL-NEST-LODGE'

gh secret set RENDER_API_KEY --body '<your_render_api_key>' --repo $repo
gh secret set RENDER_SERVICE_ID --body '<your_render_service_id>' --repo $repo

gh secret set RAILWAY_API_TOKEN --body '<your_railway_api_token>' --repo $repo
gh secret set RAILWAY_PROJECT_ID --body '<your_railway_project_id>' --repo $repo

gh secret set TWILIO_ACCOUNT_SID --body '<your_twilio_account_sid>' --repo $repo
gh secret set TWILIO_AUTH_TOKEN --body '<your_twilio_auth_token>' --repo $repo
gh secret set TWILIO_FROM --body '+1234567890' --repo $repo
```

Tip: If you prefer not to paste secrets directly, you can read them from files. Example (PowerShell):

```powershell
gh secret set TWILIO_AUTH_TOKEN --body (Get-Content -Raw .\twilio_auth_token.txt) --repo $repo
```

Secrets set via `gh` are encrypted and stored in GitHub — they are not visible after you set them.
- These workflows are best-effort templates: different accounts and provider settings may require small adjustments (regions, build commands). If you want, I can tailor the workflow to your exact Render service id, instance size, or Railway project id and test the configuration steps with you.

