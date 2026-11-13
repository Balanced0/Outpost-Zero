/**
 * src/utils/sound.ts
 * Comprehensive Web Audio sound and music manager for Outpost Zero.
 *
 * Includes:
 *  - High-performance one-shot sound effects (Kenney Interface + Sci-Fi sound packs)
 *  - Seamless sound loops (Rover engine, ambient planetary hum, radar/scanner ping)
 *  - Built-in generative space ambient music synthesizer (calm, cinematic sci-fi chord pads)
 *  - Persistent volume and mute controls
 */

// ---- Sound catalogue -------------------------------------------------------
const SOUND_MAP: Record<string, string> = {
  // UI / buttons
  click:         '/assets/sounds/click_001.ogg',
  click_soft:    '/assets/sounds/click_002.ogg',
  back:          '/assets/sounds/back_004.ogg',
  scroll:        '/assets/sounds/scroll_001.ogg',
  toggle:        '/assets/sounds/toggle_001.ogg',
  switch:        '/assets/sounds/switch_004.ogg',

  // Positive actions / transitions
  confirm:       '/assets/sounds/confirmation_001.ogg',
  confirm_big:   '/assets/sounds/confirmation_002.ogg',
  launch:        '/assets/sounds/confirmation_003.ogg',
  open_card:     '/assets/sounds/open_001.ogg',
  open_soft:     '/assets/sounds/open_002.ogg',

  // Discovery & Science
  scan_start:    '/assets/sounds/select_004.ogg',
  scan_ping:     '/assets/sounds/scan_ping.ogg',
  scan_done:     '/assets/sounds/maximize_001.ogg',
  discovery:     '/assets/sounds/maximize_004.ogg',

  // Warnings / alarms / alerts
  storm_warning: '/assets/sounds/glitch_002.ogg',
  storm_pulse:   '/assets/sounds/glitch_001.ogg',
  solar_flare:   '/assets/sounds/solar_flare.ogg',
  error:         '/assets/sounds/error_004.ogg',
  error_soft:    '/assets/sounds/error_002.ogg',
  low_battery:   '/assets/sounds/minimize_007.ogg',
  power_off:     '/assets/sounds/minimize_004.ogg',
  drop:          '/assets/sounds/drop_004.ogg',

  // Sci-Fi Base & Atmospheric
  airlock_open:  '/assets/sounds/airlock_open.ogg',
  airlock_close: '/assets/sounds/airlock_close.ogg',
  shield_active: '/assets/sounds/shield_active.ogg',
  rover_engine:  '/assets/sounds/rover_engine.ogg',
  ambient_drone: '/assets/sounds/ambient_drone.ogg',

  // Info / glossary / timer
  glossary_open: '/assets/sounds/question_001.ogg',
  bong:          '/assets/sounds/bong_001.ogg',
  sunset:        '/assets/sounds/bong_001.ogg',

  // Slider ticks
  tick:          '/assets/sounds/tick_001.ogg',
  tick_soft:     '/assets/sounds/tick_002.ogg',
}

// ---- Audio Graph State -----------------------------------------------------
let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let sfxGain: GainNode | null = null
let musicGain: GainNode | null = null

const cache: Map<string, AudioBuffer> = new Map()

// Active loops: key -> { source, gainNode }
interface ActiveLoop {
  source: AudioBufferSourceNode
  gainNode: GainNode
}
const activeLoops: Map<string, ActiveLoop> = new Map()

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()

    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
    masterGain.gain.value = _muted ? 0 : getSavedVolume()

    sfxGain = audioCtx.createGain()
    sfxGain.connect(masterGain)
    sfxGain.gain.value = 1.0

    musicGain = audioCtx.createGain()
    musicGain.connect(masterGain)
    musicGain.gain.value = _musicMuted ? 0 : 0.45
  }
  return audioCtx
}

// ---- Persistence -----------------------------------------------------------
const VOLUME_KEY     = 'outpost_zero_volume'
const MUTE_KEY       = 'outpost_zero_muted'
const MUSIC_MUTE_KEY = 'outpost_zero_music_muted'

