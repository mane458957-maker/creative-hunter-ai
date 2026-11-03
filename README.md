# Creative Hunter AI

A responsive opportunity dashboard for creative employment and freelance missions.

**Live site:** https://mane458957-maker.github.io/creative-hunter-ai/

## Connected discovery

- **Employment engine:** Remotive remote jobs and Arbeitnow Europe listings.
- **Freelance engine:** listings explicitly marked freelance, contractor or project-based by those feeds, kept in a separate view.
- Feed snapshots refresh four times daily and after dashboard/profile changes. Matching uses a simple keyword score.
- Each listing links to its original source.
- Applications are always manual. The app never submits applications, proposals, bids or messages.

See [the source register](docs/DATA_SOURCES.md) for current access and limitations.

## Automatic publishing

GitHub Actions fetches the public feeds, creates a static listing snapshot, and publishes it with the dashboard. The candidate profile is used in the Actions runner and is not copied into the published site.

## Candidate profile and visibility

The repository is public to enable GitHub Pages on this account. The CV PDF, phone number, email address and street address are excluded. The public repository includes a professional profile with the candidate's name, city, experience, education, skills and languages; temporary public visibility was approved.

If the repository is made private again, GitHub Pages on the current plan will be unpublished. The public site is visible to anyone while deployed.

## Safety

This is opportunity discovery and review only. A person reviews and initiates every application action.
