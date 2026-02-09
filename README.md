# Restaurant Reviews - Next.js Starter

This repository contains a minimal **Next.js full-stack app**:

- `/` renders a simple **Hello World** page.
- `/api/hello` returns JSON from the server in local dev.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to GitHub Pages on merge

This repo is configured to deploy automatically to GitHub Pages on every push/merge to `main`.

Expected site URL:

- `https://andrewm2304.github.io/restaurant_reviews/`

Setup (one-time in GitHub):

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge/push to `main`.
4. The workflow at `.github/workflows/deploy-pages.yml` will build and deploy the static site.

Notes:

- The Next.js config applies the `/restaurant_reviews` base path during GitHub Actions builds so assets resolve correctly on GitHub Pages.
- Because GitHub Pages is static hosting, only static routes/pages are deployed.