function getSavedVolume(): number {
  try { return parseFloat(localStorage.getItem(VOLUME_KEY) ?? '0.75') } catch { return 0.75 }
}
function getSavedMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true' } catch { return false }
}
function getSavedMusicMuted(): boolean {
  try { return localStorage.getItem(MUSIC_MUTE_KEY) === 'true' } catch { return false }
}

let _muted = getSavedMuted()
let _musicMuted = getSavedMusicMuted()

export function isMuted(): boolean { return _muted }
export function isMusicMuted(): boolean { return _musicMuted }

export function setMuted(v: boolean) {
  _muted = v
  if (masterGain) {
    masterGain.gain.value = v ? 0 : getSavedVolume()
  }
  try { localStorage.setItem(MUTE_KEY, String(v)) } catch { /* ignore */ }
}

export function setMusicMuted(v: boolean) {
  _musicMuted = v
  if (musicGain) {
    musicGain.gain.value = v ? 0 : 0.45
  }
  try { localStorage.setItem(MUSIC_MUTE_KEY, String(v)) } catch { /* ignore */ }
}

export function setVolume(v: number) {
  const clamped = Math.max(0, Math.min(1, v))
  try { localStorage.setItem(VOLUME_KEY, String(clamped)) } catch { /* ignore */ }
  if (masterGain && !_muted) {
    masterGain.gain.value = clamped
  }
}

export function getVolume(): number {
  return getSavedVolume()
}

// ---- Audio Buffer Loader ---------------------------------------------------
async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (cache.has(url)) return cache.get(url)!
  try {
    const ctx = getAudioCtx()
    const res = await fetch(url)
    if (!res.ok) return null
    const ab = await res.arrayBuffer()
    const buf = await ctx.decodeAudioData(ab)
    cache.set(url, buf)
    return buf
  } catch {
    return null
  }
}

// ---- One-shot SFX Playback -------------------------------------------------
export async function playSound(
  name: string,
  opts: { volume?: number; playbackRate?: number } = {},
) {
  if (_muted) return
  const path = SOUND_MAP[name]
  if (!path) {
    console.warn(`[sound] unknown key: ${name}`)
    return
  }
  const ctx = getAudioCtx()

  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const buf = await loadBuffer(path)
  if (!buf) return

  const src = ctx.createBufferSource()
  src.buffer = buf
  src.playbackRate.value = opts.playbackRate ?? 1

  const gainNode = ctx.createGain()
  gainNode.gain.value = opts.volume ?? 1
  src.connect(gainNode)
  gainNode.connect(sfxGain!)

  src.start()
}

export function sfx(name: string, opts?: { volume?: number; playbackRate?: number }) {
  playSound(name, opts).catch(() => {/* silent */})
}

// ---- Audio Loops (Rover engine, Drone, Scanning) ---------------------------
export async function startLoop(
  loopId: string,
  soundName: string,
  opts: { volume?: number; playbackRate?: number; fadeIn?: number } = {},
) {
  if (activeLoops.has(loopId)) return // already running
  const path = SOUND_MAP[soundName]
  if (!path) return

  const ctx = getAudioCtx()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const buf = await loadBuffer(path)
  if (!buf) return

  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  src.playbackRate.value = opts.playbackRate ?? 1

  const gainNode = ctx.createGain()
  const targetVol = opts.volume ?? 1
  const fadeIn = opts.fadeIn ?? 0.15

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + fadeIn)

  src.connect(gainNode)
  gainNode.connect(sfxGain!)

  src.start()
  activeLoops.set(loopId, { source: src, gainNode })
}

export function stopLoop(loopId: string, fadeOut: number = 0.2) {
  const loop = activeLoops.get(loopId)
  if (!loop) return

  const ctx = getAudioCtx()
  const now = ctx.currentTime

  loop.gainNode.gain.cancelScheduledValues(now)
  loop.gainNode.gain.setValueAtTime(loop.gainNode.gain.value, now)
  loop.gainNode.gain.linearRampToValueAtTime(0, now + fadeOut)

  setTimeout(() => {
    try {
      loop.source.stop()
      loop.source.disconnect()
      loop.gainNode.disconnect()
    } catch { /* already stopped */ }
    activeLoops.delete(loopId)
  }, Math.max(10, fadeOut * 1000 + 50))
}

