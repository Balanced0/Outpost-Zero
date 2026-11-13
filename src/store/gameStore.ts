import { create } from 'zustand'
import {
  BASE_X,
  BASE_Y,
  BASE_SAFE_DISTANCE,
  TOTAL_DAYS,
  DAY_DURATION_SEC,
  SUNSET_WARN_SEC,
  MORNING_DURATION_SEC,
  DEFAULT_POWER_SPLIT,
  BASE_ROVER_CAPACITY,
  ROVER_CAPACITY_PER_POINT,
  INITIAL_AIR,
  AIR_DAILY_DROP,
  AIR_REFILL_MULTIPLIER,
  INITIAL_CREW_HEALTH,
  CREW_DAMAGE_MULTIPLIER,
  CREW_HEAL_NO_STORM,
  STORM_STRENGTHS,
  STORM_START_MIN_RATIO,
  STORM_START_MAX_RATIO,
  STORM_WARNING_SEC,
  STORM_DURATION_SEC,
  ROVER_STORM_PENALTY,
  DiscoveryType,
  SCAN_DURATION_SEC,
  SCAN_PROXIMITY_RADIUS,
  CALL_EARTH_BATTERY_COST,
} from '../config/gameConfig'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'
import { getRandomFact } from '../data/facts'
import {
  getStormForDay,
  fetchMissionSpaceWeather,
  StormLevel,
  SpaceWeatherSource,
} from '../data/stormSource'
import { DonkiPayload } from '../utils/donkiProcessor'
import { rebalancePowerSplit, getDefaultPowerSplit, PowerSplit } from '../utils/powerRebalance'
import { generateDiscoverySpots, DiscoverySpot } from '../data/discoverySpots'
import { selectPhotoForDiscovery, resetPhotoHistory, MarsPhoto } from '../utils/photoSelector'

export { BASE_X, BASE_Y }

export type DayPhase = 'morning' | 'daytime' | 'sunset' | 'ended'
export type StormState = 'idle' | 'warning' | 'active' | 'passed'
export type TutorialStep = 'day1_sliders' | 'day2_driving' | 'day3_storm' | null
export type CallEarthState = 'idle' | 'calling' | 'received'

const STORAGE_KEY = 'outpost_zero_save_settings'

export interface SavedSettings {
  commanderName?: string
  planet?: PlanetId
  difficulty?: DifficultyId
  skipTutorial?: boolean
}

export function loadSavedSettings(): SavedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn('Unable to read localStorage:', err)
  }
  return {}
}

export function saveSettings(settings: SavedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.warn('Unable to save to localStorage:', err)
  }
}

export interface ActiveScan {
  spotId: string
  type: DiscoveryType
  elapsed: number
  duration: number
}

export interface ActiveDiscovery {
  spot: DiscoverySpot
  photo: MarsPhoto | null
}

export interface DayEndResult {
  day: number
  madeItHome: boolean
  distanceDriven: number
  batteryLeft: number
  batteryCapacity: number
  airBefore: number
  airAfter: number
  powerSplit: PowerSplit
  stormLevel: StormLevel
  stormDate: string
  stormEvents: string[]
  spaceWeatherSource: SpaceWeatherSource
  shieldStrength: number
  crewHealthBefore: number
  crewHealthAfter: number
  crewDamage: number
  roverSheltered: boolean | null
  roverStormPenaltyApplied: boolean
  whySentence: string
  fact: string
  // Stage 6 Discoveries
  discoveriesToday: number
  pointsToday: number
  totalPoints: number
}

interface GameState {
  // Stage 7A: Start Menu & Planet / Difficulty Mode
  isGameStarted: boolean
  commanderName: string
  planet: PlanetId
  difficulty: DifficultyId
  skipTutorial: boolean
  powerBudget: number

  // Rover & Controls
  battery: number
  batteryCapacity: number
  roverX: number
  roverY: number
  isDriving: boolean
  isPoweredOff: boolean
  isControlsLocked: boolean
  joystickDx: number
  joystickDy: number

