import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Joystick from './components/Joystick'
import SunsetOverlay from './components/SunsetOverlay'
import ResultCard from './components/ResultCard'
import MissionComplete from './components/MissionComplete'

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <GameCanvas />
      <SunsetOverlay />
      <HUD />
      <Joystick />
      <ResultCard />
      <MissionComplete />
    </div>
  )
}
