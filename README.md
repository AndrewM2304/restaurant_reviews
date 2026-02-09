# Restaurant Reviews - Next.js Starter

This repository now contains a minimal **Next.js full-stack app**:

- `/` renders a simple **Hello World** page.
- `/api/hello` returns JSON from the server.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to Cloudflare Pages on code push

This setup is ready for Cloudflare Pages Git-based deployments.

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a new project and connect the repository.
3. Select the **Next.js** framework preset.
4. Save and deploy. Every new push to your connected branch auto-deploys.

The included GitHub Actions workflow validates lint/build on pushes and pull requests.
