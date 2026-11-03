# Creative Hunter AI

A responsive opportunity dashboard for creative employment and freelance missions.

**Live site:** https://mane458957-maker.github.io/creative-hunter-ai/

## What is here

- Separate employment and freelance discovery views.
- Search, location and match filters, plus saved opportunities stored in browser local storage.
- Candidate matching preferences derived from the supplied English CV.
- A source register showing what is connected versus what still needs access, credentials or authorization.

The dashboard uses clearly marked **sample opportunities**, not live listings. No job board, freelance marketplace, notification service or database is connected yet. See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

## Run locally

Open `index.html` in a modern browser. No build step or API credentials are needed.

## Automatic publishing

GitHub Actions publishes the root `index.html` to GitHub Pages whenever it changes on `main`. Updates to the dashboard therefore appear on the live site automatically after the deployment finishes.

## Candidate profile and repository visibility

The repository is currently public to enable GitHub Pages on this account. The CV PDF, phone number, email address and street address are excluded. The public repository does include a professional profile file with the candidate's name, city, experience, education, skills and languages. The user has approved this temporary public visibility.

If the repository is made private again, GitHub Pages on the current plan will be unpublished. The public site is visible to anyone while deployed.

## Application safety

Creative Hunter AI is for discovery and review. It never submits applications, proposals, bids or messages automatically. A person must review each opportunity and take any application action themselves.