export function setLoopVolume(loopId: string, volume: number) {
  const loop = activeLoops.get(loopId)
  if (!loop) return
  const ctx = getAudioCtx()
  loop.gainNode.gain.setValueAtTime(volume, ctx.currentTime)
}

// ---- Generative Space Ambient Music Synthesizer ----------------------------
// Procedural ambient space synth: serene, cinematic chords with soft lowpass filter
// and gentle shimmering harmonics. Generates zero network traffic, ultra-lightweight.

let musicRunning = false
let musicTimer: number | null = null

// Ambient space chords in frequencies (Hz):
// 1. Dm9 (D3, F3, A3, C4, E4)
// 2. Bbmaj7 (Bb2, D3, F3, A3, D4)
// 3. Fsus2 (F2, C3, G3, A3, C4)
// 4. Csus4 (C3, G3, C4, F4, G4)
// 5. Asus4 (A2, E3, A3, D4, E4)
const SPACE_CHORDS = [
  [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
  [116.54, 146.83, 174.61, 220.00, 293.66], // Bbmaj7
  [87.31,  130.81, 196.00, 220.00, 261.63], // Fsus2
  [130.81, 196.00, 261.63, 349.23, 392.00], // Csus4
  [110.00, 164.81, 220.00, 293.66, 329.63], // Asus4
]

let currentChordIndex = 0

function playNextAmbientChord() {
  if (!musicRunning) return
  const ctx = getAudioCtx()
  if (ctx.state === 'suspended') return

  const chord = SPACE_CHORDS[currentChordIndex % SPACE_CHORDS.length]
  currentChordIndex++

  const chordDuration = 7.5 // seconds per chord
  const now = ctx.currentTime

  // Filter node with gentle warmth
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(450, now)
  filter.frequency.exponentialRampToValueAtTime(700, now + chordDuration * 0.5)
  filter.frequency.exponentialRampToValueAtTime(420, now + chordDuration)

  const chordGain = ctx.createGain()
  chordGain.gain.setValueAtTime(0, now)
  chordGain.gain.linearRampToValueAtTime(0.08, now + 2.0) // gentle fade-in
  chordGain.gain.setValueAtTime(0.08, now + chordDuration - 2.5)
  chordGain.gain.linearRampToValueAtTime(0, now + chordDuration) // gentle fade-out

  filter.connect(chordGain)
  chordGain.connect(musicGain!)

  // Play each note with subtle detune for a lush, analog space pad sound
  chord.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = i === 0 ? 'sine' : (i % 2 === 0 ? 'triangle' : 'sine')
    osc.frequency.setValueAtTime(freq, now)
    // Tiny detuning (cents) for lushness
    osc.detune.setValueAtTime((i % 2 === 0 ? 4 : -4), now)

    osc.connect(filter)
    osc.start(now)
    osc.stop(now + chordDuration)
  })

  // Optional: subtle high celestial chime (sparkle of distant stars)
  if (Math.random() > 0.4) {
    const chimeFreq = chord[chord.length - 1] * 2
    const chimeOsc = ctx.createOscillator()
    chimeOsc.type = 'sine'
    chimeOsc.frequency.setValueAtTime(chimeFreq, now + 2.5)

    const chimeGain = ctx.createGain()
    chimeGain.gain.setValueAtTime(0, now + 2.5)
    chimeGain.gain.linearRampToValueAtTime(0.025, now + 2.8)
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5)

    chimeOsc.connect(chimeGain)
    chimeGain.connect(musicGain!)
    chimeOsc.start(now + 2.5)
    chimeOsc.stop(now + 5.6)
  }

  // Schedule next chord before this one finishes for a smooth crossfade
  musicTimer = window.setTimeout(playNextAmbientChord, (chordDuration - 1.8) * 1000)
}

export function startAmbientMusic() {
  if (musicRunning) return
  musicRunning = true
  const ctx = getAudioCtx()
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      playNextAmbientChord()
    }).catch(() => {/* ignore */})
  } else {
    playNextAmbientChord()
  }
}

export function stopAmbientMusic() {
  musicRunning = false
  if (musicTimer !== null) {
    clearTimeout(musicTimer)
    musicTimer = null
  }
}
