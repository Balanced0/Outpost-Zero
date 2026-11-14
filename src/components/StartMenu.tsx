import { useState } from 'react'
import { useGameStore, loadSavedSettings } from '../store/gameStore'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'
import { sfx } from '../utils/sound'
import {
  RocketIcon,
  AstronautIcon,
  DatabaseScienceIcon,
  ZapBoltIcon,
  CrystalSampleIcon,
  RadarDishIcon,
} from './icons/MissionIcons'

// Multi-layer twinkling starfield with individual delay phases
const STAR_DOTS = [
  { x: 5, y: 9, size: 2.2, opacity: 0.85, delay: '0s' },
  { x: 14, y: 28, size: 1.5, opacity: 0.55, delay: '0.6s' },
  { x: 23, y: 14, size: 2.5, opacity: 0.9, delay: '1.3s' },
  { x: 9, y: 72, size: 1.8, opacity: 0.5, delay: '2.1s' },
  { x: 21, y: 88, size: 2.2, opacity: 0.75, delay: '0.4s' },
  { x: 35, y: 6, size: 1.6, opacity: 0.6, delay: '1.8s' },
  { x: 45, y: 22, size: 2.2, opacity: 0.8, delay: '0.9s' },
  { x: 57, y: 11, size: 1.6, opacity: 0.65, delay: '2.5s' },
  { x: 69, y: 27, size: 2.4, opacity: 0.85, delay: '0.2s' },
  { x: 83, y: 13, size: 1.8, opacity: 0.6, delay: '1.5s' },
  { x: 93, y: 21, size: 2.3, opacity: 0.8, delay: '0.7s' },
  { x: 90, y: 66, size: 2.6, opacity: 0.9, delay: '1.1s' },
  { x: 76, y: 81, size: 1.6, opacity: 0.5, delay: '2.3s' },
  { x: 86, y: 91, size: 2.2, opacity: 0.75, delay: '0.5s' },
  { x: 63, y: 93, size: 1.7, opacity: 0.55, delay: '1.9s' },
  { x: 48, y: 85, size: 2.1, opacity: 0.7, delay: '1.2s' },
  { x: 33, y: 64, size: 1.5, opacity: 0.45, delay: '2.7s' },
  { x: 4, y: 49, size: 2.2, opacity: 0.7, delay: '0.8s' },
  { x: 96, y: 45, size: 1.8, opacity: 0.6, delay: '1.6s' },
  { x: 18, y: 53, size: 1.4, opacity: 0.45, delay: '2.0s' },
  { x: 79, y: 44, size: 1.9, opacity: 0.65, delay: '0.3s' },
  { x: 12, y: 40, size: 2.4, opacity: 0.8, delay: '1.4s' },
  { x: 88, y: 34, size: 2.0, opacity: 0.75, delay: '2.2s' },
]

/**
 * AnimatedMarsOrb — Interactive motion-graphic Mars globe with rotating surface bands,
 * polar ice cap, atmospheric corona, tilted orbital ring, and orbiting recon satellite.
 */
