// Glossary of terms for Outpost Zero "?" cards
// Plain, kid-friendly explanations (one or two sentences each).

export interface GlossaryEntry {
  title: string
  emoji: string
  explanation: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  radiation: {
    title: 'Radiation',
    emoji: '☢️',
    explanation:
      'Radiation is invisible energy from the Sun. Too much can make astronauts sick, so the crew needs a good shield every day.',
  },
  'solar flare': {
    title: 'Solar Flare',
    emoji: '☀️',
    explanation:
      'A solar flare is a sudden burst of energy from the Sun. It sends a wave of radiation racing toward Mars.',
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
    title: 'Martian Sunset',
    emoji: '🌅',
    explanation:
      'At night on Mars it gets bitterly cold and solar panels stop making power. The rover must be home before dark.',
  },
  scan: {
    title: 'Scientific Scanning',
    emoji: '🔬',
    explanation:
      'Scientists use instruments to study rocks and ice up close. That is how we learn if Mars once had water.',
  },
  'comms delay': {
    title: 'Comms Delay',
    emoji: '📡',
    explanation:
      'Radio signals travel at the speed of light, but Mars is so far away that messages take minutes to arrive. Teams must plan ahead and wait for the reply.',
  },
  air: {
    title: 'Air Supply',
    emoji: '🫁',
    explanation:
      'The air machine turns CO₂ from the Martian atmosphere into breathable oxygen. Without enough power, it starts to run low.',
  },
}

export function getGlossaryEntry(term: string): GlossaryEntry {
  const normalized = term.toLowerCase().trim()
  if (GLOSSARY[normalized]) {
    return GLOSSARY[normalized]
  }

  // Substring search fallback
  for (const [key, value] of Object.entries(GLOSSARY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return {
    title: term,
    emoji: '🚀',
    explanation: 'A key scientific concept used by NASA mission teams exploring Mars.',
  }
}
