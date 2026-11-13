import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Joystick from './components/Joystick'
import SunsetOverlay from './components/SunsetOverlay'
import StormOverlay from './components/StormOverlay'
import MorningScreen from './components/MorningScreen'
import ResultCard from './components/ResultCard'
import DiscoveryPopup from './components/DiscoveryPopup'
import MissionPaused from './components/MissionPaused'
import MissionComplete from './components/MissionComplete'

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <GameCanvas />
      <SunsetOverlay />
      <StormOverlay />
      <HUD />
      <Joystick />
      <DiscoveryPopup />
      <MorningScreen />
      <ResultCard />
      <MissionPaused />
      <MissionComplete />
    </div>
  )
}
