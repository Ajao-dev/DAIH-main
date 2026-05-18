# The Dare Adeboye Innovation Hub (DAIH)

Official static website for The Dare Adeboye Innovation Hub, a coworking and innovation space in Redemption City, Ogun State. The site presents available workspaces, events, gallery content, career information, and contact details for visitors who want to book or learn more about DAIH.

## Live Site

Production: https://daih-vert.vercel.app

## Project Overview

This folder contains the deployable static website files. The site is built with plain HTML, CSS, JavaScript, Bootstrap, jQuery plugins, and local image/font assets.

Core pages include:

- Home page: `index.html`
- Workspace listings: `our-plans.html`
- Dedicated desk: `dedicated-desk.html`
- Hot desk: `hot-desk.html`
- Office suite: `office-suite.html`
- Conference hall: `conference-hall.html`
- Training room: `training-room.html`
- About: `about-us.html`
- Events: `events.html`
- Gallery: `gallery.html`
- Jobs: `jobs.html`
- Contact: `contact.html`

## Clean URL Handling

The site is configured for clean, extensionless URLs on Vercel. Visitors should see routes like:

- `/hot-desk`
- `/events`
- `/contact`

instead of:

- `/hot-desk.html`
- `/events.html`
- `/contact.html`

This is handled in two places:

1. `vercel.json` enables `cleanUrls`, which lets Vercel serve `page.html` files through `/page` routes and redirect `.html` requests to the clean route.
2. `trailingSlash` is set to `false`, keeping route formatting consistent as `/hot-desk` rather than `/hot-desk/`.

Internal navigation links in the HTML files also point to the clean routes, so users do not keep landing on `.html` URLs while browsing the site.

## Local Preview

Open `index.html` directly in a browser for a quick static preview.

For a closer production-like preview, run a simple static server from this folder:

```bash
python3 -m http.server 3000
```

Then visit:

```text
http://localhost:3000
```

Note that Vercel clean URL redirects are applied after deployment, not by Python's basic local server.

## Deployment

Recommended Vercel settings:

- Framework preset: Other
- Root directory: `DAIH-main`
- Build command: leave empty
- Output directory: leave empty

## Contact Details Displayed on the Site

- Location: Abiona Street By House of Favour, Main Gate, Obafemi Owode LGA, Redemption City, Ogun State
- Phone: 07042504389
- Email: dareadeboyeinnovationhub@gmail.com

## Maintenance Notes

- Keep all internal page links extensionless, for example `/events` instead of `events.html`.
- Add new static pages as `.html` files inside this folder.
- When adding a new page, include it in navigation and update `vercel.json` only if custom redirect behavior is needed.
- Keep image assets inside `images`, CSS inside `css`, and scripts inside `js`.
