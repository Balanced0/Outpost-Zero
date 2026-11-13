// static, saved data
// Real NASA facts for Outpost Zero, written in clear and kid-friendly language.

export const NASA_FACTS: string[] = [
  "Mars looks reddish-orange because its soil is packed with iron minerals that oxidized, just like rust on an old bicycle.",
  "A single day on Mars is called a 'sol', and it lasts 24 hours, 39 minutes, and 35 seconds—just slightly longer than a day on Earth.",
  "NASA rovers like Perseverance and Curiosity are about the size of a car and use cameras on tall masts to scout safe paths.",
  "Mars is home to Olympus Mons, the largest volcano in our Solar System, standing nearly three times taller than Mount Everest.",
  "Because the atmosphere on Mars is so thin, nighttime temperatures can plunge below minus 100 degrees Celsius.",
  "NASA scientists send commands to rovers once a day, and radio signals can take up to 24 minutes to travel between Earth and Mars.",
  "Martian dust storms can sometimes grow so massive that they blanket the entire planet in red dust for weeks at a time.",
  "NASA rovers have special aluminum wheels with grooved treads designed to grip loose sand and roll over sharp Martian rocks."
]

export function getRandomFact(): string {
  const index = Math.floor(Math.random() * NASA_FACTS.length)
  return NASA_FACTS[index]
}

