# Winter Crowdfunding Landing Page Spec

Exported from the Claude doc on 11/18/2026. A searchable member directory at ewb-purdue.github.io/winter-crowdfunding-26. Donors land here after the Mailchimp form and tap through to the crowdfunding page of the member who asked them.

## Flow

1. The member sends the Mailchimp form link and their full name.
2. The donor fills out the form and is redirected here.
3. The donor searches the member's name and taps Donate.

## Decided

- **Hosting:** index.html and preview.png in the `winter-crowdfunding-26` repo of the ewb-purdue GitHub organization (owned by Ryan)
- **Layout:** members grouped by team, search on top, team shown next to each name
- **Fallback:** "Can't find them?" link to the Winter 2026 team page (https://support.ewb-usa.org/team/866091)
- **Redirect:** stays on the team page until this page is live

## Data and validation

Built from the attendance sheet (names, teams), the MS Form (page links), and the team page (which pages are on the team). A member is listed only if their link opens their own page on the Winter 2026 team.

**Roster rules**

- Excluded: Shannon Yip, Niko Calabrese.
- Spellings: Pranay Gohel, Cece Goracki.
- PMs show under their project team: Sidney Bauer and Rachel Schwab under Rwanda, Pranay Gohel and Connor Taylor under Louisiana, Anneka Girish under Health, and Keira Keegan and Clara de Groot under Fundraising. Chapter officers stay under Leadership.

**Follow-up list for Ryan**

- Members with no MS Form entry
- Broken links or pages not on the team
- Pages whose title doesn't match the member
- Pages on the team with no MS Form entry (they stay off the directory until they submit the form)

## Updates

The first build goes live around 10 pm on 11/18. Later builds add new pages.

1. Ryan sends the MS Form export.
2. Validate the links and build the file.
3. Ryan uploads it and tests it on a phone.
4. First build only: switch the Mailchimp redirect to ewb-purdue.github.io/winter-crowdfunding-26/?thanks and give members the go-ahead.

## Design

Simple and professional, in EWB branding with the logo. One centered column on computers, full width on phones, with a link preview and an EWB tab icon. Colors from the EWB-USA brand guide: blue #095aa6, light blue #b5cde4, gold #cca147. Font: Arial.

## Features

| Feature | Status |
| --- | --- |
| Thank-you banner | Built |
| Search that filters as you type (first, last, partial names) | Built |
| Member cards: name, team, Donate button | Built |
| A to Z list when the search is empty | Built |
| "No match" message with the team page link | Built |
| Contact footer (ewb@purdue.edu) | To build |
| Employer matching note | To build. Very necessary: a reminder, before donors head to the giving page, that if they work for a company they may have donation matching that could double or triple their gift |

## Security

No server or database, and GitHub absorbs heavy traffic. Only support.ewb-usa.org links are allowed, search input is plain text, outside scripts are blocked by a Content Security Policy with hashed inline code, the page asks search engines not to index it, and HTTPS is enforced.

## Testing before go-live

- [ ] Every link opens the right member's page
- [ ] Search works on first, last, and partial names
- [ ] Works on iPhone and Android
- [ ] Redirect and "Can't find them?" link both work
- [ ] Link preview looks right in a text
