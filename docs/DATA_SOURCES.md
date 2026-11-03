# Data source and integration status

**As of 2026-11-03:** the dashboard currently runs with illustrative in-code sample cards only. It is not connected to live listing providers.

## Employment engine

| Source category | Current state | Needed before integration |
| --- | --- | --- |
| Employer career pages / job feeds | Not configured | Select target employers and use their public feeds or authorized APIs; confirm reuse terms. |
| General job boards | Not configured | Choose providers with permitted API, feed or partner access; configure credentials where required. |
| Notifications | Not configured | Select a delivery channel and configure its credentials. |

## Freelance engine

| Source | Current state | Needed before integration |
| --- | --- | --- |
| Upwork | Not configured | Request and obtain official API access; add approved credentials and verify permitted search scope. |
| Malt | Not configured | Confirm an official API/feed or written authorization for the intended access. |
| Contra | Not configured | Confirm an official API/feed or written authorization for the intended access. |
| Freelancer.com | Not configured | Confirm available official API access and credentials for the intended use. |
| Creative agencies / production marketplaces | Not configured | Select providers and use their approved feeds or authorized access. |

No credentials or source authorizations were present during setup. No scraping is enabled. Availability and terms should be checked with each provider before implementation.

## Data flow and privacy

- The included candidate profile configuration contains professional experience, skills, languages and starter matching preferences derived from the supplied English CV.
- It excludes phone number, email address, street address and the original PDF.
- The sample opportunity cards are authored demo content, not real offers.
- Saved cards stay in browser local storage on the current device. There is no database or sync.
- Any later source connector should request only the data required for matching and should keep credentials in environment variables or a secrets manager.

## Application safety

Discovery and matching are separate from applying. The system must never submit a job application, freelance proposal, bid or message automatically. A human reviews and initiates every application action.