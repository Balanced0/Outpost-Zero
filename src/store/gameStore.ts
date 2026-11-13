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
} from '../config/gameConfig'
import { getRandomFact } from '../data/facts'
import {
  getStormForDay,
  fetchMissionSpaceWeather,
  StormLevel,
  SpaceWeatherSource,
} from '../data/stormSource'
import { DonkiPayload } from '../utils/donkiProcessor'
import { rebalancePowerSplit, PowerSplit } from '../utils/powerRebalance'

export { BASE_X, BASE_Y }

export type DayPhase = 'morning' | 'daytime' | 'sunset' | 'ended'
export type StormState = 'idle' | 'warning' | 'active' | 'passed'

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
}

interface GameState {
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

  // Stage 5: NASA Space Weather Pipeline
  missionSpaceWeather: DonkiPayload | null
  isLoadingSpaceWeather: boolean
  spaceWeatherSource: SpaceWeatherSource

  // Actions
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
}

const initialCapacity =
  BASE_ROVER_CAPACITY + DEFAULT_POWER_SPLIT.rover * ROVER_CAPACITY_PER_POINT

export const useGameStore = create<GameState>((set, get) => {
  const initialStorm = getStormForDay(1)

  return {
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

    powerSplit: { ...DEFAULT_POWER_SPLIT },
    shieldToday: DEFAULT_POWER_SPLIT.shield,
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

    // Stage 5 State
    missionSpaceWeather: null,
    isLoadingSpaceWeather: true,
    spaceWeatherSource: 'saved',

    loadSpaceWeather: async () => {
      set({ isLoadingSpaceWeather: true })
      try {
        const payload = await fetchMissionSpaceWeather()
        const storm = getStormForDay(get().day, payload)
        set({
          missionSpaceWeather: payload,
          spaceWeatherSource: payload.source,
          stormLevelToday: storm.level,
          stormDateToday: storm.date,
          stormEventsToday: storm.events,
          isLoadingSpaceWeather: false,
        })
      } catch (err) {
        console.error('Error loading space weather:', err)
        const fallbackStorm = getStormForDay(get().day)
        set({
          spaceWeatherSource: 'saved',
          stormLevelToday: fallbackStorm.level,
          stormDateToday: fallbackStorm.date,
          stormEventsToday: fallbackStorm.events,
          isLoadingSpaceWeather: false,
        })
      }
    },

    setBattery: (v) =>
      set((state) => ({
        battery: Math.max(0, Math.min(state.batteryCapacity, v)),
      })),
    setRoverPos: (x, y) => set({ roverX: x, roverY: y }),
    setIsDriving: (v) => set({ isDriving: v }),
    setIsPoweredOff: (v) => set({ isPoweredOff: v }),
    setJoystick: (dx, dy) => set({ joystickDx: dx, joystickDy: dy }),

    setPowerAlloc: (key, value) => {
      const current = get().powerSplit
      const newSplit = rebalancePowerSplit(current, key, value)
      set({ powerSplit: newSplit })
    },

    startDrivingDay: () => {
      const state = get()

      const rawCapacity =
        BASE_ROVER_CAPACITY + state.powerSplit.rover * ROVER_CAPACITY_PER_POINT
      const penalty = state.roverStormPenaltyNextDay ? ROVER_STORM_PENALTY : 0
      const capacity = Math.max(20, rawCapacity - penalty)
      const startBattery = capacity * state.nextDayStartBatteryRatio

      let stormStartTime = -1
      let stormState: StormState = 'passed'

      if (state.stormLevelToday !== 'none') {
        const minRatio = STORM_START_MIN_RATIO
        const maxRatio = STORM_START_MAX_RATIO
        const randomFraction = minRatio + Math.random() * (maxRatio - minRatio)
        stormStartTime = state.dayDuration * (1 - randomFraction)
        stormState = 'idle'
      }

      set({
        batteryCapacity: capacity,
        battery: startBattery,
        shieldToday: state.powerSplit.shield,
        airBeforeToday: state.air,
        crewHealthBeforeToday: state.crewHealth,
        crewDamageToday: 0,
        roverPenaltyAppliedToday: state.roverStormPenaltyNextDay,
        roverStormPenaltyNextDay: false,
        roverCaughtExposedToday: false,
        whySentenceToday: '',
        stormStartTime,
        stormState,
        stormCountdown: STORM_WARNING_SEC,
        isRoverSheltered: true,
        dayPhase: 'daytime',
        isControlsLocked: false,
        isDriving: false,
        isPoweredOff: false,
      })
    },

    addDistanceDriven: (meters) =>
      set((state) => ({
        distanceDrivenToday: state.distanceDrivenToday + meters,
      })),

    tickDayTimer: (dt) => {
      const state = get()
      if (state.dayPhase !== 'daytime' && state.dayPhase !== 'sunset') return
      if (state.isMissionComplete || state.isAirDepleted || state.isCrewDepleted) return

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
          const damage = Math.round(
            Math.max(0, stormPower - state.shieldToday) * CREW_DAMAGE_MULTIPLIER
          )
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
        }

        set({
          timeLeft: 0,
          dayPhase: 'ended',
          isControlsLocked: true,
          isDriving: false,
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

      set({
        day: nextDay,
        timeLeft: state.dayDuration,
        dayPhase: 'morning',
        isControlsLocked: true,
        isDriving: false,
        isPoweredOff: false,
        distanceDrivenToday: 0,
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
      })

      window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
    },

    resetMission: () => {
      const defaultCapacity =
        BASE_ROVER_CAPACITY + DEFAULT_POWER_SPLIT.rover * ROVER_CAPACITY_PER_POINT

      set({
        day: 1,
        timeLeft: DAY_DURATION_SEC,
        dayPhase: 'morning',
        isControlsLocked: true,
        isDriving: false,
        isPoweredOff: false,
        distanceDrivenToday: 0,
        dayEndResult: null,
        isMissionComplete: false,
        isAirDepleted: false,
        isCrewDepleted: false,
        crewHealth: INITIAL_CREW_HEALTH,
        crewHealthBeforeToday: INITIAL_CREW_HEALTH,
        crewDamageToday: 0,
        air: INITIAL_AIR,
        airBeforeToday: INITIAL_AIR,
        powerSplit: { ...DEFAULT_POWER_SPLIT },
        shieldToday: DEFAULT_POWER_SPLIT.shield,
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
      })

      window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
      get().loadSpaceWeather()
    },
  }
})
