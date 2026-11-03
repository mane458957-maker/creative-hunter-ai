# Data source and integration status

**As of 2026-11-03:** two public feeds are configured. GitHub Actions fetches them four times daily, runs matching privately in the runner, and publishes a static listings file with the dashboard. The candidate profile is not copied into the Pages artifact.

## Employment engine

| Source | State | Coverage and conditions |
| --- | --- | --- |
| Remotive | Connected | Remote jobs, including some creative roles. Cards link to Remotive and identify it as source. Data is delayed 24 hours; provider advises a maximum of four requests daily. |
| Arbeitnow Europe | Connected | Europe-focused listings from integrated employer systems. Cards link back to the source as required by its terms. |
| Arbeitnow UK | Not enabled | Separate UK feed not configured in this first connection. |
| France Travail | Not connected | Official API access and reuse conditions need confirmation. |

## Freelance engine

| Source | State | Needed |
| --- | --- | --- |
| Remotive | Connected, limited | Only listings explicitly marked freelance/contractor/project-based enter this view. |
| Arbeitnow Europe | Connected, limited | Only listings explicitly marked freelance/contractor/project-based enter this view. |
| Upwork | Not connected | Official developer access and credentials required. |
| Malt / Contra | Not connected | Confirm official API/feed or written authorization for intended access. |
| Freelancer.com | Not connected | Written authorization required before automated API access. |

No scraping is enabled. No marketplace credentials or authorizations are configured.

## Refresh and privacy

- Automatic schedule: 01:00, 07:00, 13:00 and 19:00 UTC; relevant pushes trigger a refresh too.
- Matching runs in GitHub Actions. The profile is not published in the Pages artifact or sent to the feed providers.
- Published listings include opportunity fields, a heuristic match score, source name and original listing URL; no candidate contact details.
- If a source is temporarily unavailable, its status is shown and listings from the other feed remain usable.
- Saved opportunities remain in browser local storage; no database, notification service or account sync is configured.

## Matching and application safety

The starter keyword score is a relevance hint, not a hiring prediction. Employment and explicit freelance listings remain separate. The system never submits applications, proposals, bids or messages automatically; a person reviews and applies manually.
