# Deploy VS LinkedIn Site using GitHub + Heroku

This guide is for deploying the static professional site (invoice request page + BIMI logo hosting) using **GitHub** for version control and **Heroku** for hosting, mapped to your custom domain `vs-linkedin.com`.

The site serves:
- `https://vs-linkedin.com/` → Professional landing page with services and "Request an Invoice" form
- `https://vs-linkedin.com/bimi/logo.svg` → Your BIMI-compliant logo (required for the BIMI DNS record)

## Prerequisites
- You have already updated DMARC on Cloudflare (great!).
- A GitHub account.
- A Heroku account (free tier is limited; you may need a paid dyno for reliable uptime — currently the "Eco" or "Basic" dynos are common starting points).
- Heroku CLI installed (optional but helpful): https://devcenter.heroku.com/articles/heroku-cli

## 1. Prepare the Project (already done locally)

The `site/` folder in your workspace is ready:
- `index.html` (the site)
- `bimi/logo.svg` (BIMI logo)
- `package.json` (Node + Express)
- `server.js` (simple static file server)
- `Procfile` (tells Heroku how to run it)

This uses a minimal Express server so Heroku can serve the static files reliably.

## 2. Create a GitHub Repository

1. Go to https://github.com and create a **new repository** (e.g. name it `vs-linkedin-site` or `vs-linkedin`).
2. **Do NOT** initialize it with README, .gitignore, or license (we'll push existing files).
3. Copy the repository URL (HTTPS or SSH), e.g.:
   `https://github.com/yourusername/vs-linkedin-site.git`

## 3. Push the Local Files to GitHub

Open your terminal and run these commands from inside the `site/` folder:

```bash
cd /Users/ymuller/svg_logo/site

# Initialize git (if not already)
git init -b main

# Add all files
git add .

# Commit
git commit -m "Initial site for VS LinkedIn + BIMI logo hosting"

# Connect to your GitHub repo (replace with your actual URL)
git remote add origin https://github.com/yourusername/vs-linkedin-site.git

# Push
git push -u origin main
```

If you get errors about remote already existing, you can skip the `remote add` or use `git remote set-url origin ...`

## 4. Create a Heroku App and Deploy from GitHub

### Option A: Using Heroku Dashboard + GitHub Integration (Recommended)

1. Log into https://dashboard.heroku.com
2. Click **New** → **Create new app**
3. Give it a name (e.g. `vs-linkedin` or `vs-linkedin-site`) — this becomes part of the temporary URL `https://your-app-name.herokuapp.com`
4. Choose a region (closest to you or Europe/US).
5. Click **Create app**
6. Go to the **Deploy** tab.
7. Under "Deployment method", choose **GitHub**.
8. Connect your GitHub account and select the repository you just created (`vs-linkedin-site`).
9. Enable **Automatic deploys** for the `main` branch (recommended).
10. Click **Deploy Branch** (or wait for the first automatic deploy).
11. Watch the build log. It will run `npm install` then start the server via the Procfile.

After successful deploy, your site is live at:
`https://your-app-name.herokuapp.com`

Test the logo directly:
`https://your-app-name.herokuapp.com/bimi/logo.svg`

## 5. Add Your Custom Domain (vs-linkedin.com) on Heroku

1. In your Heroku app dashboard, go to **Settings** tab.
2. Scroll to **Domains and certificates**.
3. Click **Add domain**.
4. Enter `vs-linkedin.com` and click **Add**.
5. Heroku will show the DNS record(s) you need to add. Common examples:
   - For the root domain: It may show a target like a CNAME to `your-app-name.herokuapp.com` or specific instructions.
   - It will also offer to add `www.vs-linkedin.com`.

   **Copy exactly** what Heroku tells you (the hostname and target value).

6. **Also add `www.vs-linkedin.com`** for convenience (you can redirect later if wanted).

## 6. Update DNS in Cloudflare

Since your DNS is managed in Cloudflare:

1. Go to Cloudflare dashboard → your domain → **DNS** → **Records**.
2. Add the record(s) exactly as Heroku instructed in the previous step.

   Typical for Heroku + Cloudflare (root domain):
   - Type: `CNAME`
   - Name: `vs-linkedin.com` (or `@` for apex in some UIs)
   - Target: `your-app-name.herokuapp.com` (the value Heroku gave you)
   - Proxy status: **Proxied** (orange cloud) — this helps with SSL and apex domain support via Cloudflare's CNAME flattening.

   For `www`:
   - Type: `CNAME`
   - Name: `www`
   - Target: the Heroku target
   - Proxied: Yes

3. If Heroku gave you a different record type or value, follow it precisely.
4. Wait 1–5 minutes for propagation (Cloudflare is fast).

5. Back in Heroku, click the **Verify** or it will automatically detect when DNS is correct.
6. Heroku will automatically provision a free SSL certificate (ACM) for your custom domain. This can take a few minutes.

Once complete, your site should be live at:
- `https://vs-linkedin.com`
- `https://vs-linkedin.com/bimi/logo.svg`  ← Use this exact URL for BIMI

**Important for apex domains**: Cloudflare's proxy (orange cloud) + CNAME flattening usually makes the naked domain work smoothly with Heroku.

## 7. Verify Everything is Working

- Visit https://vs-linkedin.com — you should see the professional site.
- Visit https://vs-linkedin.com/bimi/logo.svg — you should see the square SVG logo (it may render as an image or download).
- Test the invoice request form (currently logs to browser console).

## 8. Update Your BIMI DNS Record (Final Step for BIMI)

Now that the logo is hosted on the real domain, add or update the BIMI record in Cloudflare.

**Host:** `default._bimi`

**Type:** TXT

**Content (self-asserted version):**

```
v=BIMI1; l=https://vs-linkedin.com/bimi/logo.svg
```

With certificate (when you have a VMC or CMC):

```
v=BIMI1; l=https://vs-linkedin.com/bimi/logo.svg; a=https://vs-linkedin.com/bimi/certificate.pem
```

Add this record the same way you added the DMARC record.

After adding, wait a bit, then validate with tools like:
- https://www.uriports.com/tools/bimi-validator
- https://mxtoolbox.com (search BIMI)

## 9. Ongoing Workflow

- Make changes locally in the `site/` folder.
- `git add .`, `git commit -m "message"`, `git push`
- Heroku will automatically redeploy if you enabled Automatic Deploys.
- Or manually trigger deploy from the Heroku dashboard.

## Troubleshooting Tips

- **Heroku build fails**: Check the log. Most common issue is missing `package.json` or wrong Node version. The files we added should work (Node 20.x is specified).
- **Custom domain not working / SSL error**: Make sure the DNS record is proxied in Cloudflare and give Heroku a few minutes to issue the certificate.
- **Logo not loading at /bimi/logo.svg**: Confirm the file exists at `bimi/logo.svg` in the repo root (it does) and the server is running.
- **Apex domain (naked) issues**: You can add a page rule in Cloudflare or just use `www` + redirect if needed. Most people get it working with the proxied CNAME.
- **Form submissions**: Currently demo only (data shows in browser console). Reply if you want to connect it to a real form service (Formspree, etc.).

## Next After Deployment

Once the site is live on `vs-linkedin.com` and the BIMI record is published:
- Test sending invoice-style emails from your Infomaniak account.
- Check DMARC reports (they should start arriving at your `dmarc-reports@` address).
- Consider upgrading to a paid Heroku dyno for better reliability if this is production.

If Heroku gives you specific DNS values you don't understand, paste them here and I'll translate them into the exact Cloudflare records you need to add.

Let me know when you've pushed to GitHub or when the Heroku app is created — I can guide you through the next exact step or help with the BIMI record text. 

This setup (GitHub source control + Heroku hosting + Cloudflare DNS + your existing SPF/DKIM/DMARC) will get your professional site and BIMI logo live on the exact domain you use for customer invoices.