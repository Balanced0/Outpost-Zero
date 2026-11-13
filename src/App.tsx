import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Joystick from './components/Joystick'

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <GameCanvas />
      <HUD />
      <Joystick />
    </div>
  )
}
