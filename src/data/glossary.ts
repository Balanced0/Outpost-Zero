// Glossary of terms for Outpost Zero "Why?" buttons
// Plain, kid-friendly explanations (one or two sentences each).

export interface GlossaryEntry {
  title: string
  explanation: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  radiation: {
    title: 'Radiation',
    explanation: 'Radiation is invisible energy from the Sun. Too much can make astronauts sick.',
  },
  'solar flare': {
    title: 'Solar Flare',
    explanation: 'A solar flare is a sudden flash of energy from the Sun.',
  },
  shield: {
    title: 'Radiation Shield',
    explanation: 'A shield is a thick layer that blocks radiation. More shield power means more protection.',
  },
  'rover battery': {
    title: 'Rover Battery',
    explanation: 'The rover runs on a battery. Driving and scanning use it up, and it recharges at the base.',
  },
  sunset: {
    title: 'Martian Sunset',
    explanation: 'On Mars it gets very cold and dark at night, and solar panels stop making power. Rovers must be careful about night.',
  },
  scan: {
    title: 'Scientific Scanning',
    explanation: 'Scientists use instruments to study rocks and ice. That is how we learn if Mars once had water.',
  },
  'comms delay': {
    title: 'Comms Delay',
    explanation:
      'Radio signals travel at the speed of light, but Mars is so far away that messages take minutes. So rover teams send a plan and wait for the answer.',
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
    explanation: 'A key scientific concept used by NASA mission teams exploring Mars.',
  }
}

