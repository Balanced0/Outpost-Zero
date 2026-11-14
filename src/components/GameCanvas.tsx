import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import PreloadScene from '../scenes/PreloadScene'
import MarsScene from '../scenes/MarsScene'
import { useGameStore } from '../store/gameStore'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const isGameStarted = useGameStore((s) => s.isGameStarted)

  useEffect(() => {
    // Strictly do not create Phaser game until "Launch mission" is pressed
    if (!isGameStarted) {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
      return
    }

    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1a0a00',
      parent: containerRef.current,
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [PreloadScene, MarsScene],
    }

    gameRef.current = new Phaser.Game(config)

    const handleResize = () => {
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [isGameStarted])

  if (!isGameStarted) {
    return null
  }

  return <div ref={containerRef} className="absolute inset-0" />
}
