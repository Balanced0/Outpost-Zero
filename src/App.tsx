import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Joystick from './components/Joystick'
import SunsetOverlay from './components/SunsetOverlay'
import StormOverlay from './components/StormOverlay'
import MorningScreen from './components/MorningScreen'
import ResultCard from './components/ResultCard'
import DiscoveryPopup from './components/DiscoveryPopup'
import TutorialHelper from './components/TutorialHelper'
import StartMenu from './components/StartMenu'
import DebriefScreen from './components/DebriefScreen'
import DataSourcesModal from './components/DataSourcesModal'
import GlossaryCard from './components/GlossaryCard'
import SoundToggle from './components/SoundToggle'
import { useAutoGlossaryCards } from './hooks/useAutoGlossaryCards'
import { useGameSounds } from './hooks/useGameSounds'

function AppInner() {
  useAutoGlossaryCards()
  useGameSounds()

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <GameCanvas />
      <SunsetOverlay />
      <StormOverlay />
      <HUD />
      <Joystick />
      <DiscoveryPopup />
      <MorningScreen />
      <TutorialHelper />
      <ResultCard />
      {/* DebriefScreen replaces both MissionPaused and MissionComplete at z-50 */}
      <DebriefScreen />
      <DataSourcesModal />
      <StartMenu />
      {/* Glossary card at highest z — above everything else */}
      <GlossaryCard />
      {/* Mute toggle — always visible */}
      <SoundToggle />
    </div>
  )
}

export default function App() {
  return <AppInner />
}
