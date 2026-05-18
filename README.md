# The Dare Adeboye Innovation Hub (DAIH)

Official static website for The Dare Adeboye Innovation Hub, a coworking and innovation space in Redemption City, Ogun State. The site presents available workspaces, events, gallery content, career information, and contact details for visitors who want to book or learn more about DAIH.

## Live Site

Production: https://daih-vert.vercel.app

## Project Overview

This repository contains a static HTML, CSS, and JavaScript website. It does not require a frontend build step, package manager, or server-side framework to render the main pages.

Core pages include:

- Home page: `DAIH-main/index.html`
- Workspace listings: `DAIH-main/our-plans.html`
- Dedicated desk: `DAIH-main/dedicated-desk.html`
- Hot desk: `DAIH-main/hot-desk.html`
- Office suite: `DAIH-main/office-suite.html`
- Conference hall: `DAIH-main/conference-hall.html`
- Training room: `DAIH-main/training-room.html`
- About: `DAIH-main/about-us.html`
- Events: `DAIH-main/events.html`
- Gallery: `DAIH-main/gallery.html`
- Jobs: `DAIH-main/jobs.html`
- Contact: `DAIH-main/contact.html`

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

1. `DAIH-main/vercel.json` enables `cleanUrls`, which lets Vercel serve `page.html` files through `/page` routes and redirect `.html` requests to the clean route.
2. `trailingSlash` is set to `false`, keeping route formatting consistent as `/hot-desk` rather than `/hot-desk/`.

Internal navigation links in the HTML files also point to the clean routes, so users do not keep landing on `.html` URLs while browsing the site.

## Folder Structure

```text
.
├── README.md
├── DAIH-main/
│   ├── index.html
│   ├── about-us.html
│   ├── contact.html
│   ├── events.html
│   ├── our-plans.html
│   ├── vercel.json
│   ├── css/
│   ├── fonts/
│   ├── images/
│   └── js/
└── pinegrow.json
```

## Local Preview

Because this is a static site, you can open `DAIH-main/index.html` directly in a browser for a quick preview.

For a closer production-like preview with local routing, run a simple static server from the `DAIH-main` folder:

```bash
cd DAIH-main
python3 -m http.server 3000
```

Then visit:

```text
http://localhost:3000
```

Note that Vercel clean URL redirects are applied after deployment, not by Python's basic local server.

## Deployment

The project is intended to deploy on Vercel as a static site. If Vercel is configured with `DAIH-main` as the project root, it will use `DAIH-main/vercel.json` automatically.

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
- Add new static pages as `.html` files inside `DAIH-main`.
- When adding a new page, include it in navigation and update `DAIH-main/vercel.json` only if custom redirect behavior is needed.
- Keep image assets inside `DAIH-main/images`, CSS inside `DAIH-main/css`, and scripts inside `DAIH-main/js`.
