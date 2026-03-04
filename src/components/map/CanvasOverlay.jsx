import { useEffect, useCallback } from 'react'
import { useMap } from 'react-leaflet'

export default function CanvasOverlay({ canvasRef }) {
  const map = useMap()

  const syncSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = map.getContainer()
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    canvas.style.width = container.clientWidth + 'px'
    canvas.style.height = container.clientHeight + 'px'
  }, [map, canvasRef])

  useEffect(() => {
    syncSize()
    map.on('resize', syncSize)
    map.on('zoom', syncSize)
    return () => {
      map.off('resize', syncSize)
      map.off('zoom', syncSize)
    }
  }, [map, syncSize])

  return null
}
