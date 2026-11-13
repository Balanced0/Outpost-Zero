# Outpost Zero: Game Plan

*Explore far. Stay alive. Nothing is free.*

A 2D open-world web game for kids ages 7 to 12, built for the NASA Space Apps Challenge. Players run a tiny Mars (or Moon) outpost, drive a rover, and balance power between survival and discovery. The dangers come from real NASA data.

---

## The Story

You are the **Mission Commander** of a tiny outpost on Mars (or the Moon). Two astronauts live inside the base. Outside, there's a little rover and a huge, empty world waiting to be explored.

Your job: **explore as much as you can, keep the astronauts alive, and remember that nothing is free.**

---

## Opening

A kid opens the website. No login, no download. A screen says **"Welcome, Mission Commander."** They type their name and pick where to go: **Moon** or **Mars**. Then they pick a difficulty:

| Mode | Who it's for | What changes |
|---|---|---|
| **Explorer** | Ages 7 to 9 | Fewer storms, and the game gives hints |
| **Commander** | Ages 10 to 12 | Normal storms, no hints |
| **Mission Control** | Older siblings and parents | Real storm data, longer comms delay, tighter power |

---

## Days 1 to 3: Learning the Ropes

A friendly helper character guides the kid.

- **Day 1:** "This is your power. Move the sliders."
- **Day 2:** "This is your rover. Drive it with the arrow keys, WASD, or the touch joystick."
- **Day 3:** "This is the space weather report. It tells you if danger is coming."

Next to every strange word there's a small **"Why?"** button.

- Tap **radiation**: *"Radiation is invisible energy from the Sun. Too much can make astronauts sick."*
- Tap **comms delay**: explains why messages to Mars take minutes to arrive.

---

## Days 4 to 20: The Real Game

Each day takes about **90 seconds** of real play.

### Morning (about 10 seconds)

1. Check the space weather. It comes from real NASA data, like checking if it's going to rain.
2. Split your power with three sliders:
   - **Air machine:** so the astronauts can breathe
   - **Shield:** so radiation can't hurt them
   - **Rover:** so it can explore

You only have a fixed amount of power, like a phone battery that has to last the whole day. Give more to one, and the others get less.

### Daytime (about 70 seconds)

You explore the open world. Drive the rover freely across a big 2D surface.

- Dust kicks up behind the wheels.
- Shadows move as the sun crosses the sky.
- You can see craters, rocks, ice patches, and your base far in the distance.
- The rover battery drains as you drive, and the sun is slowly setting.
- The farther you go, the better the discoveries, but the harder it is to get home in time.

### Things Happen Live

| Day | Event |
|---|---|
| **Day 6** | The rover finds ice. Everyone cheers, and the kid sees a real photo from Mars. |
| **Day 9** | A solar storm alert pops up with a countdown. The rover is far from home and the shield is low. Race back, or finish the discovery and gamble? |
| **Day 12** | A dust storm blocks the sunlight, so there's less power for everything. |
| **Day 15** | You call Earth for advice, but the answer takes minutes to arrive. By then you've already decided, just like real mission teams. |

### Sunset (end of the day)

The day ends whether the rover made it home or not.

### Result Card

Shows what happened and why, plus one real NASA fact, like:

> *"Real astronauts on the space station wear special vests to protect them from radiation."*

---

## Why Every Choice Costs Something

- Drive far, find cool stuff, but risk the battery and the sunset.
- Keep power at home, stay safe, but discover nothing.
- Skip the shield to explore more, and a storm can hurt the crew.
- Skimp on air to save power, and it runs short a few days later.

**There is no safe choice. That's the real lesson.**

---

## The Ending

The mission lasts about **20 days**.

- **Win:** You reach the discovery goal and the astronauts are safe. You get **1 to 3 stars**, based on how many discoveries you made and how healthy the crew stayed.
- **Lose:** The air runs out or the crew gets too much radiation. There is no scary "GAME OVER." It says: *"Mission paused. Here's what happened and what real NASA planners would do differently."* Kids learn from it and want to try again.

---

## After the Ending

The kid sees a **debrief**: a short replay of their choices, their biggest mistake, and their smartest move. Then three buttons:

- **Play again**
- **Try a harder mode**
- **Switch to the other planet**

Storms, dust, and discoveries change every time, so no two missions are the same. Kids try new strategies and learn from them.

---

## Data Sources Page

One screen lists which real NASA data the game used and whether each piece was **live** or **saved**. Judges can check it quickly.

| Data | Used for |
|---|---|
| **DONKI** (space weather) | Daily radiation risk and storm events |
| **OSDR** (astronaut research) | One real science fact on each result card |
| **Mars rover photos** | Reward image when something is discovered |

If a live call fails, the game falls back to saved NASA data and labels it clearly as saved.

---

## Tech Stack

- **Frontend:** React + TypeScript (menus, sliders, mission log, "Why?" buttons), Phaser 3 (open world, rover, camera), Tailwind (HUD and gauges)
- **Art:** Kenney "Sci-Fi RTS" pack (CC0) in `public/assets/kenney/`. Missing art is drawn with simple Phaser shapes.
- **Backend:** Vercel serverless function (`/api/donki`) that fetches NASA data, hides the API key, and falls back to saved JSON
- **State:** Zustand (shared between React and Phaser)
- **Deployment:** Vercel

---

## Build Stages

1. Rover drives around a scrolling map with a battery
2. Day timer, sunset, and result card
3. Base screen with the three power sliders sharing one budget
4. Storm event with countdown, shield damage, and crew health
5. `/api/donki` function with loading skeleton and saved fallback
6. Discoveries with real NASA photos, plus "Why?" buttons
7. Menu, tutorial days, debrief screen, Data Sources page