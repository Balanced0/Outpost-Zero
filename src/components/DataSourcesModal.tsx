import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import marsPhotosJson from '../data/marsPhotos.json'
import { NASA_FACTS } from '../data/facts'
import {
  DatabaseScienceIcon,
  RadarDishIcon,
  RocketIcon,
} from './icons/MissionIcons'

interface MarsPhoto {
  file: string
  tag: string
  title: string
  credit: string
  sourceUrl: string
}

const photos = marsPhotosJson as MarsPhoto[]

export default function DataSourcesModal() {
  const showDataSourcesModal = useGameStore((s) => s.showDataSourcesModal)
  const setShowDataSourcesModal = useGameStore((s) => s.setShowDataSourcesModal)
  const spaceWeatherSource = useGameStore((s) => s.spaceWeatherSource)
  const missionSpaceWeather = useGameStore((s) => s.missionSpaceWeather)
  const stormEventsToday = useGameStore((s) => s.stormEventsToday)
  const dayLogs = useGameStore((s) => s.dayLogs)

  // ESC key to close modal
  useEffect(() => {
    if (!showDataSourcesModal) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDataSourcesModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDataSourcesModal, setShowDataSourcesModal])

  if (!showDataSourcesModal) {
    return null
  }

  // Compile unique storm event labels recorded across the mission
  const allRecordedEvents = Array.from(
    new Set(
      dayLogs.length > 0
        ? dayLogs.flatMap((l) => l.stormEvents)
        : stormEventsToday
    )
  )

  const dateWindow =
    missionSpaceWeather?.windowStart && missionSpaceWeather?.windowEnd
      ? `${missionSpaceWeather.windowStart} to ${missionSpaceWeather.windowEnd}`
      : 'Last 60 days of real solar observations'

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none overflow-y-auto animate-fade-in bg-[#04060d]/85 backdrop-blur-md"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="mission-panel border border-sky-400/40 rounded-[28px] max-w-2xl w-full p-4 sm:p-7 text-white flex flex-col gap-4 my-auto max-h-[92dvh] overflow-y-auto animate-modal-in relative">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-300 flex-shrink-0">
              <DatabaseScienceIcon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 block">
                NASA Space Apps Challenge · Provenance
              </span>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                Data Sources &amp; Attribution
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDataSourcesModal(false)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors active:scale-95"
            title="Close (ESC)"
            aria-label="Close Data Sources"
          >
            ✕
          </button>
        </div>

        {/* 1. NASA DONKI Section */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display font-bold text-sm text-sky-300 flex items-center gap-2">
              <RadarDishIcon size={15} className="text-sky-400" />
              <span>1. NASA DONKI (Space Weather Database)</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                spaceWeatherSource === 'live'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                  : spaceWeatherSource === 'saved'
                  ? 'bg-sky-500/15 text-sky-300 border-sky-400/40'
                  : 'bg-purple-500/15 text-purple-300 border-purple-400/40'
              }`}
            >
              Status: {spaceWeatherSource.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            DONKI reports real past solar events. The game replays 20 real days as your mission.
          </p>

          <div className="bg-slate-900/75 rounded-xl p-3 border border-white/[0.06] text-[11px] font-mono flex flex-col gap-1.5 text-slate-300">
            <div>
              <span className="text-slate-400">Date Window Used: </span>
              <span className="text-amber-300">{dateWindow}</span>
            </div>
            <div>
              <span className="text-slate-400">Recorded Solar Observations: </span>
              <span className="text-slate-200">
                {allRecordedEvents.length > 0
                  ? allRecordedEvents.join(' • ')
                  : 'Calm solar activity recorded'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Source API:{' '}
              <code className="text-sky-300">https://ccmc.gsfc.nasa.gov/DONKI-API/get</code> (NASA
              Space Weather Database Of Notifications, Knowledge, Information)
            </div>
          </div>
        </div>

        {/* 2. NASA Photos Section */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display font-bold text-sm text-amber-300 flex items-center gap-2">
              <span>📷</span>
              <span>2. NASA Martian Photography</span>
            </h3>
            <span className="text-[10px] text-slate-400 italic">
              Colors may be adjusted by NASA scientists.
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All surface rock and ancient terrain discoveries feature real photographs captured by NASA rovers on Mars.
          </p>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
            {photos.map((p) => (
              <div
                key={p.file}
                className="bg-slate-900/75 rounded-xl p-2.5 border border-white/[0.06] flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-slate-200">{p.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Credit: {p.credit}</div>
                </div>
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-sky-300 hover:text-white bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 px-2.5 py-1 rounded-lg font-mono flex-shrink-0 transition-colors"
                >
                  NASA JPL ↗
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Science Facts ("Did you know?") Section */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2.5">
          <h3 className="font-display font-bold text-sm text-emerald-300 flex items-center gap-2">
            <RocketIcon size={15} className="text-emerald-400" />
            <span>3. Science Facts (&ldquo;Did you know?&rdquo;)</span>
          </h3>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
            {NASA_FACTS.map((f, idx) => (
              <div
                key={idx}
                className="bg-slate-900/75 rounded-xl p-2.5 border border-white/[0.06] flex flex-col gap-1"
              >
                <div className="text-slate-200 leading-snug">&ldquo;{f.text}&rdquo;</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span className="text-slate-300 font-semibold">{f.sourceName}</span>
                  <span>•</span>
                  {f.sourceUrl ? (
                    <a
                      href={f.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline"
                    >
                      Source link ↗
                    </a>
                  ) : (
                    <span className="text-amber-400 italic">Source: to be added</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Art and Sounds */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-1.5 text-xs text-slate-300">
          <h3 className="font-display font-bold text-sm text-purple-300 flex items-center gap-2">
            <span>🎨</span>
            <span>4. Art &amp; Visual Assets</span>
          </h3>
          <p className="leading-snug">
            <strong className="text-white">Kenney (CC0):</strong> Terrain ground tiles, base structure building, and vehicle sprites from the{' '}
            <code className="text-amber-300 font-mono">Sci-Fi RTS</code> and{' '}
            <code className="text-amber-300 font-mono">Planets</code> asset packs (public domain).
          </p>
        </div>

        {/* 5. NASA Illustration (Menu) */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-1.5 text-xs text-slate-300">
          <h3 className="font-display font-bold text-sm text-orange-300 flex items-center gap-2">
            <span>🖼️</span>
            <span>5. NASA Concept Illustration</span>
          </h3>
          <p className="leading-snug">
            When available, the start menu displays a concept drawing credited as{' '}
            <strong className="text-white">&ldquo;Illustration: NASA/JPL-Caltech&rdquo;</strong>. It is an artist&apos;s drawing representing human exploration concepts.
          </p>
        </div>

        {/* 6. What is Simulated */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2 text-xs">
          <h3 className="font-display font-bold text-sm text-amber-300 flex items-center gap-2">
            <span>⚙️</span>
            <span>6. What is Simulated (Game Design Simplifications)</span>
          </h3>
          <p className="text-slate-300 leading-snug">
            To make the mission fun, fast, and accessible for young players (ages 7–12), several complex engineering formulas were simplified into game design parameters:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-mono">
            <li>
              <strong className="text-white">Power budget:</strong> Fixed daily pool (100 or 90 points) divided between Air, Shield, and Rover.
            </li>
            <li>
              <strong className="text-white">Battery mechanics:</strong> Fixed capacity and linear drain rates while driving.
            </li>
            <li>
              <strong className="text-white">Air machine:</strong> Simplified daily drop (-16%) and linear solar refill (+0.47% per point).
            </li>
            <li>
              <strong className="text-white">Radiation formula:</strong> Storm intensity minus shield strength multiplied by difficulty factor.
            </li>
            <li>
              <strong className="text-white">Discovery spots:</strong> Procedurally placed rock, riverbed, and ice points across the map.
            </li>
            <li>
              <strong className="text-white">Comms delay:</strong> Scaled down to 20 seconds for Mars (from 4–24 real minutes) and 2 seconds for the Moon (from 1.3s) for real-time web gameplay.
            </li>
          </ul>
        </div>

        {/* 7. How the Game Maps to Real Missions Table */}
        <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2.5">
          <h3 className="font-display font-bold text-sm text-emerald-300 flex items-center gap-2">
            <span>🗺️</span>
            <span>7. How the Game Maps to Real Space Missions</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-300 font-mono text-[11px] uppercase border-b border-white/[0.07]">
                <tr>
                  <th className="p-2.5">Game Element</th>
                  <th className="p-2.5">Real NASA Mission Reality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300 text-[11px]">
                <tr>
                  <td className="p-2.5 font-semibold text-white">Shield Power</td>
                  <td className="p-2.5">
                    Radiation shielding to protect human astronauts from coronal mass ejections and solar energetic particles.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-white">Comms Delay</td>
                  <td className="p-2.5">
                    Speed-of-light radio delay across planetary distances (Earth-to-Mars signal latency).
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-white">Rover Battery</td>
                  <td className="p-2.5">
                    Power storage limits and thermal operational envelopes on extraterrestrial rovers.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-white">Space Weather</td>
                  <td className="p-2.5">
                    Real solar flares (FLR), geomagnetic storms (GST), and particle events (SEP) from NASA DONKI.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Close Button (Sticky Footer) */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-3 pb-1 -mx-4 px-4 sm:-mx-7 sm:px-7 border-t border-white/[0.08] mt-auto">
          <button
            type="button"
            onClick={() => setShowDataSourcesModal(false)}
            className="w-full min-h-[48px] py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:from-sky-600 active:to-blue-700 text-white font-display font-bold rounded-2xl transition-all cursor-pointer text-sm shadow-[0_8px_20px_-4px_rgba(14,165,233,0.45)] flex items-center justify-center active:scale-[0.99]"
          >
            Close Data Sources
          </button>
        </div>
      </div>
    </div>
  )
}
