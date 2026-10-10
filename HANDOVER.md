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

1. Merge the working branch into `main`, either by opening and merging a pull request or by pushing to `main`.
2. In the GitHub repo **DylanMetcalf/Brain-Industries**, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. The **Build and deploy to GitHub Pages** workflow runs on every push to `main` (see the **Actions** tab). The first run takes about 2–3 minutes.
4. When it finishes, the site is live at `https://dylanmetcalf.github.io/Brain-Industries/`. Some links there may break until the custom domain below is connected, because the site expects to be served from a domain root.

## 6. Custom domain (www.brainindustriessa.co.za)

The old domain, `brainindustriessa.com`, stays with Wix. The new site uses **brainindustriessa.co.za**. `src/CNAME` and `site.json → url` are already set to `www.brainindustriessa.co.za`.

**A. Register the domain** (skip if already owned)
- Register `brainindustriessa.co.za` with any ZACR-accredited registrar (for example Domains.co.za, Afrihost, xneelo or Hetzner SA). Expect about R100 a year.
- Choose a plan that lets you edit DNS records. You don't need the registrar's hosting.

**B. Add the DNS records** (in the registrar's DNS manager)

| Type | Host / Name | Value |
|---|---|---|
| CNAME | `www` | `dylanmetcalf.github.io` |
| A | `@` (blank / root) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA (optional) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

- Delete any default "parking" A or CNAME records for `@` and `www` that the registrar created.
- If the GitHub repo is moved to a different account or organisation, the CNAME value changes to `<that-account>.github.io`.

**C. Connect it in GitHub**
1. Go to **Settings → Pages → Custom domain**, enter `www.brainindustriessa.co.za` and click **Save**. GitHub runs a DNS check, which can take from a few minutes to 24 hours.
2. When the check passes, tick **Enforce HTTPS**. The certificate is issued automatically.
3. *Recommended:* go to **your GitHub profile → Settings → Pages → Add a domain** and verify `brainindustriessa.co.za` with the TXT record GitHub gives you. This stops anyone else claiming it.

**D. Check**
- `https://www.brainindustriessa.co.za` loads the new site with a padlock.
- `https://brainindustriessa.co.za` (without www) redirects to the www address. GitHub does this automatically when the A records are present.
- Pages, PDFs, the gallery and the contact form all work.

**E. The old .com domain**
- **Keep it** (recommended, at least for a while): in Wix, set up a redirect or forward from `brainindustriessa.com` to `https://www.brainindustriessa.co.za`, so old links, the company profile and business cards still work. Once that's done, you can drop the Wix website plan and keep only the domain registration. Alternatively, transfer the domain out of Wix to your .co.za registrar and forward it from there.
- **Or let it lapse**: anything printed with `.com` (the company profile, flyers, email signatures) should then be updated to `.co.za`.

**Email is unaffected.** The company's addresses are `@imagine.co.za`, so no MX records change.

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
| Domain shows a 404 / "Site not found" | Check that **Settings → Pages** shows the custom domain, `CNAME` exists, and DNS has propagated (`dig www.brainindustriessa.co.za`). |
| HTTPS not available | Wait for DNS and certificate issue (up to 24 h). Remove and re-add the custom domain to re-trigger it. |
| Form emails not arriving | Check that `form.accessKey` is set, check spam/junk, and check that the Web3Forms address was confirmed. |
| Old content still showing | Hard-refresh the browser (Ctrl/Cmd + Shift + R). CSS and JS are versioned on every build. |
