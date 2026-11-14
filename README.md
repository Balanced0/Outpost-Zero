# Outpost Zero

> **Explore far. Stay alive. Nothing is free.**

- **Team:** The Primeagens
- **Competition:** NASA Space Apps Challenge 2026
- **Challenge:** Build a Junior Astronaut Mission Trainer

---

## Project Links

- **Live Game:** https://outpost-zero-theta.vercel.app/
- **Demo Video:** [VIDEO_URL]
- **Source Repository:** [REPO_URL]

---

## What It Is

Outpost Zero is an educational 2D top-down browser game built for kids ages 7 to 12. Players take command of a vulnerable outpost on the Moon or Mars across a 20-day scientific mission. Every morning, players must divide a strict, limited power budget between the life-support Air Machine, the radiation Shield, and their exploration Rover. Through direct gameplay feedback, players learn that every choice carries a tradeoff and that surviving on an alien world requires balancing human safety with scientific curiosity.

---

## Real Space Constraints It Teaches

1. **Power Budgeting:** Available power on an off-world base is strictly finite. Allocating extra power to one subsystem directly starves another.
2. **Radiation Shielding vs. Exploration:** Diverting power into the magnetic shield protects the crew inside the habitat from solar storms, but leaves less energy in the rover battery to explore distant craters.
3. **Comms Delay:** Radio signals travel at the speed of light. In reality, signals take about 1.3 seconds for the Moon and 4 to 24 minutes for Mars depending on orbital positions. In Outpost Zero, the base delay is 20 seconds on Mars and 2 seconds on the Moon, scaled by difficulty (Explorer: 0.5×, Commander: 1.0×, Mission Control: 1.5×). During a rapid solar storm, asking Earth for advice takes time—waiting for Mission Control's response means advice may arrive after the storm has already struck.
4. **Night & Battery Limits:** When the Sun sets, solar panels shut down and surface temperatures plummet. A rover caught away from base after sunset freezes in the dark and must be towed home with a drained battery penalty for the next sol.

---

## How to Play

### Daily Loop
1. **Morning Power Allocation:** Check today's space weather forecast and divide your finite energy budget among the life-support Air Machine, Radiation Shield, and Rover Battery.
2. **Exploration & Sampling:** Drive across the terrain toward scientific discovery spots before sunset. A navigation radar hint arrow appears only on Explorer difficulty to guide younger players (on Commander and Mission Control difficulties, navigation requires compass/radar pings alone). When a scan succeeds, a discovery popup appears showing real Mars and Moon photographs (ice discoveries use a drawn illustration, not a NASA photo). Return to base before sunset to recharge.
3. **Evening Debrief:** The evening card shows the day's result (crew health, life-support air status, storm impact vs. shield strength) and presents one authentic space science fact.

### Controls
- **Drive Rover:** Arrow keys, `W` `A` `S` `D`, or the on-screen touch joystick on mobile/tablet.
- **Scan Samples:** `Spacebar` or tap the on-screen Scan button when close to a discovery ping.
- **Audio Controls:** Sound toggle button in the top-right corner (features generative ambient chord pads and authentic sci-fi sound effects).

---

## NASA Data Used & Why

Outpost Zero strictly incorporates real NASA data to drive game systems:

