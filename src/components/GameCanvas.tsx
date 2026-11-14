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
      parent: containerRef.current,
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: containerRef.current,
        autoCenter: Phaser.Scale.NO_CENTER, // autoCenter OFF — matches window size exactly, no letterboxing margins
        width: '100%',
        height: '100%',
      },
      backgroundColor: '#1a0a00',
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [PreloadScene, MarsScene],
    }

    gameRef.current = new Phaser.Game(config)

    const handleResize = () => {
      if (!gameRef.current) return
      const w = window.innerWidth
      const h = window.innerHeight
      gameRef.current.scale.resize(w, h)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [isGameStarted])

  if (!isGameStarted) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-[100vw] h-[100dvh] overflow-hidden m-0 p-0 pointer-events-auto"
    />
  )
}
