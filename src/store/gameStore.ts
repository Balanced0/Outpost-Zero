import { create } from 'zustand'
import {
  BASE_X,
  BASE_Y,
  BASE_SAFE_DISTANCE,
  TOTAL_DAYS,
  DAY_DURATION_SEC,
  SUNSET_WARN_SEC,
  MORNING_DURATION_SEC,
} from '../config/gameConfig'
import { getRandomFact } from '../data/facts'

export { BASE_X, BASE_Y }

export type DayPhase = 'morning' | 'daytime' | 'sunset' | 'ended'

export interface DayEndResult {
  day: number
  madeItHome: boolean
  distanceDriven: number
  batteryLeft: number
  fact: string
}

interface GameState {
  // Rover & Controls
  battery: number // 0-100
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

  // Actions
  setBattery: (v: number) => void
  setRoverPos: (x: number, y: number) => void
  setIsDriving: (v: boolean) => void
  setIsPoweredOff: (v: boolean) => void
  setJoystick: (dx: number, dy: number) => void
  tickDayTimer: (dt: number) => void
  addDistanceDriven: (meters: number) => void
  startNextDay: () => void
  resetMission: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  battery: 100,
  roverX: BASE_X,
  roverY: BASE_Y,
  isDriving: false,
  isPoweredOff: false,
  isControlsLocked: false,
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

  setBattery: (v) => set({ battery: Math.max(0, Math.min(100, v)) }),
  setRoverPos: (x, y) => set({ roverX: x, roverY: y }),
  setIsDriving: (v) => set({ isDriving: v }),
  setIsPoweredOff: (v) => set({ isPoweredOff: v }),
  setJoystick: (dx, dy) => set({ joystickDx: dx, joystickDy: dy }),

  addDistanceDriven: (meters) =>
    set((state) => ({
      distanceDrivenToday: state.distanceDrivenToday + meters,
    })),

  tickDayTimer: (dt) => {
    const state = get()
    if (state.dayPhase === 'ended' || state.isMissionComplete) return

    const newTime = Math.max(0, state.timeLeft - dt)

    if (newTime <= 0) {
      // Day is over! Calculate end status
      const dx = state.roverX - BASE_X
      const dy = state.roverY - BASE_Y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const madeItHome = dist <= BASE_SAFE_DISTANCE

      const result: DayEndResult = {
        day: state.day,
        madeItHome,
        distanceDriven: Math.round(state.distanceDrivenToday),
        batteryLeft: Math.round(state.battery),
        fact: getRandomFact(),
      }

      set({
        timeLeft: 0,
        dayPhase: 'ended',
        isControlsLocked: true,
        isDriving: false,
        dayEndResult: result,
      })
      return
    }

    // Determine current phase
    let phase: DayPhase = 'daytime'
    if (newTime <= SUNSET_WARN_SEC) {
      phase = 'sunset'
    } else if (newTime >= state.dayDuration - MORNING_DURATION_SEC) {
      phase = 'morning'
    }

    set({ timeLeft: newTime, dayPhase: phase })
  },

  startNextDay: () => {
    const state = get()
    if (state.day >= state.maxDays) {
      // Mission finished after day 20!
      set({
        isMissionComplete: true,
        dayEndResult: null,
        isControlsLocked: true,
        isDriving: false,
      })
      return
    }

    const nextDay = state.day + 1
    // Safe at home = 100% battery, stranded overnight = 50% battery
    const nextBattery = state.dayEndResult?.madeItHome ? 100 : 50

    set({
      day: nextDay,
      timeLeft: state.dayDuration,
      dayPhase: 'morning',
      isControlsLocked: false,
      isDriving: false,
      isPoweredOff: false,
      distanceDrivenToday: 0,
      dayEndResult: null,
      battery: nextBattery,
      roverX: BASE_X,
      roverY: BASE_Y,
    })

    window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
  },

  resetMission: () => {
    const state = get()
    set({
      day: 1,
      timeLeft: state.dayDuration,
      dayPhase: 'morning',
      isControlsLocked: false,
      isDriving: false,
      isPoweredOff: false,
      distanceDrivenToday: 0,
      dayEndResult: null,
      isMissionComplete: false,
      battery: 100,
      roverX: BASE_X,
      roverY: BASE_Y,
    })

    window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
  },
}))
