# Outpost Zero

> **Survive the Sun. Power the Base. Explore the Unknown.**

- **Team:** The Primeagens
- **Competition:** NASA Space Apps Challenge 2026
- **Challenge:** Build a Junior Astronaut Mission Trainer

---

## Project Links

- **Live Game:** [\[LIVE_URL\]](https://outpost-zero-theta.vercel.app/)
- **Demo Video:** [VIDEO_URL]
- **Source Repository:** [\[REPO_URL\]](https://github.com/Balanced0/Outpost-Zero)

---

## What It Is

Outpost Zero is an educational 2D top-down browser game built for kids ages 7 to 12. Players take command of a vulnerable outpost on the Moon or Mars across a 20-day scientific mission. Every morning, players must divide a strict, limited power budget between the life-support Air Machine, the radiation Shield, and their exploration Rover. Through direct gameplay feedback, players learn that every choice carries a tradeoff and that surviving on an alien world requires balancing human safety with scientific curiosity.

---

## Real Space Constraints It Teaches

1. **Power Budgeting:** Available power on an off-world base is strictly finite. Allocating extra power to one subsystem directly starves another.
2. **Radiation Shielding vs. Exploration:** Diverting power into the magnetic shield protects the crew inside the habitat from solar storms, but leaves less energy in the rover battery to explore distant craters.
3. **Comms Delay:** Radio signals travel at the speed of light. Asking Mission Control on Earth for storm advice or navigational help incurs real delay (scaled from ~1.3 seconds for the Moon to 4–24 minutes for Mars). During a rapid solar flare, waiting for Earth's response means the advice arrives after the storm has already hit.
4. **Night & Battery Limits:** When the Sun sets, solar panels shut down and surface temperatures plummet. A rover caught away from base after sunset freezes in the dark and must be towed home with a drained battery penalty for the next sol.

---

## How to Play

### Daily Loop
1. **Morning Power Allocation:** Check today's space weather report and split your energy budget among the Air Machine, Radiation Shield, and Rover Battery.
2. **Exploration & Sampling:** Drive across the terrain, follow radar pings to scientific discovery spots, scan samples before sunset, and return to base to recharge.
3. **Evening Debrief:** Review crew health and air levels, see how the base held up against any radiation storms, inspect real NASA rover photos discovered during the sol, and read an authentic space science fact.

### Controls
- **Drive Rover:** Arrow keys, `W` `A` `S` `D`, or the on-screen touch joystick on mobile/tablet.
- **Scan Samples:** `Spacebar` or tap the on-screen Scan button when close to a discovery ping.
- **Audio Controls:** Sound toggle button in the top-right corner (features generative ambient chord pads and authentic sci-fi sound effects).

---

## NASA Data Used & Why

Outpost Zero strictly incorporates real NASA data to drive game systems:

### 1. NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information)
- **What it does:** Ingests real space weather observations—specifically Solar Flares (`FLR`), Geomagnetic Storms (`GST`), and Solar Energetic Particle events (`SEP`).
- **Live vs. Saved Fallback:**
  - **Live Mode:** The game queries `/api/donki` for the last 60 days of real space weather and automatically selects the most active 20-consecutive-day window.
  - **Saved Real Archive:** If the NASA API is unreachable, rate-limited, or times out (after an 8-second ceiling), the game automatically falls back to an offline archive containing verified NASA DONKI data from **May 1, 2024 to May 20, 2024** (the historic Mother's Day 2024 solar storm event, featuring severe G5 geomagnetic storms and multiple X-class flares).
  - **Simulated Mode:** If both live and saved archives are unavailable, a deterministic simulation profile ensures the game remains playable.

### 2. NASA Image and Video Library & JPL Photojournal
Inspecting discovery sites unlocks real Martian surface photographs captured by NASA rovers:
- **`mars-1.jpg`**: *"Perseverance Rover Says Goodbye to 'Witch Hazel Hill'"* — Credit: NASA/JPL-Caltech ([PIA26573](https://photojournal.jpl.nasa.gov/catalog/PIA26573))
- **`mars-2.jpg`**: *"Perseverance Rover's View Up Crater"* — Credit: NASA/JPL-Caltech/ASU/MSSS ([PIA26373](https://photojournal.jpl.nasa.gov/catalog/PIA26373))
- **`mars-3.jpg`**: *"Perseverance's WATSON Views Bettys Rock"* — Credit: NASA/JPL-Caltech ([PIA25659](https://photojournal.jpl.nasa.gov/catalog/PIA25659))
- **`mars-4.jpg`**: *"Perseverance Finds a Hollowed-Out Rock"* — Credit: NASA/JPL-Caltech/ASU/MSSS ([PIA25917](https://photojournal.jpl.nasa.gov/catalog/PIA25917))
- **`mars-5.jpg`**: *"WATSON Views 'Foux'"* — Credit: NASA/JPL-Caltech/MSSS ([PIA24728](https://photojournal.jpl.nasa.gov/catalog/PIA24728))
- **`mars-6.jpg`**: *"Abrasion Patch on Rochette"* — Credit: NASA/JPL-Caltech ([PIA24839](https://photojournal.jpl.nasa.gov/catalog/PIA24839))
- **`mars-7.jpg`**: *"NASA Mars Rover Spirit View Southward from Husband Hill"* — Credit: NASA/JPL-Caltech/Cornell Univ. ([PIA17760](https://photojournal.jpl.nasa.gov/catalog/PIA17760))
- **`mars-8.jpg`**: *"Curiosity's 3D View of Mont Mercou"* — Credit: NASA/JPL-Caltech/MSSS ([PIA24266](https://photojournal.jpl.nasa.gov/catalog/PIA24266))

### 3. Science Facts Sources
Educational facts presented at the end of each day cite real NASA documentation:
- NASA Science Mars Exploration
- NASA Mars Exploration
- NASA JPL Perseverance Mission
- NASA Solar System Exploration
- NASA Goddard Space Flight Center
- NASA Deep Space Network
- NASA JPL Robotics

---

## What Is Simulated (Game Adaptations)

To keep the game fun, accessible, and fast-paced for kids, certain mechanics are simplified:
- **Power Units:** A simplified 90-to-100 power point pool rather than complex kilowatt-hour load grids.
- **Damage Arithmetic:** Direct subtraction between storm severity index and shield percentage.
- **Comms Delay:** Scaled down from minutes to 4–24 seconds so players understand latency without waiting in front of an idle screen.
- **Terrain & Sampling:** Map terrain and sample positions are procedural representations of lunar and martian geology.

---

## Data Honesty Guarantee

Outpost Zero maintains strict transparency with players. Every screen clearly indicates where its information comes from:
- **`Live NASA data`**: Real space weather fetched directly from NASA DONKI.
- **`Saved NASA data`**: Real historical NASA DONKI space weather from May 1–20, 2024.
- **`Simulated`**: Procedural game balance calculations.

A dedicated **Data Sources & Science** modal in the menu provides kids and judges with the complete provenance of all data used.

---

## Tech Stack

- **Game Engine & Rendering:** Phaser 3.60 (Hardware-accelerated WebGL / Canvas)
- **UI Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS (glossy sci-fi glassmorphism)
- **State Management:** Zustand
- **Audio:** Web Audio API with procedural ambient music synthesis
- **Backend / Serverless:** Vercel Serverless Functions (`/api/donki`)

---

## Run Locally

1. **Clone the repository:**
   ```bash
   git clone [REPO_URL]
   cd outpost-zero
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your NASA API Key:**
   Copy the example environment file and add your key from [api.nasa.gov](https://api.nasa.gov/):
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```bash
   NASA_API_KEY=your_key_here
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/). The built-in Vite development middleware handles `/api/donki` calls locally with automatic in-memory caching.

---

## Deployment on Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com/).
3. In **Project Settings** → **Environment Variables**, add:
   - **Key:** `NASA_API_KEY`
   - **Value:** your NASA API key
4. Deploy. The serverless function at `/api/donki.ts` will automatically execute in Node.js, and client routing is handled via `vercel.json`.

---

## Asset & Media Credits

- **Kenney Assets (CC0 1.0 Universal - Public Domain):**
  - *Kenney Sci-Fi RTS*: Surface environment rocks, tiles, outpost structures
  - *Kenney Interface Sounds*: UI buttons, confirmation chimes, toggles
  - *Kenney Sci-Fi Sounds*: Alarms, alerts, storm pulses
  - *Kenney Planets*: Planet render thumbnails
- **NASA Imagery:** NASA/JPL-Caltech, MSSS, ASU, and Cornell University (public domain US government work).
- **Optimization Note:** Original uncompressed high-resolution NASA master photos in `assets-originals/` are excluded from deployment via `.gitignore`. All deployed game assets in `public/assets/` are compressed and web-optimized, with **zero files exceeding 1 MB**.

---

## AI Tools Disclosure

AI coding assistants (Antigravity, Claude, Chatgpt) were used to assist with code drafting, refactoring, and documentation formatting. All architectural decisions, gameplay balance tuning, data verification, and testing were actively directed, implemented, and reviewed by the human team.

---

## Team

**The Primeagens**
- MD. Alvi Chowdhury
- Ishfak Mahbub Samin
- Saad Ahmed
- Syed Owin Efaz
