import { create } from 'zustand'

export const BASE_X = 2000
export const BASE_Y = 2000

interface GameState {
  battery: number         // 0-100
  roverX: number
  roverY: number
  isDriving: boolean
  isPoweredOff: boolean
  joystickDx: number      // -1 to 1
  joystickDy: number      // -1 to 1
  setBattery: (v: number) => void
  setRoverPos: (x: number, y: number) => void
  setIsDriving: (v: boolean) => void
  setIsPoweredOff: (v: boolean) => void
  setJoystick: (dx: number, dy: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  battery: 100,
  roverX: BASE_X,
  roverY: BASE_Y,
  isDriving: false,
  isPoweredOff: false,
  joystickDx: 0,
  joystickDy: 0,
  setBattery: (v) => set({ battery: Math.max(0, Math.min(100, v)) }),
  setRoverPos: (x, y) => set({ roverX: x, roverY: y }),
  setIsDriving: (v) => set({ isDriving: v }),
  setIsPoweredOff: (v) => set({ isPoweredOff: v }),
  setJoystick: (dx, dy) => set({ joystickDx: dx, joystickDy: dy }),
}))
