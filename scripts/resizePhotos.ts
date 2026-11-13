import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function resizePhotos() {
  const inputDir = path.resolve(process.cwd(), 'assets-originals/nasa')
  const outputDir = path.resolve(process.cwd(), 'public/assets/nasa')

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`)
    process.exit(1)
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const files = fs.readdirSync(inputDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()

  console.log(`Found ${files.length} photos in ${inputDir} to resize...`)
  console.log('------------------------------------------------------------')
  console.log('File Name | Original Size | Resized Size | Reduction')
  console.log('------------------------------------------------------------')

  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    const srcPath = path.join(inputDir, file)
    const destPath = path.join(outputDir, file)

    const beforeStats = fs.statSync(srcPath)
    const beforeBytes = beforeStats.size
    totalBefore += beforeBytes

    // Max width 1200px, keep aspect ratio, never enlarge, JPEG quality 80
    await sharp(srcPath)
      .resize({
        width: 1200,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({
        quality: 80,
        mozjpeg: true,
      })
      .toFile(destPath)

    const afterStats = fs.statSync(destPath)
    const afterBytes = afterStats.size
    totalAfter += afterBytes

    const beforeStr = (beforeBytes / 1024).toFixed(1) + ' KB'
    const afterStr = (afterBytes / 1024).toFixed(1) + ' KB'
    const reduction = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1) + '%'

    console.log(`${file.padEnd(10)} | ${beforeStr.padStart(13)} | ${afterStr.padStart(12)} | ${reduction.padStart(9)}`)
  }

  console.log('------------------------------------------------------------')
  const totalBeforeStr = (totalBefore / (1024 * 1024)).toFixed(2) + ' MB'
  const totalAfterStr = (totalAfter / (1024 * 1024)).toFixed(2) + ' MB'
  const totalReduction = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1) + '%'
  console.log(`TOTAL      | ${totalBeforeStr.padStart(13)} | ${totalAfterStr.padStart(12)} | ${totalReduction.padStart(9)}`)
  console.log('------------------------------------------------------------')
  console.log(`Resized photos successfully saved to: ${outputDir}`)
}

resizePhotos().catch((err) => {
  console.error('Error resizing photos:', err)
  process.exit(1)
})