function AnimatedMarsOrb({ active }: { active: boolean }) {
  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 select-none">
      {/* Outer Pulsing Atmospheric Aura */}
      <div
        className={`absolute inset-1 rounded-full blur-md transition-all duration-500 ${
          active
            ? 'bg-gradient-to-tr from-orange-600/60 via-amber-500/45 to-rose-500/50 scale-110 animate-pulse'
            : 'bg-orange-500/20 scale-95 group-hover:bg-orange-500/40 group-hover:scale-105'
        }`}
      />

      {/* Rotating Outer Orbital Ring + Recon Satellite */}
      <svg
        viewBox="0 0 80 80"
        className={`absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 ${
          active ? 'animate-radar-sweep opacity-95' : 'animate-spin-slow opacity-50 group-hover:opacity-85'
        }`}
      >
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="#fb923c"
          strokeWidth="1"
          strokeDasharray="5 5"
          strokeOpacity="0.65"
        />
        {/* Orbiting Satellite Beacon */}
        <circle cx="40" cy="5" r="3" fill="#fde68a" />
        <circle cx="40" cy="5" r="6" fill="#f97316" fillOpacity="0.35" />
      </svg>

      {/* Core Glossy Mars Sphere */}
      <div
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border transition-all duration-300 ${
          active
            ? 'border-orange-300/90 shadow-[0_0_22px_rgba(249,115,22,0.65),inset_0_2px_6px_rgba(255,255,255,0.45)] scale-105'
            : 'border-orange-400/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)] group-hover:scale-105'
        }`}
        style={{
          background:
            'radial-gradient(circle at 32% 28%, #fdba74 0%, #ea580c 42%, #9a3412 78%, #431407 100%)',
        }}
      >
        {/* Rotating Surface Canyons & Dust Storms */}
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full animate-spin-slow opacity-75"
          fill="none"
        >
          {/* Polar Ice Cap */}
          <ellipse cx="32" cy="7" rx="14" ry="4" fill="#fff7ed" fillOpacity="0.55" />
          {/* Valles Marineris Equatorial Band */}
          <path
            d="M4 28 Q 20 22, 36 29 T 60 26"
            stroke="#7c2d12"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M8 40 Q 26 46, 44 38 T 58 43"
            stroke="#fdba74"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          {/* Olympus Mons Shield Caldera */}
          <circle cx="22" cy="20" r="4.5" fill="#7c2d12" fillOpacity="0.55" stroke="#fed7aa" strokeWidth="0.8" />
          <circle cx="44" cy="34" r="3" fill="#431407" fillOpacity="0.45" />
        </svg>

        {/* Glossy Specular Highlight Lens */}
        <div
          className="absolute -top-1 -left-1 w-6 h-4 rounded-full bg-gradient-to-br from-white/55 to-transparent -rotate-12 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Tilted Equatorial Ring Overlay */}
      <svg
        viewBox="0 0 80 80"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <ellipse
          cx="40"
          cy="40"
          rx="36"
          ry="12"
          transform="rotate(-22 40 40)"
          fill="none"
          stroke="#fdba74"
          strokeWidth="1.2"
          strokeDasharray="18 8"
          strokeOpacity={active ? '0.8' : '0.35'}
        />
      </svg>
    </div>
  )
}

/**
 * AnimatedMoonOrb — Interactive motion-graphic Lunar globe with crater basins,
 * cryo-cyan horizon glow, orbital telemetry ring, and lunar recon orbiter.
 */
function AnimatedMoonOrb({ active }: { active: boolean }) {
  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 select-none">
      {/* Outer Pulsing Lunar Cryo Aura */}
      <div
        className={`absolute inset-1 rounded-full blur-md transition-all duration-500 ${
          active
            ? 'bg-gradient-to-tr from-cyan-500/60 via-sky-400/45 to-indigo-500/50 scale-110 animate-pulse'
            : 'bg-cyan-400/20 scale-95 group-hover:bg-cyan-400/40 group-hover:scale-105'
        }`}
      />

      {/* Rotating Outer Orbital Ring + Lunar Recon Probe */}
      <svg
        viewBox="0 0 80 80"
        className={`absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 ${
          active ? 'animate-radar-sweep opacity-95' : 'animate-spin-slow opacity-50 group-hover:opacity-85'
        }`}
      >
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeDasharray="5 5"
          strokeOpacity="0.65"
        />
        {/* Orbiting Lunar Gateway Beacon */}
        <circle cx="75" cy="40" r="3" fill="#a5f3fc" />
        <circle cx="75" cy="40" r="6" fill="#06b6d4" fillOpacity="0.35" />
      </svg>

      {/* Core Glossy Moon Sphere */}
      <div
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border transition-all duration-300 ${
          active
            ? 'border-cyan-300/90 shadow-[0_0_22px_rgba(34,211,238,0.65),inset_0_2px_6px_rgba(255,255,255,0.55)] scale-105'
            : 'border-cyan-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] group-hover:scale-105'
        }`}
        style={{
          background:
            'radial-gradient(circle at 30% 28%, #f8fafc 0%, #cbd5e1 38%, #64748b 75%, #1e293b 100%)',
        }}
      >
        {/* Rotating Lunar Mare & Crater Basins */}
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full animate-orbit-reverse opacity-80"
          fill="none"
        >
          {/* Mare Tranquillitatis Dark Basalt Plains */}
          <circle cx="24" cy="24" r="9" fill="#334155" fillOpacity="0.45" />
          <circle cx="38" cy="34" r="7" fill="#334155" fillOpacity="0.38" />
          {/* Impact Craters with Rim Highlights */}
          <circle cx="20" cy="38" r="5" fill="#475569" fillOpacity="0.55" stroke="#e2e8f0" strokeWidth="0.9" />
          <circle cx="42" cy="20" r="4" fill="#475569" fillOpacity="0.5" stroke="#f1f5f9" strokeWidth="0.8" />
          <circle cx="32" cy="46" r="3.2" fill="#1e293b" fillOpacity="0.5" stroke="#cbd5e1" strokeWidth="0.7" />
          <circle cx="15" cy="19" r="2.5" fill="#334155" fillOpacity="0.55" />
        </svg>

        {/* Glossy Specular Highlight Lens */}
        <div
          className="absolute -top-1 -left-1 w-6 h-4 rounded-full bg-gradient-to-br from-white/65 to-transparent -rotate-12 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Tilted Polar Orbit Ring Overlay */}
      <svg
        viewBox="0 0 80 80"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <ellipse
          cx="40"
          cy="40"
          rx="36"
          ry="12"
          transform="rotate(22 40 40)"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="1.2"
          strokeDasharray="18 8"
          strokeOpacity={active ? '0.8' : '0.35'}
        />
      </svg>
    </div>
  )
}

