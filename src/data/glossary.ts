// Glossary of terms for Outpost Zero "?" cards
// Plain, kid-friendly explanations (one or two sentences each).
import { PlanetId } from '../config/planets'

export interface GlossaryEntry {
  title: string
  emoji: string
  explanation: string
}

export function getGlossaryEntry(term: string, planet: PlanetId = 'mars'): GlossaryEntry {
  const isMoon = planet === 'moon'
  const normalized = term.toLowerCase().trim()

  const entries: Record<string, GlossaryEntry> = {
    radiation: {
      title: 'Radiation',
      emoji: '☢️',
      explanation:
        'Radiation is invisible energy from the Sun. Too much can make astronauts sick, so the crew needs a good shield every day.',
    },
    'solar flare': {
      title: 'Solar Flare',
      emoji: '☀️',
      explanation: isMoon
        ? 'A solar flare is a sudden burst of energy from the Sun. It sends a wave of radiation racing toward the Moon.'
        : 'A solar flare is a sudden burst of energy from the Sun. It sends a wave of radiation racing toward Mars.',
    },
    shield: {
      title: 'Radiation Shield',
      emoji: '🛡️',
      explanation:
        'A shield is a thick layer of material that blocks radiation. More shield power means more protection for the crew.',
    },
    'rover battery': {
      title: 'Rover Battery',
      emoji: '🔋',
      explanation:
        'The rover runs on a battery. Driving and scanning use it up, and it recharges when you park at the base.',
    },
    sunset: {
      title: isMoon ? 'Lunar Night' : 'Martian Sunset',
      emoji: isMoon ? '🌑' : '🌅',
      explanation: isMoon
        ? 'On the Moon, a night lasts about two weeks. It gets extremely cold and solar panels stop making power.'
        : 'At night on Mars it gets bitterly cold and solar panels stop making power. The rover must be home before dark.',
    },
    scan: {
      title: 'Scientific Scanning',
      emoji: '🔬',
      explanation: isMoon
        ? 'Scientists study rocks and ice to learn how the Moon formed and if it has water.'
        : 'Scientists use instruments to study rocks and ice up close. That is how we learn if Mars once had water.',
    },
    'comms delay': {
      title: 'Comms Delay',
      emoji: '📡',
      explanation: isMoon
        ? 'Radio signals travel at the speed of light, taking about 1.3 seconds to reach the Moon. Teams must plan ahead and wait for the reply.'
        : 'Radio signals travel at the speed of light, but Mars is so far away that messages take minutes to arrive. Teams must plan ahead and wait for the reply.',
    },
    air: {
      title: 'Air Supply',
      emoji: '🫁',
      explanation: isMoon
        ? 'The air machine maintains life support and recycles breathable oxygen inside the outpost. Without enough power, it starts to run low.'
        : 'The air machine turns CO₂ from the Martian atmosphere into breathable oxygen. Without enough power, it starts to run low.',
    },
  }

  if (entries[normalized]) {
    return entries[normalized]
  }

  // Substring search fallback
  for (const [key, value] of Object.entries(entries)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return {
    title: term,
    emoji: '🚀',
    explanation: `A key scientific concept used by NASA mission teams exploring ${isMoon ? 'the Moon' : 'Mars'}.`,
  }
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  radiation: getGlossaryEntry('radiation', 'mars'),
  'solar flare': getGlossaryEntry('solar flare', 'mars'),
  shield: getGlossaryEntry('shield', 'mars'),
  'rover battery': getGlossaryEntry('rover battery', 'mars'),
  sunset: getGlossaryEntry('sunset', 'mars'),
  scan: getGlossaryEntry('scan', 'mars'),
  'comms delay': getGlossaryEntry('comms delay', 'mars'),
  air: getGlossaryEntry('air', 'mars'),
}
