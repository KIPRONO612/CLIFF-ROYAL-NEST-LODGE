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

