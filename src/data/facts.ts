// static, saved data
// Real NASA facts for Outpost Zero, written in clear and kid-friendly language.
// Each fact includes text, sourceName, and sourceUrl (empty if pending verification).

export interface NasaFact {
  text: string
  sourceName: string
  sourceUrl: string
}

export const NASA_FACTS: NasaFact[] = [
  {
    text: "Mars looks reddish-orange because its soil is packed with iron minerals that oxidized, just like rust on an old bicycle.",
    sourceName: "NASA Science Mars Exploration",
    sourceUrl: "",
  },
  {
    text: "A single day on Mars is called a 'sol', and it lasts 24 hours, 39 minutes, and 35 seconds—just slightly longer than a day on Earth.",
    sourceName: "NASA Mars Exploration",
    sourceUrl: "",
  },
  {
    text: "NASA rovers like Perseverance and Curiosity are about the size of a car and use cameras on tall masts to scout safe paths.",
    sourceName: "NASA JPL Perseverance Mission",
    sourceUrl: "",
  },
  {
    text: "Mars is home to Olympus Mons, the largest volcano in our Solar System, standing nearly three times taller than Mount Everest.",
    sourceName: "NASA Solar System Exploration",
    sourceUrl: "",
  },
  {
    text: "Because the atmosphere on Mars is so thin, nighttime temperatures can plunge below minus 100 degrees Celsius.",
    sourceName: "NASA Goddard Space Flight Center",
    sourceUrl: "",
  },
  {
    text: "NASA scientists send commands to rovers once a day, and radio signals can take up to 24 minutes to travel between Earth and Mars.",
    sourceName: "NASA Deep Space Network",
    sourceUrl: "",
  },
  {
    text: "Martian dust storms can sometimes grow so massive that they blanket the entire planet in red dust for weeks at a time.",
    sourceName: "NASA Mars Exploration",
    sourceUrl: "",
  },
  {
    text: "NASA rovers have special aluminum wheels with grooved treads designed to grip loose sand and roll over sharp Martian rocks.",
    sourceName: "NASA JPL Robotics",
    sourceUrl: "",
  },
]

export function getRandomFact(): string {
  const index = Math.floor(Math.random() * NASA_FACTS.length)
  return NASA_FACTS[index].text
}
