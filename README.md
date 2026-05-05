# NYRB AMS Dashboard — Vercel Deployment Guide

## What This Does
Google Sheets → Vercel API → Dashboard (live data, auto-refreshes)

Staff paste data into Google Sheets. The dashboard fetches it through
Vercel serverless functions. No API keys needed — the sheet just needs
to be set to "Anyone with the link can view."

---

## Step 1 — Upload to GitHub

1. Go to **github.com** and click **New repository**
2. Name it: `nyrb-ams`
3. Set to **Private** (recommended) or Public
4. Click **Create repository**
5. On the next screen, click **uploading an existing file**
6. Drag and drop ALL files from this folder:
   ```
   nyrb-ams/
   ├── package.json
   ├── vercel.json
   ├── api/
   │   ├── _sheet.js
   │   ├── gps.js
   │   ├── cmj.js
   │   ├── nordbord.js
   │   ├── hipforce.js
   │   ├── sprint.js
   │   ├── 505.js
   │   ├── broad.js
   │   ├── mas.js
   │   └── movement.js
   └── public/
       └── index.html
   ```
7. Click **Commit changes**

---

## Step 2 — Deploy on Vercel

1. Go to **vercel.com** → click **Add New Project**
2. Click **Import** next to your `nyrb-ams` repo
3. Leave all settings as default (Vercel auto-detects the setup)
4. Click **Deploy**
5. Wait ~60 seconds for the first deploy

Your dashboard will be live at a URL like:
`https://nyrb-ams-xxxxxxxxx.vercel.app`

---

## Step 3 — Add Your Sheet ID (Environment Variable)

The Sheet ID is already hardcoded as a fallback, but for security
it's better to set it as an environment variable:

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `SHEET_ID`
   - **Value:** `1FNDKb6Vdjbq8g8RruMjrNMbhmejtmOE3tAsl5NhtP38`
3. Click **Save**
4. Go to **Deployments** → click **Redeploy**

---

## Step 4 — Verify Google Sheet is Public

1. Open your Google Sheet
2. Click **Share** (top right)
3. Under "General access" → select **Anyone with the link**
4. Set role to **Viewer**
5. Click **Done**

---

## Google Sheet Tab Names Required

| Tab Name | Data |
|---|---|
| `GPS_Daily` | GPS session data |
| `VALD_CMJ` | CMJ jump testing |
| `VALD_NordBord` | NordBord hamstring |
| `VALD_HipForce` | Hip abduction/adduction |
| `Sprint_Testing` | 30m sprint splits |
| `505_Testing` | 5-0-5 agility |
| `Broad_Jump` | Standing broad jump |
| `MAS_Testing` | MAS aerobic test |
| `Movement_Screen` | Movement screen scores |

**Tab names must match exactly** (case-sensitive).

---

## Required Column Names Per Tab

### GPS_Daily
`Player, Date, Session, MD, Position, Total Distance, HSR, Sprint, Explosive, Dist/Min, Max Speed, Acc, Dec, HML, Minutes`

### VALD_CMJ
`Player, Date, Age Group, Jump Height, RSI, Power`

### VALD_NordBord
`Player, Date, Age Group, Left, Right`

### VALD_HipForce
`Player, Date, Age Group, HAb Left, HAb Right, HAd Left, HAd Right`

### Sprint_Testing
`Player, Date, Age Group, 0-10m, 10-20m, 20-30m, Total`

### 505_Testing
`Player, Date, Age Group, Time`

### Broad_Jump
`Player, Date, Age Group, Distance`

### MAS_Testing
`Player, Date, Age Group, Distance, Time, MAS`

### Movement_Screen
`Player, Date, Session, LB Squat, LB Hinge, LB Split Squat, UB Push-up, UB Squat, UB Hinge, UB Split Squat, Notes`

---

## Refreshing Data

- The dashboard auto-loads fresh data every time the page opens
- Click the **↻ Loading…** button in the top bar to refresh manually
- Vercel caches API responses for 60 seconds, so changes in the sheet
  will appear within about 1 minute

---

## Updating the Dashboard

Any time you change the code:
1. Update the file on GitHub (drag & drop again, or use GitHub editor)
2. Vercel auto-deploys within ~30 seconds

---

## Troubleshooting

**"Could not load data" error:**
- Check the sheet is set to "Anyone with the link can view"
- Verify tab names match exactly (case-sensitive)
- Check Vercel function logs: Vercel dashboard → your project → **Functions** tab

**Data shows but is empty/wrong:**
- Check column header names in your sheet match the required names above
- The API is flexible with alternatives (e.g. "Name" works instead of "Player")

**Testing the API directly:**
Visit `https://your-vercel-url.vercel.app/api/gps` in a browser.
You should see JSON data. If you see an error, the sheet sharing
or tab name is the issue.
