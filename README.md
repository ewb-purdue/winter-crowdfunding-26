# EWB Purdue Winter 2026 Crowdfunding Directory

Live at https://ewb-purdue.github.io/winter-crowdfunding-26/

Donors land here after the Mailchimp form (mailchi.mp/purdue/ewb-winter26), search for the member who asked them, and tap through to that member's EWB-USA crowdfunding page. Full requirements are in `SPEC.md`.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `preview.png` | The live site (built output). GitHub Pages serves these from the repo root. |
| `build/members.csv` | Members on the page: `name,team,url`. The only file to edit for updates. |
| `build/roster.csv` | All 68 members and their teams, from the design meeting attendance sheet. Everyone here who isn't in `members.csv` is still listed, with a greyed-out Donate button and a "no page yet" note. |
| `build/build.py` | Builds `index.html` from `members.csv`. Stops on any bad row. |
| `build/template.html`, `style.css`, `app.js` | Page markup, styles, and search code. |
| `build/assets/` | Original EWB logos. |
| `previews/` | Link-preview drafts, numbered by version, for comparing designs. Not used by the site. |
| `build/assets_out/` | Processed logo, icons, and preview image (made by `prep_assets.py`, needs Pillow). |

## Build

From the repo root:

```
python3 build/build.py build/members.csv build/assets_out .
```

Then commit `index.html` (and `preview.png` the first time). The site updates within a minute.

## Rules the build enforces

- Every link must be `https://support.ewb-usa.org/fundraiser/<digits>`
- No duplicate links or names
- Team must be one of the teams in `TEAM_ORDER` in `build.py`
- Same team rule and no duplicates for `roster.csv`

## Checking member pages

The EWB-USA team page loads with JavaScript, so read its data directly:

- Team pages list: `https://www.classy.org/frs-api/fundraising-teams/866091/fundraising-pages` (20 per page; follow `next_page_url`)
- Each entry's `id` gives the page link: `https://support.ewb-usa.org/fundraiser/<id>`; `title` is the member's name

Before each build, compare the MS Form export, `roster.csv`, and that team list. Only members whose link opens their own page on the team go in `members.csv`. Everyone else goes on a follow-up list for Ryan (no form entry, broken link, page not on the team, title doesn't match, or a team page with no form entry).

## Mailchimp redirect

Set the form's redirect to `https://ewb-purdue.github.io/winter-crowdfunding-26/?thanks`. The `?thanks` ending shows the "Thanks, we got your info" banner.