### 1. NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information)
- **Why it matters:** Real solar activity directly drives the daily shielding versus exploration trade-off: when a powerful solar flare or coronal mass ejection is detected, players must divert scarce energy into the habitat's radiation shield or face health damage, sacrificing battery power for rover exploration. Note: NASA Open Science Data Repository (OSDR) and Artemis program datasets are not used.
- **What it does:** Ingests real space weather observations—specifically Solar Flares (`FLR`), Geomagnetic Storms (`GST`), and Solar Energetic Particle events (`SEP`).
- **Live vs. Saved Fallback:**
  - **Live Mode:** The game queries `/api/donki` for the last 60 days of real space weather and automatically selects the most active 20-consecutive-day window.
  - **Saved Real Archive:** If the NASA API is unreachable, rate-limited, or times out (after an 8-second ceiling), the game automatically falls back to an offline archive containing verified NASA DONKI data from **May 1, 2024 to May 20, 2024** (the historic Mother's Day 2024 solar storm event, featuring severe G5 geomagnetic storms and multiple X-class flares).
  - **Simulated Mode:** If both live and saved archives are unavailable, a deterministic simulation profile ensures the game remains playable.

### 2. NASA Image and Video Library & JPL Photojournal
Inspecting discovery sites unlocks real Mars and Moon photographs captured by NASA missions. Ice discoveries use a drawn illustration, not a NASA photo.

#### Mars photos
- **`mars-1.jpg`**: *"Perseverance Rover Says Goodbye to 'Witch Hazel Hill'"* — Credit: NASA/JPL-Caltech ([PIA26573](https://photojournal.jpl.nasa.gov/catalog/PIA26573))
- **`mars-2.jpg`**: *"Perseverance Rover's View Up Crater"* — Credit: NASA/JPL-Caltech/ASU/MSSS ([PIA26373](https://photojournal.jpl.nasa.gov/catalog/PIA26373))
- **`mars-3.jpg`**: *"Perseverance's WATSON Views Bettys Rock"* — Credit: NASA/JPL-Caltech ([PIA25659](https://photojournal.jpl.nasa.gov/catalog/PIA25659))
- **`mars-4.jpg`**: *"Perseverance Finds a Hollowed-Out Rock"* — Credit: NASA/JPL-Caltech/ASU/MSSS ([PIA25917](https://photojournal.jpl.nasa.gov/catalog/PIA25917))
- **`mars-5.jpg`**: *"WATSON Views \"Foux\""* — Credit: NASA/JPL-Caltech/MSSS ([PIA24728](https://photojournal.jpl.nasa.gov/catalog/PIA24728))
- **`mars-6.jpg`**: *"Abrasion Patch on Rochette"* — Credit: NASA/JPL-Caltech ([PIA24839](https://photojournal.jpl.nasa.gov/catalog/PIA24839))
- **`mars-7.jpg`**: *"NASA Mars Rover Spirit View Southward from Husband Hill"* — Credit: NASA/JPL-Caltech/Cornell Univ. ([PIA17760](https://photojournal.jpl.nasa.gov/catalog/PIA17760))
- **`mars-8.jpg`**: *"Curiosity's 3D View of Mont Mercou"* — Credit: NASA/JPL-Caltech/MSSS ([PIA24266](https://photojournal.jpl.nasa.gov/catalog/PIA24266))

#### Moon photos
- **`moon-1.jpg`**: *"Saturn Apollo Program"* — Credit: NASA ([9312448](https://images.nasa.gov/details/9312448))
- **`moon-2.jpg`**: *"View of the orange soil which Apollo 17 crewmen found at Station 4 during EVA"* — Credit: NASA ([as17-137-20989](https://images.nasa.gov/details/as17-137-20989))
- **`moon-3.jpg`**: *"Astronaut Eugene Cernan drives the Lunar Roving Vehicle during first EVA"* — Credit: NASA ([as17-147-22523](https://images.nasa.gov/details/as17-147-22523))
- **`moon-4.jpg`**: *"View of boulder photographed during second Apollo 17 EVA"* — Credit: NASA ([as17-137-20910](https://images.nasa.gov/details/as17-137-20910))
- **`moon-5.jpg`**: *"Apollo 17,Sta 5,Panoramic"* — Credit: NASA ([as17-145-22162](https://images.nasa.gov/details/as17-145-22162))

### 3. Science Facts Sources
Educational space science facts presented on the evening debrief card cite authentic NASA mission documentation. Each fact includes its source name exactly as recorded in `src/data/facts.ts`:

#### Sources pending
*(The following facts are stored in `src/data/facts.ts` with empty `sourceUrl` fields pending direct URL links; no URLs are invented):*
1. **"Mars looks reddish-orange because its soil is packed with iron minerals that oxidized, just like rust on an old bicycle."**
   - Source: NASA Science Mars Exploration (Source URL: pending)
2. **"A single day on Mars is called a 'sol', and it lasts 24 hours, 39 minutes, and 35 seconds—just slightly longer than a day on Earth."**
   - Source: NASA Mars Exploration (Source URL: pending)
3. **"NASA rovers like Perseverance and Curiosity are about the size of a car and use cameras on tall masts to scout safe paths."**
   - Source: NASA JPL Perseverance Mission (Source URL: pending)
4. **"Mars is home to Olympus Mons, the largest volcano in our Solar System, standing nearly three times taller than Mount Everest."**
   - Source: NASA Solar System Exploration (Source URL: pending)
5. **"Because the atmosphere on Mars is so thin, nighttime temperatures can plunge below minus 100 degrees Celsius."**
   - Source: NASA Goddard Space Flight Center (Source URL: pending)
6. **"NASA scientists send commands to rovers once a day, and radio signals can take up to 24 minutes to travel between Earth and Mars."**
   - Source: NASA Deep Space Network (Source URL: pending)
7. **"Martian dust storms can sometimes grow so massive that they blanket the entire planet in red dust for weeks at a time."**
   - Source: NASA Mars Exploration (Source URL: pending)
8. **"NASA rovers have special aluminum wheels with grooved treads designed to grip loose sand and roll over sharp Martian rocks."**
   - Source: NASA JPL Robotics (Source URL: pending)

---

## What Is Simulated (Game Adaptations)

To keep the game fun, accessible, and fast-paced for kids, certain mechanics are simplified:
- **Power Units:** A simplified 90-to-100 power point pool rather than complex kilowatt-hour load grids.
- **Damage Arithmetic:** Direct subtraction between storm severity index and shield percentage.
- **Comms Delay:** Scaled down from real interplanetary delays (about 1.3 seconds for the Moon and 4 to 24 minutes for Mars) to playable durations (Mars base delay: 20 seconds; Moon base delay: 2 seconds; scaled by 0.5× on Explorer, 1.0× on Commander, and 1.5× on Mission Control) so players experience transmission latency without excessive waiting.
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

- **Game Engine & Rendering:** Phaser 3.60.0 (Hardware-accelerated WebGL with Canvas fallback)
- **UI Framework:** React 18.2.0 with TypeScript 5.0.0
- **Build Tool:** Vite 4.4.0
- **Styling:** Tailwind CSS 3.3.0
- **State Management:** Zustand 4.4.0
- **Audio:** Web Audio API with procedural ambient music synthesis
- **Backend / Serverless:** Vercel Serverless Functions (`/api/donki` on Node.js runtime)

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
- **NASA Imagery:** NASA media is generally free to use with credit; some images may have restrictions. Credits are shown with every photo in the game and on the Data Sources page.
- **Optimization Note:** Original uncompressed high-resolution NASA master photos in `assets-originals/` are excluded from deployment via `.gitignore`. All deployed game assets in `public/assets/` are compressed and web-optimized, with **zero files exceeding 1 MB**.

---

## AI Tools Disclosure

AI coding assistants (Antigravity, Codex, Claude, Chatgpt) were used to assist with code drafting, refactoring, and documentation formatting. All architectural decisions, gameplay balance tuning, data verification, and testing were actively directed, implemented, and reviewed by the human team.

---

## Team

**The Primeagens**
- MD. Alvi Chowdhury
- Ishfak Mahbub Samin
- Saad Ahmed
- Syed Owin Efaz
