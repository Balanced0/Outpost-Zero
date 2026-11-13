import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import PreloadScene from '../scenes/PreloadScene'
import MarsScene from '../scenes/MarsScene'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
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
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}
