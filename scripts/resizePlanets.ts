import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function resizePlanets() {
  const inputDir = path.resolve(process.cwd(), 'kenney_planets/Planets')
  const outputDir = path.resolve(process.cwd(), 'public/assets/menu')

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`)
    process.exit(1)
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const files = fs.readdirSync(inputDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()

  console.log(`Found ${files.length} planet images in ${inputDir}...`)
  console.log('------------------------------------------------------------')
  console.log('Planet | Original Size | Resized (<=600px) | Format')
  console.log('------------------------------------------------------------')

  for (const file of files) {
    const srcPath = path.join(inputDir, file)
    const destPath = path.join(outputDir, file)

    const beforeStats = fs.statSync(srcPath)
    const beforeKb = Math.round(beforeStats.size / 1024)

    // Resize to max 600px width/height, maintaining aspect ratio, png optimization
    await sharp(srcPath)
      .resize({
        width: 600,
        height: 600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({
        compressionLevel: 9,
        palette: true,
      })
      .toFile(destPath)

    const afterStats = fs.statSync(destPath)
    const afterKb = Math.round(afterStats.size / 1024)

    console.log(`${file.padEnd(12)} | ${String(beforeKb).padStart(5)} KB | ${String(afterKb).padStart(5)} KB | PNG 600px`)
  }

  console.log('------------------------------------------------------------')
  console.log(`Successfully saved resized planet images to ${outputDir}`)
}

resizePlanets().catch((err) => {
  console.error('Resize failed:', err)
  process.exit(1)
})

