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
} from '../config/gameConfig'
import { getRandomFact } from '../data/facts'
import { rebalancePowerSplit, PowerSplit } from '../utils/powerRebalance'

export { BASE_X, BASE_Y }

export type DayPhase = 'morning' | 'daytime' | 'sunset' | 'ended'

export interface DayEndResult {
  day: number
  madeItHome: boolean
  distanceDriven: number
  batteryLeft: number
  batteryCapacity: number
  airBefore: number
  airAfter: number
  powerSplit: PowerSplit
  fact: string
}

interface GameState {
  // Rover & Controls
  battery: number // current battery units (0 to batteryCapacity)
  batteryCapacity: number // max battery capacity for today
  roverX: number
  roverY: number
  isDriving: boolean
  isPoweredOff: boolean
  isControlsLocked: boolean
  joystickDx: number // -1 to 1
  joystickDy: number // -1 to 1

  // Day & Mission
  day: number // 1 to TOTAL_DAYS
  maxDays: number
  timeLeft: number // seconds remaining today
  dayDuration: number
  dayPhase: DayPhase
  distanceDrivenToday: number // meters accumulated today
  dayEndResult: DayEndResult | null
  isMissionComplete: boolean

  // Power Planning (Stage 3)
  powerSplit: PowerSplit
  shieldToday: number // shield strength today (0-100)
  nextDayStartBatteryRatio: number // 1.0 (home safe) or 0.5 (stranded)

  // Base Survival Meters (Stage 3)
  air: number // 0-100
  airBeforeToday: number // snapshot at start of day
  isAirDepleted: boolean // true when air hits 0 (Mission Paused)

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
}

const initialCapacity =
  BASE_ROVER_CAPACITY + DEFAULT_POWER_SPLIT.rover * ROVER_CAPACITY_PER_POINT

export const useGameStore = create<GameState>((set, get) => ({
  battery: initialCapacity,
  batteryCapacity: initialCapacity,
  roverX: BASE_X,
  roverY: BASE_Y,
  isDriving: false,
  isPoweredOff: false,
  isControlsLocked: true, // Locked during morning screen
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
    const capacity =
      BASE_ROVER_CAPACITY + state.powerSplit.rover * ROVER_CAPACITY_PER_POINT
    const startBattery = capacity * state.nextDayStartBatteryRatio

    set({
      batteryCapacity: capacity,
      battery: startBattery,
      shieldToday: state.powerSplit.shield,
      airBeforeToday: state.air,
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
    // Timer only ticks while actively exploring in daytime or sunset
    if (state.dayPhase !== 'daytime' && state.dayPhase !== 'sunset') return
    if (state.isMissionComplete || state.isAirDepleted) return

    const newTime = Math.max(0, state.timeLeft - dt)

    if (newTime <= 0) {
      // Day is over! Calculate end status
      const dx = state.roverX - BASE_X
      const dy = state.roverY - BASE_Y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const madeItHome = dist <= BASE_SAFE_DISTANCE

      // Air calculation
      const airRefill = state.powerSplit.air * AIR_REFILL_MULTIPLIER
      const airBefore = state.air
      const airAfter = Math.max(0, Math.min(100, airBefore - AIR_DAILY_DROP + airRefill))
      const airDepleted = airAfter <= 0

      const result: DayEndResult = {
        day: state.day,
        madeItHome,
        distanceDriven: Math.round(state.distanceDrivenToday),
        batteryLeft: Math.round(state.battery),
        batteryCapacity: Math.round(state.batteryCapacity),
        airBefore: Math.round(airBefore),
        airAfter: Math.round(airAfter),
        powerSplit: { ...state.powerSplit },
        fact: getRandomFact(),
      }

      set({
        timeLeft: 0,
        dayPhase: 'ended',
        isControlsLocked: true,
        isDriving: false,
        air: airAfter,
        isAirDepleted: airDepleted,
        nextDayStartBatteryRatio: madeItHome ? 1.0 : 0.5,
        dayEndResult: result,
      })
      return
    }

    // Determine current phase
    let phase: DayPhase = 'daytime'
    if (newTime <= SUNSET_WARN_SEC) {
      phase = 'sunset'
    } else if (newTime >= state.dayDuration - MORNING_DURATION_SEC) {
      phase = 'daytime'
    }

    set({ timeLeft: newTime, dayPhase: phase })
  },

  startNextDay: () => {
    const state = get()
    if (state.isAirDepleted) return

    if (state.day >= state.maxDays) {
      // Mission finished after day 20
      set({
        isMissionComplete: true,
        dayEndResult: null,
        isControlsLocked: true,
        isDriving: false,
      })
      return
    }

    const nextDay = state.day + 1

    set({
      day: nextDay,
      timeLeft: state.dayDuration,
      dayPhase: 'morning', // Go to morning power screen first
      isControlsLocked: true,
      isDriving: false,
      isPoweredOff: false,
      distanceDrivenToday: 0,
      dayEndResult: null,
      roverX: BASE_X,
      roverY: BASE_Y,
      // Note: powerSplit is preserved from yesterday!
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
      air: INITIAL_AIR,
      airBeforeToday: INITIAL_AIR,
      powerSplit: { ...DEFAULT_POWER_SPLIT },
      shieldToday: DEFAULT_POWER_SPLIT.shield,
      nextDayStartBatteryRatio: 1.0,
      batteryCapacity: defaultCapacity,
      battery: defaultCapacity,
      roverX: BASE_X,
      roverY: BASE_Y,
    })

    window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
  },
}))
