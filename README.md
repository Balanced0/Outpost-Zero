# Outpost Zero

A 2D open-world web game built for the **NASA Space Apps Challenge**. Players run a tiny Mars outpost, drive an exploration rover, and balance power between survival and discovery based on real NASA space weather.

---

## Running with NASA Data

The game uses live space weather data from **NASA DONKI** (Space Weather Database Of Notifications, Knowledge, Information), including solar flares (FLR), geomagnetic storms (GST), and solar energetic particle events (SEP).

### 1. Get an API Key
1. Visit [api.nasa.gov](https://api.nasa.gov/) and generate a free API key.
2. In the project root, create or edit `.env.local`:
   ```bash
   NASA_API_KEY=your_actual_key_here
   ```
3. For deployment on **Vercel**, go to your Vercel Project Settings → **Environment Variables** and add:
   - **Key**: `NASA_API_KEY`
   - **Value**: your NASA API key

### 2. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/).

> **Note on Local Development**: You do **not** need a separate server or Vercel CLI to run `/api/donki` locally! The built-in Vite dev middleware in `vite.config.ts` handles `/api/donki` requests, automatically reads `NASA_API_KEY` from `.env.local`, and talks to NASA with an in-memory cache.

### 3. Graceful Fallbacks (Honest Data Guarantee)
If the live NASA call cannot be reached (e.g. rate limit, offline, or timeout):
1. **Live NASA Data**: Fetched live from `/api/donki` for the last 60 days, picking the most active 20-day consecutive window.
2. **Saved NASA Archive**: Automatically falls back to [src/data/donkiArchive.json](src/data/donkiArchive.json), which contains verified, real NASA DONKI observations from the historic May 2024 solar storm period (153 flares, 5 geomagnetic storms, 14 SEP events).
3. **Simulated Profile**: If both live and saved data are unavailable, falls back to a deterministic simulated profile with a guaranteed storm between Days 3 and 6.

All sources are labeled honestly on the morning screen and result card (**Live NASA data**, **Saved NASA data**, or **Simulated**).

### 4. Regenerating the Saved Archive
To refresh the saved real archive at any time with the latest DONKI data:
```bash
npx tsx scripts/buildArchive.ts
```

