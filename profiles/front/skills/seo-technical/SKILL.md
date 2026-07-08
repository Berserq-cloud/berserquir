---
name: seo-technical
description: Technical SEO discipline — per-page metadata contract, structured data, site-wide crawlability. Web-universal; framework helpers from memory-long §stack.
---

# Skill: Technical SEO

Stack-agnostic: meta/OG helpers and sitemap generators come from `memory-long §stack`. Prefer the framework's **typed** SEO helper over hand-written tags (typos like `og:imagee` are silent killers).

## Per-page contract (before merge)

- `<title>` unique across the site, **<60 chars** · meta description unique, **150–160 chars** (longer truncates in SERP)
- Canonical URL — correct per page, never copy-pasted between routes
- **OG complete**: og:title, og:description, og:image (**1200×630, <300kb, absolute URL**), og:url (absolute, = canonical), og:type
- Twitter card: `summary_large_image` + title/description/image
- **JSON-LD** appropriate to context: `WebSite` (root), `Organization`/`Person` (brand), `BreadcrumbList` (internal hierarchy), `Article` (posts)
- `lang` attribute on `<html>` matching the content language (a11y + regional SEO)

## Site-wide (once)

robots.txt with `Sitemap:` line · sitemap with absolute URLs + `lastmod` per route · default OG image fallback · global `lang`.

## Validation gates (ship blockers)

Schema validator → 0 errors · social preview renderer → correct card · Lighthouse SEO → 100. **Re-validate live after deploy** — env-dependent URLs change in prod.

## Anti-patterns

Duplicate titles (pages compete against each other) · relative/broken OG image URL (empty preview) · description >160 (truncated message) · wrong canonical (cannibalizes ranking) · sitemap pointing at localhost · JSON-LD missing `@context`/`@type` (loses the whole rich snippet).
