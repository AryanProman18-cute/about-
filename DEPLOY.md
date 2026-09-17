# How to put this site on GitHub (and make it live)

This guide takes you from the zip file to a live site on GitHub Pages.
It looks long, but it is really just: extract, create repo, push, click one setting.

---

## The no-terminal way: upload the zip + run the workflow

If dragging 79 files around is not your thing, there is a shortcut. The
project includes a workflow that unzips `about.zip` inside GitHub for you:

1. Upload `about.zip` to the repo (Add file -> Upload files).
2. If it is not there yet, create the file `.github/workflows/unzip.yml`
   (Add file -> Create new file) and paste in the contents of the same file
   from this project.
3. Go to the **Actions** tab, pick **Unzip and deploy site**, click
   **Run workflow**, choose the `main` branch, run it.
4. The workflow extracts the zip, commits all files, deletes the zip, builds
   the site and publishes it. One click, done.

Any time you get a fresh `about.zip` (site updates), just upload it over the
old one and run the workflow again.

---

## What you need

- A free GitHub account (github.com)
- Git installed on your computer (download from git-scm.com, default options are fine)

---

## Step 1: Extract the zip

Extract `about.zip` anywhere you like. Inside you should see files like
`package.json`, `index.html`, `src/`, `public/` directly (not nested inside
another folder, depending on your extractor).

## Step 2: Create the GitHub repo

1. Go to github.com and click the **+** at the top right, then **New repository**.
2. Repository name: `about`
3. Visibility: **Public** (needed for free GitHub Pages)
4. Do NOT tick "Add a README" or anything else, keep it empty.
5. Click **Create repository**.

## Step 3: Push the code

Open a terminal (Git Bash on Windows, Terminal on Mac/Linux) inside the
extracted folder.

Easy way (Mac/Linux/Git Bash):

```bash
./push-to-github.sh https://github.com/<your-username>/about.git
```

(If your system blocks the script, run `bash push-to-github.sh <url>` instead.)

Manual way (works everywhere):

```bash
git init -b main
git add .
git commit -m "Portfolio site"
git remote add origin https://github.com/<your-username>/about.git
git push -u origin main
```

GitHub will ask you to sign in the first time. Follow the browser window
that opens.

## Step 4: Turn on GitHub Pages

1. In your repo, go to **Settings** -> **Pages** (left sidebar).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Done. The included workflow (.github/workflows/deploy.yml) builds the site
   automatically on every push to `main`.

## Step 5: Open your live site

After about a minute, your site is live at:

```
https://<your-username>.github.io/about/
```

You can also find the exact link in the repo: **Settings** -> **Pages**, or in
the **Actions** tab after the deploy run finishes (click the run, then the
deploy job shows the URL).

---

## How it works

- `.github/workflows/deploy.yml` runs on every push: it installs dependencies,
  builds the site (with `GITHUB_PAGES=true`, which sets the correct asset
  paths for the `/about/` URL), and publishes it to Pages.
- `vite.config.ts` uses base `/about/` only for the Pages build. Local
  development stays exactly as before (`npm run dev`).

## If you rename the repo

Say you name it `portfolio` instead of `about`. One line changes:

in `vite.config.ts`, change `'/about/'` to `'/portfolio/'`, commit, push.
The live URL becomes `https://<your-username>.github.io/portfolio/`.

## Running it locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Custom domain (optional)

If you buy a domain later: repo **Settings** -> **Pages** -> **Custom domain**.
Also remove the `base` line trick and set `base: '/'` in `vite.config.ts`,
since a custom domain serves the site from the root.

---

## Troubleshooting

- **Blank page at /about/**: you skipped the `GITHUB_PAGES` build (the workflow
  handles this automatically; only manual builds need
  `GITHUB_PAGES=true npm run build`).
- **"Refusing to merge unrelated histories" or push rejected**: you created
  the repo with a README. Either delete the repo and recreate it empty, or
  push with `git push -u origin main --force`.
- **404 on the Pages URL**: wait a minute and refresh; the first deploy can
  lag slightly behind the Actions run finishing.
