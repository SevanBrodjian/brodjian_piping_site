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
2. **Enable Pages** — on GitHub: repo → *Settings → Pages* → Source: **GitHub Actions**.
   (The included workflow `.github/workflows/deploy.yml` builds the photo manifest and
   deploys on every push to `main`.)
3. **Custom domain** — in the same Pages settings, enter `brodjianpiping.com` in
   *Custom domain* (with GitHub Actions deployment the setting persists on its own;
   no CNAME file needed).
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

Drop images into `photos/`, commit, push. That's it — the deploy workflow converts
(HEIC/PNG to JPG), resizes to 1600px, and rebuilds the gallery manifest automatically.
Full-size photos straight off a phone are fine. Photos appear in alphabetical filename
order, so name them `01-...jpg`, `02-...jpg` to control ordering.

Uploads also work directly on github.com (open the `photos/` folder, *Add file →
Upload files*, drag in, Commit) — no git required, so Ara can do it himself.

## Previewing locally

```bash
python3 tools/serve.py
```

Serves the site at http://localhost:8735 and rebuilds the gallery list from the
`photos/` folder on every reload, the same way the deploy workflow does, so what
you see locally matches the live site.

## Swapping the headshot

Replace `assets/img/headshot.jpeg` with the real photo (same filename, portrait
orientation — it's displayed at a 4:5 crop).

## Updating the resume

Replace `assets/resume/Ara_Brodjian_Resume.pdf` (the "Download PDF" button) and
edit the typeset copy inside `about.html` (`<dialog id="resume-dialog">`).
