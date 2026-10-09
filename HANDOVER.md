# Brain Industries website — handover

## 1. What was built

The new official website for Brain Industries (Pty) Ltd. It replaces the Wix site and doesn't depend on Wix for hosting, images, forms or scripts.

| Page | URL |
|---|---|
| Home | `/` |
| Services overview | `/services/` |
| 8 service and product pages | `/services/<slug>/` (generated from one data file) |
| InspectX | `/inspectx/` |
| About | `/about/` |
| Projects / gallery (filter + lightbox) | `/projects/` |
| Contact + enquiry form | `/contact/` |
| Legal (Privacy Notice, PAIA, website note) | `/legal/` |
| Not found | `/404.html` |

The build also creates `sitemap.xml`, `robots.txt`, Open Graph and structured data (`LocalBusiness`), favicons and a `CNAME` file.

## 2. Technology

- **[Eleventy](https://www.11ty.dev/) 3** is a static site generator. Its output is plain HTML, CSS and JS, with no server and no database.
- **Vanilla CSS and JavaScript.** There is no framework. The JS is about 6 KB, and the site works without it apart from the form.
- **@11ty/eleventy-img** resizes images to AVIF, WebP and JPEG at build time.
- **Lucide** supplies the icons (one consistent family), inlined as SVG at build time.
- **Fonts:** Inter (text) and Archivo (headings and labels), both self-hosted with no Google requests.
- **Design:** a light industrial theme with dark wine/charcoal brand bands (InspectX, call to action, footer). Dark sections use the `theme-dark` class. The colour and font tokens are at the top of `main.css`.
- **Interactive parts:**
  - an Ex quick reference covering zones, EPLs, temperature classes and groups (`_includes/partials/exref.njk`)
  - an InspectX app walkthrough (`ix-device.njk`)
  - an illustrative manager dashboard (`ix-dash.njk`)
  - a mobile call/quote bar
- **Hosting:** GitHub Pages, deployed by GitHub Actions.
- **Contact form:** [Web3Forms](https://web3forms.com), a static form-to-email service.

## 3. Project structure

```
src/
  _data/
    site.json        ← company details, contacts, address, documents, form key
    services.json    ← every service/product page (text, icon, image)
    gallery.json     ← gallery images, captions, categories
    nav.json         ← main navigation
  _includes/         ← layout, header, footer, call-to-action band
  assets/
    css/main.css     ← all styling (design tokens at the top)
    js/main.js       ← menu, gallery, form
    images/          ← source photos (brand/, gallery/, products/)
    docs/            ← PDFs (company profile, InspectX, privacy, PAIA)
    fonts/
  static/            ← favicons, og-image, manifest (copied to site root)
  index.njk, about.njk, contact.njk, inspectx.njk, projects.njk, legal.njk, 404.njk
  services/          ← services index + service page template
  CNAME              ← custom domain for GitHub Pages
eleventy.config.js   ← build configuration
scripts/check-links.mjs ← checks that no internal links or images are broken
.github/workflows/deploy.yml ← automatic deployment
```

## 4. Run locally

You need Node.js 20 or later.

```bash
npm install
npm start          # http://localhost:8080, reloads on save
npm run build      # production build into _site/
npm run check      # verify internal links/images after a build
```

The first build takes a minute or two while the images are optimised. Later builds are faster.

## 5. Deploy to GitHub Pages

1. Push the repository to GitHub, with the site on the `main` branch.
2. Go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and deploys automatically (**Actions** tab → "Build and deploy to GitHub Pages"). You can also run it by hand with **Run workflow**.

## 6. Custom domain (www.brainindustriessa.com)

The `src/CNAME` file already contains `www.brainindustriessa.com`.

1. **GitHub:** go to **Settings → Pages → Custom domain**, enter `www.brainindustriessa.com` and save. Once the certificate is issued, tick **Enforce HTTPS**. This can take up to 24 hours after DNS is correct.
2. **Recommended:** verify the domain under GitHub **Settings (your account or org) → Pages → Verified domains**. This stops anyone else claiming it.
3. **DNS:** set these records at the domain registrar or DNS host, and remove the old Wix records for the same names:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `www` | `<github-username>.github.io` (the account/org that owns the repo, no repo name) |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA (optional) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

   With both the apex (`@`) and `www` records pointing at GitHub, GitHub Pages redirects `brainindustriessa.com` to `www.brainindustriessa.com` automatically.
4. Before you switch: check the current IP values in [GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Also check whether the domain is registered *through Wix*. If it is, either transfer it to another registrar or edit its DNS in Wix before you cancel the Wix plan.
5. **Email:** the addresses are `@imagine.co.za`, so moving the website domain does not affect email. If any MX or TXT records exist on `brainindustriessa.com`, keep them.
6. Cancel Wix only once the new site loads over HTTPS on both addresses.

## 7. Contact form

- The form posts to Web3Forms, which emails each submission to the address registered for the access key.
- **Setup (once):** go to https://web3forms.com, enter the email address that should receive enquiries and confirm it. Copy the access key into `src/_data/site.json` → `form.accessKey`, then commit and push.
- The access key is a *public* key, designed by Web3Forms to sit in client-side code. It only lets visitors send mail to the registered address, so it's not a secret.
- **Until a key is added,** pressing "Send enquiry" opens the visitor's email app with the message filled in, addressed to `primaryEmail`. Nothing is lost in the meantime.
- **Spam protection:** a hidden honeypot field. If spam becomes a problem, Web3Forms also supports hCaptcha.
- **Validation:** required fields, email format, phone format and privacy consent, with accessible inline errors and success and error messages.

## 8. Where content lives

- **Company details, phones, emails, address, registration number, LinkedIn:** `src/_data/site.json`
- **Service and product pages:** `src/_data/services.json`
- **Page text:** the `.njk` file of the same name in `src/` (plain HTML with `{{ }}` placeholders)
- **Navigation:** `src/_data/nav.json`

## 9. Images

- Source photos are in `src/assets/images/`. Upload large JPGs (up to about 2000 px); the build resizes and compresses them automatically.
- **Add a gallery image:** put the file in `src/assets/images/gallery/` and add an entry to `src/_data/gallery.json` with `src`, `alt` (a description for screen readers), `caption` and `category`.
- **Logos:** `src/assets/images/brand/`.
  - To use a new InspectX logo, replace `inspectx-logo-white.png`, keeping the same name. A transparent PNG with a white logo works best, because it sits on a dark background. If the proportions change, update the `width`/`height` in `src/inspectx.njk` and `src/index.njk`.

## 10. Replace a PDF

Overwrite the file in `src/assets/docs/`, keeping the same filename, and push. Every link updates automatically. To use a different filename, change the path in `site.json` → `documents`. If the size changes noticeably, update the `size` label there too.

The company profile PDF is about 10 MB. A compressed version (for example from Adobe Acrobat's "Reduce file size") would download faster on mobile.

## 11. Update contact information

Edit `src/_data/site.json`. The header, footer, contact page, About page, structured data and form fallback all read from that one file.

## 12. Update services

Edit `src/_data/services.json`. Each entry becomes a page at `/services/<slug>/` and appears on the home page, the services index, the footer and the contact-form dropdown.

| Field | What it does |
|---|---|
| `group` | `service` or `product` |
| `icon` | any name from https://lucide.dev/icons that exists in the installed version |
| `short` | card text |
| `lead`, `body` | page text |
| `points` | "What's included" |
| `audience` | "Typical applications" |
| `image` / `imageAlt` / `imageFit` | optional image (`contain` suits product cut-outs) |

To add a service, copy an entry and give it a new `slug`. To remove one, delete its entry.

## 13. Update InspectX

The page is `src/inspectx.njk`. Its content comes from the InspectX presentation and one-pager. The InspectX PDFs are in `src/assets/docs/`. When a feature changes (for example, SAP integration moves out of "In progress"), edit the matching list item.

## 14. Legal documents

Replace `brain-industries-privacy-notice.pdf` or `brain-industries-paia-manual.pdf` in `src/assets/docs/`. The short website note on `src/legal.njk` describes how the contact form is handled. Review it if the form provider changes.

## 15. Troubleshooting

| Problem | Fix |
|---|---|
| Deployment failed | Open **Actions** and read the red step. `Unknown icon` means a misspelt icon name in `services.json`. `Missing alt text` means an image needs `alt`. `check` failing means a link points to a file that doesn't exist. |
| JSON error on build | A missing comma or quote in a `_data/*.json` file. Paste the file into https://jsonlint.com. |
| Domain shows a 404 / "Site not found" | Check that **Settings → Pages** shows the custom domain, `CNAME` exists, and DNS has propagated (`dig www.brainindustriessa.com`). |
| HTTPS not available | Wait for DNS and certificate issue (up to 24 h). Remove and re-add the custom domain to re-trigger it. |
| Form emails not arriving | Check that `form.accessKey` is set, check spam/junk, and check that the Web3Forms address was confirmed. |
| Old content still showing | Hard-refresh the browser (Ctrl/Cmd + Shift + R). CSS and JS are versioned on every build. |