export default function StartMenu() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const launchMission = useGameStore((s) => s.launchMission)
  const setShowDataSourcesModal = useGameStore((s) => s.setShowDataSourcesModal)

  const saved = loadSavedSettings()
  const [commanderName, setCommanderName] = useState(saved.commanderName || 'Commander')
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>(saved.planet || 'mars')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(
    saved.difficulty || 'commander'
  )
  const [skipTutorial, setSkipTutorial] = useState<boolean>(saved.skipTutorial ?? false)
  const [planetLoaded, setPlanetLoaded] = useState(false)

  // Interactive 3D mouse parallax & glossy spotlight coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, spotX: 50, spotY: 20 })

  if (isGameStarted) {
    return null
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window
    const nx = (e.clientX / innerWidth - 0.5) * 2 // -1 to 1
    const ny = (e.clientY / innerHeight - 0.5) * 2 // -1 to 1
    setMousePos({
      x: nx,
      y: ny,
      spotX: Math.round((e.clientX / innerWidth) * 100),
      spotY: Math.round((e.clientY / innerHeight) * 100),
    })
  }

  const handleLaunch = () => {
    sfx('launch', { volume: 0.7 })
    launchMission({
      commanderName: commanderName.trim() || 'Commander',
      planet: selectedPlanet,
      difficulty: selectedDifficulty,
      skipTutorial,
    })
  }

  const isMars = selectedPlanet === 'mars'
  const planetImgSrc =
    selectedPlanet === 'moon' ? '/assets/menu/planet05.png' : '/assets/menu/planet02.png'

  return (
    <div
      onMouseMove={handleMouseMove}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none overflow-y-auto tech-grid-bg transition-colors duration-700"
      style={{
        background: isMars
          ? `radial-gradient(circle at ${mousePos.spotX}% ${mousePos.spotY}%, rgba(249, 115, 22, 0.16) 0%, transparent 45%), radial-gradient(ellipse at 50% 0%, rgba(194, 65, 12, 0.34) 0%, rgba(15, 23, 42, 0.94) 52%, #04060c 100%)`
          : `radial-gradient(circle at ${mousePos.spotX}% ${mousePos.spotY}%, rgba(34, 211, 238, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 0%, rgba(14, 116, 144, 0.32) 0%, rgba(15, 23, 42, 0.94) 52%, #04060c 100%)`,
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      {/* ============================================================== */}
      {/* 1. DEEP SPACE MOTION GRAPHICS: TWINKLING STARS, METEORS & ORBITS */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Parallax Twinkling Starfield */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
          }}
        >
          {STAR_DOTS.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: star.delay,
                boxShadow: '0 0 6px rgba(255,255,255,0.8)',
              }}
            />
          ))}
        </div>

        {/* Shooting Star / Meteor Streaks */}
        <div
          className="absolute top-[12%] right-[18%] w-28 h-[1.5px] bg-gradient-to-l from-transparent via-white to-cyan-200 rounded-full animate-meteor"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute top-[36%] right-[8%] w-24 h-[1.5px] bg-gradient-to-l from-transparent via-orange-200 to-white rounded-full animate-meteor"
          style={{ animationDelay: '3.8s' }}
        />

        {/* Rotating Concentric Orbital Telemetry Rings */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[860px] h-[860px] transition-transform duration-300 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 16}px), calc(-50% + ${mousePos.y * 16}px))`,
          }}
        >
          <svg
            className="w-full h-full opacity-[0.13] animate-spin-slower"
            viewBox="0 0 900 900"
            fill="none"
          >
            <circle
              cx="450"
              cy="450"
              r="310"
              stroke={isMars ? '#fb923c' : '#22d3ee'}
              strokeWidth="1.2"
              strokeDasharray="8 10"
            />
            <circle cx="450" cy="450" r="395" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" />
            <circle
              cx="450"
              cy="450"
              r="435"
              stroke={isMars ? '#f97316' : '#38bdf8'}
              strokeWidth="1.5"
              strokeDasharray="80 180"
            />
            {/* Orbital Node Markers */}
            <circle cx="450" cy="140" r="4" fill={isMars ? '#fb923c' : '#22d3ee'} />
            <circle cx="760" cy="450" r="3" fill="white" />
            <circle cx="450" cy="845" r="3.5" fill={isMars ? '#fb923c' : '#22d3ee'} />
          </svg>
        </div>

        {/* Counter-Rotating Inner Telemetry Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] pointer-events-none">
          <svg
            className="w-full h-full opacity-[0.09] animate-orbit-reverse"
            viewBox="0 0 640 640"
            fill="none"
          >
            <circle
              cx="320"
              cy="320"
              r="285"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="3 14"
            />
            <path
              d="M320 15 L320 45 M320 595 L320 625 M15 320 L45 320 M595 320 L625 320"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FLOATING HOLOGRAPHIC PLANETARY SHOWCASE (TOP-RIGHT & LEFT)   */}
      {/* ============================================================== */}
      <div
        className="absolute -top-10 -right-10 md:-top-14 md:-right-14 w-64 h-64 md:w-[440px] md:h-[440px] pointer-events-none animate-float-slow"
        aria-hidden="true"
      >
        <div
          className="w-full h-full relative flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -22}px, ${mousePos.y * -22}px)`,
          }}
        >
          {/* Glowing Planetary Corona */}
          <div
            className={`absolute inset-10 rounded-full blur-3xl transition-colors duration-700 ${
              isMars ? 'bg-orange-500/25' : 'bg-cyan-400/25'
            }`}
          />

          {/* Animated Orbital Telemetry Ring Around Background Planet */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full animate-spin-slow opacity-45"
            fill="none"
          >
            <circle
              cx="200"
              cy="200"
              r="168"
              stroke={isMars ? '#fb923c' : '#22d3ee'}
              strokeWidth="1.2"
              strokeDasharray="12 8"
            />
            <circle cx="200" cy="32" r="5" fill={isMars ? '#fdba74' : '#67e8f9'} />
          </svg>

          <img
            src={planetImgSrc}
            alt=""
            loading="lazy"
            onLoad={() => setPlanetLoaded(true)}
            onError={() => setPlanetLoaded(false)}
            className={`w-full h-full object-contain pointer-events-none select-none transition-all duration-700 animate-spin-slower ${
              planetLoaded
                ? 'opacity-45 scale-100 drop-shadow-[0_0_40px_rgba(249,115,22,0.3)]'
                : 'opacity-0 scale-90'
            }`}
          />
        </div>
      </div>

      {/* Secondary Ambient Planet Companion (Bottom-Left) */}
      <div
        className="hidden lg:flex absolute -bottom-20 -left-20 w-[340px] h-[340px] pointer-events-none items-center justify-center opacity-35 animate-float-medium"
        aria-hidden="true"
      >
        <div
          className={`absolute inset-12 rounded-full blur-3xl transition-colors duration-700 ${
            isMars ? 'bg-cyan-500/20' : 'bg-orange-500/20'
          }`}
        />
        <svg viewBox="0 0 300 300" className="w-full h-full animate-orbit-reverse" fill="none">
          <circle
            cx="150"
            cy="150"
            r="120"
            stroke={isMars ? '#22d3ee' : '#fb923c'}
            strokeWidth="1"
            strokeDasharray="6 10"
          />
          <circle cx="150" cy="30" r="4" fill={isMars ? '#67e8f9' : '#fdba74'} />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* 3. ULTRA-GLOSSY MISSION COMMAND PANEL                          */}
      {/* ============================================================== */}
      <div
        className="mission-panel rounded-[30px] max-w-xl w-full p-4 sm:p-6 md:p-7 text-white flex flex-col gap-3.5 sm:gap-4 my-auto relative z-10 max-h-[94dvh] overflow-y-auto animate-modal-in"
        style={{
          boxShadow: isMars
            ? '0 30px 80px -12px rgba(0, 0, 0, 0.9), 0 0 50px -12px rgba(249, 115, 22, 0.22), 0 1.5px 0 0 rgba(255, 255, 255, 0.32) inset'
            : '0 30px 80px -12px rgba(0, 0, 0, 0.9), 0 0 50px -12px rgba(34, 211, 238, 0.22), 0 1.5px 0 0 rgba(255, 255, 255, 0.32) inset',
        }}
      >
        {/* Specular Top Glass Edge Highlight */}
        <div
          className={`absolute top-0 left-6 right-6 h-[2.5px] rounded-full transition-colors duration-500 ${
            isMars
              ? 'bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_16px_rgba(249,115,22,0.9)]'
              : 'bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_rgba(34,211,238,0.9)]'
          }`}
        />

        {/* Subtle Glossy Diagonal Light Reflection Across Panel */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/[0.04] blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Live Motion-Graphics Telemetry Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/65 border border-white/[0.1] text-[10px] font-mono text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isMars ? 'bg-orange-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isMars ? 'bg-orange-500' : 'bg-cyan-400'
                }`}
              />
            </span>
            <span className="font-bold tracking-wider uppercase text-white">
              DSN LINK // {isMars ? 'MARS ORBITER 01' : 'LUNAR GATEWAY 05'}
            </span>
          </div>

          {/* Animated Solar Telemetry Equalizer Bars */}
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-slate-400">
              {isMars ? '18.65°N 226.2°E' : '89.9°S SHACKLETON'}
            </span>
            <div className="flex items-end gap-[2px] h-3" aria-hidden="true">
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-orange-400' : 'bg-cyan-400'
                }`}
                style={{ animationDelay: '0s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-amber-300' : 'bg-sky-300'
                }`}
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-orange-500' : 'bg-cyan-500'
                }`}
                style={{ animationDelay: '0.4s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-amber-400' : 'bg-sky-400'
                }`}
                style={{ animationDelay: '0.1s' }}
              />
            </div>
          </div>
        </div>

        {/* Header: Mission Badge, Animated Glossy Title, Tagline */}
        <div className="text-center flex flex-col items-center pt-0.5 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08] border border-white/20 text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-amber-200 uppercase mb-2 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] relative overflow-hidden">
            <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>NASA Space Apps Challenge · Mission Trainer</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
            OUTPOST{' '}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500 ${
                isMars
                  ? 'from-orange-300 via-amber-400 to-rose-500 drop-shadow-[0_0_24px_rgba(249,115,22,0.55)]'
                  : 'from-cyan-200 via-sky-400 to-blue-500 drop-shadow-[0_0_24px_rgba(34,211,238,0.55)]'
              }`}
            >
              ZERO
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200/90 mt-2 font-medium tracking-wide max-w-md">
            Survive the Sun. Power the habitat. Explore the unknown across a 20-sol expedition.
          </p>
        </div>

        {/* Commander Callsign Glossy Input */}
        <div className="glossy-card rounded-2xl p-3.5 border border-white/[0.14] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="commander-name-input"
              className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"
            >
              <AstronautIcon size={15} className={isMars ? 'text-orange-400' : 'text-cyan-400'} />
              <span>Welcome, Mission Commander</span>
            </label>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/30">
              ID // {(commanderName.trim() || 'COMMANDER').toUpperCase().slice(0, 12)}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              id="commander-name-input"
              type="text"
              maxLength={16}
              value={commanderName}
              onChange={(e) => setCommanderName(e.target.value)}
              placeholder="Commander"
              className="w-full min-h-[44px] bg-slate-950/85 border border-white/15 rounded-xl pl-3.5 pr-14 py-2 text-white font-semibold text-sm tracking-wide shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] focus:outline-none focus:border-orange-400/90 focus:ring-2 focus:ring-orange-500/25 transition-all"
            />
            <span className="absolute right-3.5 text-[11px] font-mono text-slate-400 pointer-events-none">
              {commanderName.length}/16
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESTINATION SELECTION: INTERACTIVE ANIMATED MARS & MOON CARDS  */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              01 · Select Target Body
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Interactive Orbital Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* MARS INTERACTIVE CARD */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('mars')
              }}
              className={`group glossy-card p-3.5 rounded-2xl border text-left cursor-pointer flex flex-col gap-2.5 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'mars'
                  ? 'bg-gradient-to-br from-orange-950/75 via-slate-900/90 to-rose-950/60 border-orange-400/90 shadow-[0_0_32px_-4px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'bg-slate-900/60 border-white/[0.12] hover:border-orange-400/50 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Animated Shimmer Sweep when Selected */}
              {selectedPlanet === 'mars' && (
                <div
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-orange-300/15 to-transparent animate-shimmer pointer-events-none"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <AnimatedMarsOrb active={selectedPlanet === 'mars'} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                        Mars
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-400/40 text-orange-300 font-bold">
                        0.38G
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-orange-300/95 block truncate">
                      {PLANETS.mars.tagline}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      ORBIT // 24.07 KM/S
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                    selectedPlanet === 'mars'
                      ? 'bg-gradient-to-b from-orange-400 to-orange-600 border-orange-200 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-105'
                      : 'border-white/20 bg-white/5 text-transparent group-hover:border-orange-400/50'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-snug relative z-10">
                Red regolith canyons, atmospheric dust haze, and a 20s DSN comms delay.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.1] text-slate-200">
                  <RadarDishIcon size={11} className="text-orange-400" /> 20s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.1] text-emerald-300">
                  <ZapBoltIcon size={11} className="text-emerald-400" /> Standard Drain
                </span>
              </div>
            </button>

            {/* MOON INTERACTIVE CARD */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('moon')
              }}
              className={`group glossy-card p-3.5 rounded-2xl border text-left cursor-pointer flex flex-col gap-2.5 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'moon'
                  ? 'bg-gradient-to-br from-cyan-950/75 via-slate-900/90 to-blue-950/60 border-cyan-400/90 shadow-[0_0_32px_-4px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'bg-slate-900/60 border-white/[0.12] hover:border-cyan-400/50 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Animated Shimmer Sweep when Selected */}
              {selectedPlanet === 'moon' && (
                <div
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent animate-shimmer pointer-events-none"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <AnimatedMoonOrb active={selectedPlanet === 'moon'} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                        Moon
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-bold">
                        0.16G
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300/95 block truncate">
                      {PLANETS.moon.tagline}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      ORBIT // 1.02 KM/S
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                    selectedPlanet === 'moon'
                      ? 'bg-gradient-to-b from-cyan-300 to-cyan-500 border-cyan-100 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-105'
                      : 'border-white/20 bg-white/5 text-transparent group-hover:border-cyan-400/50'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-snug relative z-10">
                Grey lunar craters, swift 2s Earth link, +10% vacuum battery drain.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.1] text-cyan-200">
                  <RadarDishIcon size={11} className="text-cyan-400" /> 2s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/70 border border-white/[0.1] text-amber-300">
                  <ZapBoltIcon size={11} className="text-amber-400" /> +10% Drain
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DIFFICULTY SELECTION: GLOSSY INTERACTIVE PROFILE CARDS         */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              02 · Mission Profile & Difficulty
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Real NASA DONKI Weather
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['explorer', 'commander', 'mission_control'] as DifficultyId[]).map((diffKey) => {
              const diff = DIFFICULTIES[diffKey]
              const isSelected = selectedDifficulty === diffKey

              const accentStyles = {
                explorer: isSelected
                  ? 'bg-gradient-to-b from-emerald-950/65 to-slate-900/90 border-emerald-400/90 shadow-[0_0_24px_-4px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900/60 border-white/[0.1] hover:border-emerald-400/45 opacity-85 hover:opacity-100',
                commander: isSelected
                  ? 'bg-gradient-to-b from-amber-950/65 to-slate-900/90 border-amber-400/90 shadow-[0_0_24px_-4px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/60 border-white/[0.1] hover:border-amber-400/45 opacity-85 hover:opacity-100',
                mission_control: isSelected
                  ? 'bg-gradient-to-b from-purple-950/65 to-slate-900/90 border-purple-400/90 shadow-[0_0_24px_-4px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900/60 border-white/[0.1] hover:border-purple-400/45 opacity-85 hover:opacity-100',
              }[diffKey]

              const dotColor = {
                explorer: 'bg-emerald-400',
                commander: 'bg-amber-400',
                mission_control: 'bg-purple-400',
              }[diffKey]

              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => {
                    sfx('click_soft', { volume: 0.55 })
                    setSelectedDifficulty(diffKey)
                  }}
                  className={`glossy-card p-3 rounded-2xl border text-left cursor-pointer flex flex-col justify-between gap-2 min-h-[44px] relative overflow-hidden ${accentStyles}`}
                >
                  {isSelected && (
                    <div
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-bold text-xs sm:text-[13px] text-white flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${dotColor} ${
                            isSelected ? 'animate-ping' : ''
                          }`}
                        />
                        {diff.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {diff.ageGroup}
                    </span>
                    <p className="text-[11px] text-slate-200 leading-snug mt-1.5">
                      {diff.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08] text-[10px] font-mono text-slate-200 relative z-10">
                    <span className="inline-flex items-center gap-0.5">
                      <ZapBoltIcon size={10} className="text-amber-400" />
                      {diff.powerBudget}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <CrystalSampleIcon size={10} className="text-purple-300" />
                      {diff.discoveryGoal} pts
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Skip Tutorial Switch Row */}
        <label className="glossy-card flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border border-white/[0.1] hover:border-white/25 text-xs text-slate-200 cursor-pointer select-none min-h-[44px]">
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">
              Skip onboarding flight tutorial
            </span>
            <span className="text-[11px] text-slate-400">
              Recommended if you have already completed Days 1–3 training
            </span>
          </div>
          <div className="relative inline-flex items-center flex-shrink-0">
            <input
              type="checkbox"
              checked={skipTutorial}
              onChange={(e) => {
                sfx('tick', { volume: 0.4 })
                setSkipTutorial(e.target.checked)
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-800 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:border-orange-300" />
          </div>
        </label>

        {/* Sticky Glossy Launch Mission Button & Data Sources */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-3 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-7 md:px-7 border-t border-white/[0.12] flex flex-col gap-2 mt-auto">
          <button
            onClick={handleLaunch}
            className={`group relative overflow-hidden w-full min-h-[52px] py-3.5 px-6 text-white font-display font-bold text-base md:text-lg tracking-wide rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99] border ${
              isMars
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 border-orange-300/60 shadow-[0_12px_34px_-6px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.4)]'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 border-cyan-300/60 shadow-[0_12px_34px_-6px_rgba(34,211,238,0.6),inset_0_1px_0_rgba(255,255,255,0.4)]'
            }`}
          >
            {/* Continuous Glossy Shimmer Streak */}
            <div
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none"
              aria-hidden="true"
            />
            <RocketIcon
              size={21}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110 relative z-10"
            />
            <span className="relative z-10">
              Launch {isMars ? 'Mars' : 'Lunar'} Mission
            </span>
          </button>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                sfx('open_soft', { volume: 0.5 })
                setShowDataSourcesModal(true)
              }}
              className="min-h-[40px] px-3.5 py-1 rounded-full text-xs text-sky-300 hover:text-white hover:bg-white/[0.07] font-medium cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <DatabaseScienceIcon size={14} className="text-sky-400 animate-pulse" />
              <span>Data Sources & NASA Provenance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
