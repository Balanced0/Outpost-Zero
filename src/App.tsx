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
import MoonEarth from './components/MoonEarth'
import DebugPanel from './components/DebugPanel'
import BlackScreenGuard from './components/BlackScreenGuard'
import { useGameStore } from './store/gameStore'
import { useAutoGlossaryCards } from './hooks/useAutoGlossaryCards'
import { useGameSounds } from './hooks/useGameSounds'

function AppInner() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  useAutoGlossaryCards()
  useGameSounds()

  return (
    <div
      className="fixed inset-0 w-[100vw] overflow-hidden bg-[#06080f] select-none m-0 p-0"
      style={{ height: 'var(--app-h, 100dvh)' }}
    >
      {/* Phaser Canvas ONLY mounted and started after "Launch mission" is pressed */}
      {isGameStarted && <GameCanvas />}
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
      {/* Earth globe — Moon map only */}
      <MoonEarth />
      {/* Debug panel — only shown with ?debug=1 or on error */}
      <DebugPanel />
      {/* Black screen guard — shows reload buttons if canvas never renders */}
      <BlackScreenGuard />
    </div>
  )
}

export default function App() {
  return <AppInner />
}
