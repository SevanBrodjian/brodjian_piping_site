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
3. **DNS** — the domain is registered at **GoDaddy** (nameservers `*.domaincontrol.com`).
   In GoDaddy: *My Products → brodjianpiping.com → DNS → Manage Zones*.
   - If **Domain Forwarding / parking** is on, turn it off first, or GoDaddy keeps
     re-adding its own `A` records and overwriting these.
   - Delete the existing `A` records on `@` (the parking addresses), then add four:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Point `www` at GitHub: type `CNAME`, name `www`, value `sevanbrodjian.github.io`
4. **Custom domain** — once `dig +short brodjianpiping.com` returns the four `185.199.*`
   addresses, go to *Settings → Pages → Custom domain*, enter `brodjianpiping.com`, Save.
   Keep the `CNAME` file in this repo: with GitHub Actions deploys it is what carries the
   domain into each deployment.
5. Once the DNS check passes, tick **Enforce HTTPS** (the certificate can take up to an
   hour to be issued).

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
