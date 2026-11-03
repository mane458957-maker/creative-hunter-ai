# Creative Hunter AI

A private opportunity discovery workspace for creative employment and freelance missions. The starter is a dependency-free, responsive dashboard that runs locally in a browser.

## What is here

- **Employment engine** for full-time, fixed-term, contract and international roles.
- **Freelance engine** for project-based video, motion, web, AI-assisted creative, storytelling and advertising work.
- Search, location and match filters with separate views and saved-opportunity controls.
- A private candidate profile configuration derived from the supplied English CV. Personal contact details and the CV itself are intentionally excluded.
- A source register that distinguishes configured demo data from integrations still needing access, credentials or authorization.

## Run the dashboard

Open `index.html` in a modern browser. No build step or API credentials are needed. The opportunities shown in the starter are explicitly marked as **sample data**; they are not live listings. Saved items currently live in browser local storage on that device.

## Candidate setup

Review `config/candidate-profile.json` and adjust the search preferences as needed. It contains professional summary, experience, skills, languages and inferred target roles, but no email, phone number, street address or CV file. Keep any future secrets in environment variables or a local `.env` file; never commit them.

## Sources and automation

See `docs/DATA_SOURCES.md`. No job board, freelance marketplace, email alert, database or notification integration is configured yet. Connector work must use official APIs, feeds or expressly authorized access. Do not scrape sources whose terms prohibit it.

## Application safety

Creative Hunter AI is for discovery and review. It **never submits applications, proposals, bids or messages automatically**. A person must review each opportunity and take any application action themselves.

## Project status

This is a working UI scaffold with sample opportunities and local saved items, not a live search service. Connect and verify permitted data sources before treating results as current.