  // Day & Mission
  day: number
  maxDays: number
  timeLeft: number
  dayDuration: number
  dayPhase: DayPhase
  distanceDrivenToday: number
  dayEndResult: DayEndResult | null
  isMissionComplete: boolean

  // Power Planning
  powerSplit: PowerSplit
  shieldToday: number
  nextDayStartBatteryRatio: number

  // Base Survival Meters
  air: number
  airBeforeToday: number
  isAirDepleted: boolean

  // Crew Health & Storms
  crewHealth: number
  crewHealthBeforeToday: number
  crewDamageToday: number
  isCrewDepleted: boolean
  stormLevelToday: StormLevel
  stormDateToday: string
  stormEventsToday: string[]
  stormState: StormState
  stormStartTime: number
  stormCountdown: number
  isRoverSheltered: boolean
  roverCaughtExposedToday: boolean
  roverStormPenaltyNextDay: boolean
  roverPenaltyAppliedToday: boolean
  whySentenceToday: string

  // Space Weather Pipeline
  missionSpaceWeather: DonkiPayload | null
  isLoadingSpaceWeather: boolean
  spaceWeatherSource: SpaceWeatherSource

  // Stage 6: Discoveries & Scanning
  discoverySpots: DiscoverySpot[]
  totalDiscoveryPoints: number
  discoveryPointsToday: number
  discoveriesFoundToday: number
  nearbySpot: DiscoverySpot | null
  activeScan: ActiveScan | null
  scanError: string | null
  activeDiscovery: ActiveDiscovery | null

  // Stage 7A: Tutorial (Days 1 to 3)
  tutorialStep: TutorialStep
  hasMovedSliderDay1: boolean

  // Stage 7A: Call Earth (Comms Delay)
  callEarthState: CallEarthState
  callEarthCountdown: number
  callEarthDelayTotal: number
  callEarthMessage: string | null

  // Actions
  launchMission: (settings: {
    commanderName: string
    planet: PlanetId
    difficulty: DifficultyId
    skipTutorial: boolean
  }) => void
  returnToMenu: () => void
  dismissTutorial: () => void

  startCallEarth: () => void
  dismissCallEarthReply: () => void

  setBattery: (v: number) => void
  setRoverPos: (x: number, y: number) => void
  setIsDriving: (v: boolean) => void
  setIsPoweredOff: (v: boolean) => void
  setJoystick: (dx: number, dy: number) => void
  setPowerAlloc: (key: keyof PowerSplit, value: number) => void
  startDrivingDay: () => void
  tickDayTimer: (dt: number) => void
  addDistanceDriven: (meters: number) => void
  startNextDay: () => void
  resetMission: () => void
  loadSpaceWeather: () => Promise<void>

  // Discovery Actions
  setNearbySpot: (spot: DiscoverySpot | null) => void
  startScan: () => void
  cancelScan: () => void
  tickScan: (dt: number) => void
  closeDiscoveryPopup: () => void
}

const saved = loadSavedSettings()
const initialPlanet: PlanetId = saved.planet || 'mars'
const initialDifficulty: DifficultyId = saved.difficulty || 'commander'
const initialCommanderName: string = saved.commanderName || 'Commander'
const initialSkipTutorial: boolean = saved.skipTutorial ?? false
const initialBudget = DIFFICULTIES[initialDifficulty].powerBudget
const initialSplit = getDefaultPowerSplit(initialBudget)
const initialCapacity =
  BASE_ROVER_CAPACITY + initialSplit.rover * ROVER_CAPACITY_PER_POINT

