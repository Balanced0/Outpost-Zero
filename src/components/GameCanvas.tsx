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

    const container = containerRef.current
    if (!container) return

    // Guard against React StrictMode creating duplicate game instances
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }

    // Scale mode RESIZE with parent set to container.
    // Do NOT set fixed width/height in config so Phaser derives size from the container.
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: container,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      backgroundColor: '#1a0a00',
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [PreloadScene, MarsScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    const resizeGame = () => {
      const g = gameRef.current
      const c = containerRef.current
      if (!g || !c) return

      // Use container's actual dimensions; fallback to window viewport
      const w = c.clientWidth || window.innerWidth
      const h = c.clientHeight || window.innerHeight
      if (w <= 0 || h <= 0) return

      // Resize the canvas display and internal game dimensions
      g.scale.resize(w, h)

      // Refresh MarsScene camera, zoom, bounds, and ground coverage
      const marsScene = g.scene.getScene('MarsScene') as MarsScene | undefined
      if (marsScene && marsScene.scene?.isActive()) {
        marsScene.refreshViewport(w, h)
      }
    }

    // ResizeObserver catches container size changes (both shrinking and expanding)
    const resizeObserver = new ResizeObserver(() => {
      resizeGame()
    })
    resizeObserver.observe(container)

    window.addEventListener('resize', resizeGame)
    window.addEventListener('orientationchange', resizeGame)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeGame)
      window.removeEventListener('orientationchange', resizeGame)
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
      id="game-container"
      className="fixed inset-0 w-[100vw] h-[100dvh] overflow-hidden m-0 p-0 pointer-events-auto"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
      }}
    />
  )
}
