# brodjianpiping.com

Public site for **Brodjian Piping Integration LLC** — Ara Brodjian, sanitary process
piping / TIG welding / custom fabrication. Plain HTML/CSS/JS, no build step,
hosted on GitHub Pages.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — animated welder hero (traced from the logo), capabilities, stats, CTA |
| `about.html` | Ara's bio, experience timeline, certifications, resume popup |
| `gallery.html` | Instagram link (@arasarcistry) + optional local photo grid |
| `contact.html` | Phone/email + job inquiry form (Formspree) |
| `404.html` | Not-found page |

## Going live (one time)

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Launch site"
   git push -u origin main
   ```
2. **Enable Pages** — on GitHub: repo → *Settings → Pages* → Source: *Deploy from a
   branch* → Branch: `main`, folder `/ (root)` → Save.
3. **Custom domain** — in the same Pages settings, enter `brodjianpiping.com` in
   *Custom domain* (the `CNAME` file in this repo keeps it set across deploys).
4. **DNS** (at the registrar where brodjianpiping.com is registered):
   - Four `A` records for the apex `@`:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record: `www` → `<github-username>.github.io`
5. Back in Pages settings, once the DNS check passes, tick **Enforce HTTPS**
   (may take up to an hour to become available while the certificate is issued).

Every later `git push` to `main` redeploys the site automatically in ~1 minute.

## Contact form (one time, ~2 minutes)

The form on `contact.html` posts to [Formspree](https://formspree.io) (free tier:
50 submissions/month):

1. Sign up at formspree.io with the address that should receive inquiries.
2. Create a *New form* and copy its endpoint ID (e.g. `mqkrzvpd`).
3. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` attribute.

Until that's done the form shows "call or email instead" on submit — the phone
and email links next to it always work.

## Adding gallery photos

Drop images into `photos/` and list them in `photos/photos.js`:

```js
window.GALLERY_PHOTOS = [
  "photos/sanitary-weld-01.jpg",
  "photos/skid-install-02.jpg",
];
```

Order in the list = order on the page. Keep files under ~500 KB each for fast
loads (export at ~1600px on the long edge).

## Swapping the headshot

Replace `assets/img/headshot.jpeg` with the real photo (same filename, portrait
orientation — it's displayed at a 4:5 crop).

## Updating the resume

Replace `assets/resume/Ara_Brodjian_Resume.pdf` (the "Download PDF" button) and
edit the typeset copy inside `about.html` (`<dialog id="resume-dialog">`).