export const useGameStore = create<GameState>((set, get) => {
  const initialStorm = getStormForDay(1)
  const initialSpots = generateDiscoverySpots(42)

  return {
    // Menu & Configuration
    isGameStarted: false,
    commanderName: initialCommanderName,
    planet: initialPlanet,
    difficulty: initialDifficulty,
    skipTutorial: initialSkipTutorial,
    powerBudget: initialBudget,

    // Rover & Controls
    battery: initialCapacity,
    batteryCapacity: initialCapacity,
    roverX: BASE_X,
    roverY: BASE_Y,
    isDriving: false,
    isPoweredOff: false,
    isControlsLocked: true,
    joystickDx: 0,
    joystickDy: 0,

    day: 1,
    maxDays: TOTAL_DAYS,
    timeLeft: DAY_DURATION_SEC,
    dayDuration: DAY_DURATION_SEC,
    dayPhase: 'morning',
    distanceDrivenToday: 0,
    dayEndResult: null,
    isMissionComplete: false,

    powerSplit: { ...initialSplit },
    shieldToday: initialSplit.shield,
    nextDayStartBatteryRatio: 1.0,

    air: INITIAL_AIR,
    airBeforeToday: INITIAL_AIR,
    isAirDepleted: false,

    crewHealth: INITIAL_CREW_HEALTH,
    crewHealthBeforeToday: INITIAL_CREW_HEALTH,
    crewDamageToday: 0,
    isCrewDepleted: false,
    stormLevelToday: initialStorm.level,
    stormDateToday: initialStorm.date,
    stormEventsToday: initialStorm.events,
    stormState: 'idle',
    stormStartTime: -1,
    stormCountdown: STORM_WARNING_SEC,
    isRoverSheltered: true,
    roverCaughtExposedToday: false,
    roverStormPenaltyNextDay: false,
    roverPenaltyAppliedToday: false,
    whySentenceToday: '',

    missionSpaceWeather: null,
    isLoadingSpaceWeather: false,
    spaceWeatherSource: 'simulated',

    // Stage 6 Discoveries
    discoverySpots: initialSpots,
    totalDiscoveryPoints: 0,
    discoveryPointsToday: 0,
    discoveriesFoundToday: 0,
    nearbySpot: null,
    activeScan: null,
    scanError: null,
    activeDiscovery: null,

    // Stage 7A: Tutorial & Comms
    tutorialStep: null,
    hasMovedSliderDay1: false,
    callEarthState: 'idle',
    callEarthCountdown: 0,
    callEarthDelayTotal: 0,
    callEarthMessage: null,

    // Launch mission from start menu
    launchMission: ({ commanderName, planet, difficulty, skipTutorial }) => {
      saveSettings({ commanderName, planet, difficulty, skipTutorial })
      const diffConfig = DIFFICULTIES[difficulty]
      const powerBudget = diffConfig.powerBudget
      const split = getDefaultPowerSplit(powerBudget)
      const cap = BASE_ROVER_CAPACITY + split.rover * ROVER_CAPACITY_PER_POINT
      const tutStep: TutorialStep = skipTutorial ? null : 'day1_sliders'

      set({
        isGameStarted: true,
        commanderName: commanderName.trim() || 'Commander',
        planet,
        difficulty,
        skipTutorial,
        powerBudget,
        powerSplit: split,
        shieldToday: split.shield,
        battery: cap,
        batteryCapacity: cap,
        day: 1,
        timeLeft: DAY_DURATION_SEC,
        dayPhase: 'morning',
        isControlsLocked: true,
        tutorialStep: tutStep,
        hasMovedSliderDay1: false,
        callEarthState: 'idle',
        callEarthCountdown: 0,
        callEarthMessage: null,
        totalDiscoveryPoints: 0,
        discoveryPointsToday: 0,
        discoveriesFoundToday: 0,
        isMissionComplete: false,
        isAirDepleted: false,
        isCrewDepleted: false,
        air: INITIAL_AIR,
        airBeforeToday: INITIAL_AIR,
        crewHealth: INITIAL_CREW_HEALTH,
        crewHealthBeforeToday: INITIAL_CREW_HEALTH,
        crewDamageToday: 0,
        roverStormPenaltyNextDay: false,
        roverPenaltyAppliedToday: false,
      })

      // Notify Phaser scene about planet selection
      window.dispatchEvent(new CustomEvent('planet-changed', { detail: { planet } }))
      window.dispatchEvent(new CustomEvent('reset-rover-to-base'))

      // Fetch space weather from NASA DONKI
      get().loadSpaceWeather()
    },

    returnToMenu: () => {
      set({
        isGameStarted: false,
        dayPhase: 'morning',
        isControlsLocked: true,
        callEarthState: 'idle',
        callEarthMessage: null,
        activeDiscovery: null,
        activeScan: null,
        tutorialStep: null,
      })
    },

    dismissTutorial: () => {
      set({
        tutorialStep: null,
        isControlsLocked: false,
      })
    },

    startCallEarth: () => {
      const state = get()
      if (state.dayPhase !== 'daytime' && state.dayPhase !== 'sunset') return
      if (state.callEarthState === 'calling') return
      if (state.battery < CALL_EARTH_BATTERY_COST) return

      const planetConfig = PLANETS[state.planet]
      const diffConfig = DIFFICULTIES[state.difficulty]
      const delay = Math.max(
        1,
        Math.round(planetConfig.gameDelaySec * diffConfig.commsDelayMultiplier)
      )

      set({
        battery: Math.max(0, state.battery - CALL_EARTH_BATTERY_COST),
        callEarthState: 'calling',
        callEarthCountdown: delay,
        callEarthDelayTotal: delay,
      })
    },

    dismissCallEarthReply: () => {
      set({
        callEarthState: 'idle',
        callEarthMessage: null,
      })
    },

    loadSpaceWeather: async () => {
      set({ isLoadingSpaceWeather: true })
      try {
        const payload = await fetchMissionSpaceWeather()
        const day1Storm = getStormForDay(1, payload)
        set({
          missionSpaceWeather: payload,
          spaceWeatherSource: payload.source,
          stormLevelToday: day1Storm.level,
          stormDateToday: day1Storm.date,
          stormEventsToday: day1Storm.events,
          isLoadingSpaceWeather: false,
        })
      } catch (err) {
        console.warn('Fallback to local space weather profile:', err)
        const day1Storm = getStormForDay(1)
        set({
          spaceWeatherSource: 'simulated',
          stormLevelToday: day1Storm.level,
          stormDateToday: day1Storm.date,
          stormEventsToday: day1Storm.events,
          isLoadingSpaceWeather: false,
        })
      }
    },

    setBattery: (v) => set({ battery: v }),
    setRoverPos: (x, y) => set({ roverX: x, roverY: y }),
    setIsDriving: (v) => set({ isDriving: v }),
    setIsPoweredOff: (v) => set({ isPoweredOff: v }),
    setJoystick: (dx, dy) => set({ joystickDx: dx, joystickDy: dy }),

    setNearbySpot: (spot) => set({ nearbySpot: spot }),

    startScan: () => {
      const state = get()
      const spot = state.nearbySpot
      if (!spot || spot.collected || state.activeScan) return

      if (state.battery < spot.batteryCost) {
        set({ scanError: 'Not enough battery to scan' })
        setTimeout(() => {
          if (get().scanError) set({ scanError: null })
        }, 3000)
        return
      }

      set({
        scanError: null,
        activeScan: {
          spotId: spot.id,
          type: spot.type,
          elapsed: 0,
          duration: SCAN_DURATION_SEC,
        },
      })
    },

    cancelScan: () => {
      if (get().activeScan) {
        set({ activeScan: null })
      }
    },

    tickScan: (dt) => {
      const state = get()
      if (!state.activeScan) return

      // Moving cancels the scan!
      if (state.isDriving) {
        set({ activeScan: null })
        return
      }

      // Check proximity
      const spot = state.discoverySpots.find((s) => s.id === state.activeScan?.spotId)
      if (!spot || spot.collected) {
        set({ activeScan: null })
        return
      }

      const dx = state.roverX - spot.x
      const dy = state.roverY - spot.y
      if (Math.sqrt(dx * dx + dy * dy) > SCAN_PROXIMITY_RADIUS + 10) {
        set({ activeScan: null })
        return
      }

      const newElapsed = state.activeScan.elapsed + dt

      if (newElapsed >= state.activeScan.duration) {
        // Scan succeeded!
        const newBattery = Math.max(0, state.battery - spot.batteryCost)
        const updatedSpots = state.discoverySpots.map((s) =>
          s.id === spot.id ? { ...s, collected: true } : s
        )

        const photo = selectPhotoForDiscovery(spot.type)

        set({
          battery: newBattery,
          discoverySpots: updatedSpots,
          totalDiscoveryPoints: state.totalDiscoveryPoints + spot.points,
          discoveryPointsToday: state.discoveryPointsToday + spot.points,
          discoveriesFoundToday: state.discoveriesFoundToday + 1,
          activeScan: null,
          activeDiscovery: {
            spot,
            photo,
          },
          isControlsLocked: true, // Freeze rover while popup is open
        })

        // Notify Phaser scene to remove collected spot
        window.dispatchEvent(
          new CustomEvent('discovery-collected', { detail: { id: spot.id } })
        )
      } else {
        set({
          activeScan: {
            ...state.activeScan,
            elapsed: newElapsed,
          },
        })
      }
    },

    closeDiscoveryPopup: () => {
      set({
        activeDiscovery: null,
        isControlsLocked: false,
      })
    },

    setPowerAlloc: (key, value) => {
      const state = get()
      if (state.dayPhase !== 'morning') return

      const updated = rebalancePowerSplit(state.powerSplit, key, value, state.powerBudget)
      const rawCap = BASE_ROVER_CAPACITY + updated.rover * ROVER_CAPACITY_PER_POINT
      const finalCap = Math.max(
        20,
        Math.round(rawCap - (state.roverStormPenaltyNextDay ? ROVER_STORM_PENALTY : 0))
      )

      set({
        powerSplit: updated,
        shieldToday: updated.shield,
        batteryCapacity: finalCap,
        battery: Math.min(state.battery, finalCap),
        hasMovedSliderDay1: true,
      })
    },

    startDrivingDay: () => {
      const state = get()
      if (state.isAirDepleted || state.isCrewDepleted) return

      let stormStartTime = -1
      if (state.stormLevelToday !== 'none') {
        const stormRatio =
          STORM_START_MIN_RATIO +
          Math.random() * (STORM_START_MAX_RATIO - STORM_START_MIN_RATIO)
        stormStartTime = state.dayDuration * (1 - stormRatio)
      }

      // Check Day 2 tutorial (driving intro)
      const day2Tut: TutorialStep =
        !state.skipTutorial && state.day === 2 ? 'day2_driving' : null

      set({
        dayPhase: 'daytime',
        isControlsLocked: day2Tut !== null,
        tutorialStep: day2Tut,
        stormStartTime,
        stormState: 'idle',
        stormCountdown: STORM_WARNING_SEC,
        isRoverSheltered: true,
        roverCaughtExposedToday: false,
      })
    },

    addDistanceDriven: (meters) => {
      set((state) => ({
        distanceDrivenToday: state.distanceDrivenToday + meters,
      }))
    },

    tickDayTimer: (dt) => {
      const state = get()
      // Pause day timer while discovery celebration popup or tutorial modal is open
      if (state.activeDiscovery !== null || state.tutorialStep === 'day2_driving') return
      if (state.dayPhase !== 'daytime' && state.dayPhase !== 'sunset') return
      if (state.isMissionComplete || state.isAirDepleted || state.isCrewDepleted) return

      // --- Call Earth Comms Delay update ---
      let nextCallState = state.callEarthState
      let nextCallCountdown = state.callEarthCountdown
      let nextCallMessage = state.callEarthMessage

      if (state.callEarthState === 'calling') {
        nextCallCountdown = Math.max(0, nextCallCountdown - dt)
        if (nextCallCountdown <= 0) {
          nextCallState = 'received'

          // Generate response using existing game data
          const uncollected = state.discoverySpots.filter((s) => !s.collected)
          let nearestDesc = 'no uncollected spots remain'
          if (uncollected.length > 0) {
            let nearest = uncollected[0]
            let minD = Infinity
            for (const s of uncollected) {
              const d = Math.hypot(s.x - state.roverX, s.y - state.roverY)
              if (d < minD) {
                minD = d
                nearest = s
              }
            }
            const angle = Math.atan2(nearest.y - state.roverY, nearest.x - state.roverX) * (180 / Math.PI)
            const octants = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east']
            const idx = Math.round(((angle + 360) % 360) / 45) % 8
            const dir = octants[idx]
            const typeLabel =
              nearest.type === 'rock'
                ? 'rock sample'
                : nearest.type === 'riverbed'
                ? 'ancient riverbed'
                : 'ice deposit'
            nearestDesc = `${typeLabel} is about ${Math.round(minD)} m to your ${dir}`
          }

          let stormAdvice = ''
          if (state.stormLevelToday === 'none') {
            stormAdvice = 'The Sun is calm today. Safe to explore!'
          } else if (state.stormState === 'active' || state.stormState === 'passed') {
            stormAdvice = '⚠️ Storm already started! This advice is late — you cannot wait for Earth!'
          } else if (state.stormStartTime > 0) {
            const timeUntil = Math.max(0, Math.ceil(state.timeLeft - state.stormStartTime))
            if (timeUntil <= 0) {
              stormAdvice = '⚠️ Storm already started! This advice is late — you cannot wait for Earth!'
            } else {
              stormAdvice = `A ${state.stormLevelToday} radiation burst arrives about ${timeUntil} seconds from now. Head toward base!`
            }
          } else {
            stormAdvice = `Space weather forecast: ${state.stormLevelToday} storm expected today.`
          }

          nextCallMessage = `Mission Control: ${stormAdvice} The nearest ${nearestDesc}.`
        }
      }

      const newTime = Math.max(0, state.timeLeft - dt)

      let nextStormState = state.stormState
      let nextCountdown = state.stormCountdown
      let nextCrewHealth = state.crewHealth
      let nextCrewDamage = state.crewDamageToday
      let nextRoverCaughtExposed = state.roverCaughtExposedToday
      let nextRoverPenaltyNextDay = state.roverStormPenaltyNextDay
      let nextWhySentence = state.whySentenceToday
      let isDepleted: boolean = state.isCrewDepleted

      if (state.stormLevelToday !== 'none' && state.stormStartTime > 0) {
        const warnStart = state.stormStartTime + STORM_WARNING_SEC
        const stormEnd = state.stormStartTime - STORM_DURATION_SEC

        if (newTime <= warnStart && newTime > state.stormStartTime) {
          nextStormState = 'warning'
          nextCountdown = Math.max(
            1,
            Math.min(STORM_WARNING_SEC, Math.ceil(newTime - state.stormStartTime))
          )
        } else if (newTime <= state.stormStartTime && newTime > stormEnd) {
          nextStormState = 'active'
        } else if (newTime <= stormEnd && state.stormState === 'active') {
          nextStormState = 'passed'

          const dx = state.roverX - BASE_X
          const dy = state.roverY - BASE_Y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const sheltered = dist <= BASE_SAFE_DISTANCE

          nextRoverCaughtExposed = !sheltered
          if (!sheltered) {
            nextRoverPenaltyNextDay = true
          }

          const stormPower = STORM_STRENGTHS[state.stormLevelToday]
          const diffConfig = DIFFICULTIES[state.difficulty]
          const rawDamage = Math.max(0, stormPower - state.shieldToday)
          const damage = Math.round(rawDamage * CREW_DAMAGE_MULTIPLIER * diffConfig.stormDamageMultiplier)

          nextCrewDamage = damage
          nextCrewHealth = Math.max(0, state.crewHealth - damage)
          if (nextCrewHealth <= 0) {
            isDepleted = true
          }

          if (damage > 0) {
            nextWhySentence = `You had ${state.shieldToday} shield but the storm was ${stormPower}, so the crew took ${damage} damage.`
          } else {
            nextWhySentence = `Your ${state.shieldToday} shield held strong and blocked all radiation!`
          }
        }
      }

      const dx = state.roverX - BASE_X
      const dy = state.roverY - BASE_Y
      const isSheltered = Math.sqrt(dx * dx + dy * dy) <= BASE_SAFE_DISTANCE

      if (newTime <= 0) {
        const madeItHome = isSheltered

        const airRefill = state.powerSplit.air * AIR_REFILL_MULTIPLIER
        const airBefore = state.air
        const airAfter = Math.max(0, Math.min(100, airBefore - AIR_DAILY_DROP + airRefill))
        const airDepleted = airAfter <= 0

        let finalCrewHealth = nextCrewHealth
        let finalWhy = nextWhySentence

        if (state.stormLevelToday === 'none') {
          finalCrewHealth = Math.min(INITIAL_CREW_HEALTH, nextCrewHealth + CREW_HEAL_NO_STORM)
          finalWhy = 'A quiet day. The crew healed a little (+5 health).'
        }

        const result: DayEndResult = {
          day: state.day,
          madeItHome,
          distanceDriven: Math.round(state.distanceDrivenToday),
          batteryLeft: Math.round(state.battery),
          batteryCapacity: Math.round(state.batteryCapacity),
          airBefore: Math.round(airBefore),
          airAfter: Math.round(airAfter),
          powerSplit: { ...state.powerSplit },
          stormLevel: state.stormLevelToday,
          stormDate: state.stormDateToday,
          stormEvents: state.stormEventsToday,
          spaceWeatherSource: state.spaceWeatherSource,
          shieldStrength: state.shieldToday,
          crewHealthBefore: Math.round(state.crewHealthBeforeToday),
          crewHealthAfter: Math.round(finalCrewHealth),
          crewDamage: nextCrewDamage,
          roverSheltered: state.stormLevelToday === 'none' ? null : !nextRoverCaughtExposed,
          roverStormPenaltyApplied: state.roverPenaltyAppliedToday,
          whySentence: finalWhy,
          fact: getRandomFact(),
          // Discoveries today
          discoveriesToday: state.discoveriesFoundToday,
          pointsToday: state.discoveryPointsToday,
          totalPoints: state.totalDiscoveryPoints,
        }

        set({
          timeLeft: 0,
          dayPhase: 'ended',
          isControlsLocked: true,
          isDriving: false,
          activeScan: null,
          callEarthState: 'idle',
          callEarthMessage: null,
          air: airAfter,
          isAirDepleted: airDepleted,
          crewHealth: finalCrewHealth,
          isCrewDepleted: isDepleted || finalCrewHealth <= 0,
          roverStormPenaltyNextDay: nextRoverPenaltyNextDay,
          nextDayStartBatteryRatio: madeItHome ? 1.0 : 0.5,
          dayEndResult: result,
          stormState: 'passed',
        })
        return
      }

      let phase: DayPhase = 'daytime'
      if (newTime <= SUNSET_WARN_SEC) {
        phase = 'sunset'
      } else if (newTime >= state.dayDuration - MORNING_DURATION_SEC) {
        phase = 'daytime'
      }

      set({
        timeLeft: newTime,
        dayPhase: phase,
        stormState: nextStormState,
        stormCountdown: nextCountdown,
        crewHealth: nextCrewHealth,
        crewDamageToday: nextCrewDamage,
        roverCaughtExposedToday: nextRoverCaughtExposed,
        roverStormPenaltyNextDay: nextRoverPenaltyNextDay,
        whySentenceToday: nextWhySentence,
        isCrewDepleted: isDepleted,
        isRoverSheltered: isSheltered,
        callEarthState: nextCallState,
        callEarthCountdown: nextCallCountdown,
        callEarthMessage: nextCallMessage,
      })
    },

    startNextDay: () => {
      const state = get()
      if (state.isAirDepleted || state.isCrewDepleted) return

      if (state.day >= state.maxDays) {
        set({
          isMissionComplete: true,
          dayEndResult: null,
          isControlsLocked: true,
          isDriving: false,
        })
        return
      }

      const nextDay = state.day + 1
      const nextStorm = getStormForDay(nextDay, state.missionSpaceWeather)
      const tutStep: TutorialStep =
        !state.skipTutorial && nextDay === 3 ? 'day3_storm' : null

      set({
        day: nextDay,
        timeLeft: state.dayDuration,
        dayPhase: 'morning',
        isControlsLocked: true,
        isDriving: false,
        isPoweredOff: false,
        distanceDrivenToday: 0,
        discoveryPointsToday: 0,
        discoveriesFoundToday: 0,
        dayEndResult: null,
        roverX: BASE_X,
        roverY: BASE_Y,
        stormLevelToday: nextStorm.level,
        stormDateToday: nextStorm.date,
        stormEventsToday: nextStorm.events,
        stormState: 'idle',
        stormStartTime: -1,
        stormCountdown: STORM_WARNING_SEC,
        isRoverSheltered: true,
        roverCaughtExposedToday: false,
        whySentenceToday: '',
        activeScan: null,
        scanError: null,
        activeDiscovery: null,
        tutorialStep: tutStep,
        callEarthState: 'idle',
        callEarthCountdown: 0,
        callEarthMessage: null,
      })

      window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
    },

    resetMission: () => {
      resetPhotoHistory()
      const newSpots = generateDiscoverySpots()
      const state = get()
      const split = getDefaultPowerSplit(state.powerBudget)
      const defaultCapacity =
        BASE_ROVER_CAPACITY + split.rover * ROVER_CAPACITY_PER_POINT

      set({
        isGameStarted: false,
        day: 1,
        timeLeft: DAY_DURATION_SEC,
        dayPhase: 'morning',
        isControlsLocked: true,
        isDriving: false,
        isPoweredOff: false,
        distanceDrivenToday: 0,
        totalDiscoveryPoints: 0,
        discoveryPointsToday: 0,
        discoveriesFoundToday: 0,
        discoverySpots: newSpots,
        nearbySpot: null,
        activeScan: null,
        scanError: null,
        activeDiscovery: null,
        dayEndResult: null,
        isMissionComplete: false,
        isAirDepleted: false,
        isCrewDepleted: false,
        crewHealth: INITIAL_CREW_HEALTH,
        crewHealthBeforeToday: INITIAL_CREW_HEALTH,
        crewDamageToday: 0,
        air: INITIAL_AIR,
        airBeforeToday: INITIAL_AIR,
        powerSplit: { ...split },
        shieldToday: split.shield,
        nextDayStartBatteryRatio: 1.0,
        batteryCapacity: defaultCapacity,
        battery: defaultCapacity,
        roverX: BASE_X,
        roverY: BASE_Y,
        stormState: 'idle',
        stormStartTime: -1,
        stormCountdown: STORM_WARNING_SEC,
        isRoverSheltered: true,
        roverCaughtExposedToday: false,
        roverStormPenaltyNextDay: false,
        roverPenaltyAppliedToday: false,
        whySentenceToday: '',
        tutorialStep: null,
        hasMovedSliderDay1: false,
        callEarthState: 'idle',
        callEarthCountdown: 0,
        callEarthMessage: null,
      })

      window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
    },
  }
})
