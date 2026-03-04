import React, { useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap } from 'react-leaflet'
import { useSimStore } from '../../store/useSimStore.js'
import CanvasOverlay from './CanvasOverlay.jsx'

function MapInteraction({ mapRef, onMapClick }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  if (!mapRef.current) mapRef.current = map
  return null
}

function FlyToController() {
  const map = useMap()
  const focusedThreat = useSimStore(s => s.focusedThreat)
  const setFocusedThreat = useSimStore(s => s.setFocusedThreat)
  const prevRef = useRef(null)

  useEffect(() => {
    if (!focusedThreat) return
    if (prevRef.current?.lat === focusedThreat.lat && prevRef.current?.lng === focusedThreat.lng) return
    prevRef.current = focusedThreat
    map.flyTo([focusedThreat.lat, focusedThreat.lng], Math.max(map.getZoom(), 7), {
      duration: 0.8,
    })
    setFocusedThreat(null)
  }, [focusedThreat, map, setFocusedThreat])

  return null
}

export default function SimMap({ canvasRef, mapRef, onMapClick, mode }) {
  const batteries = useSimStore(s => s.batteries)
  const impactZones = useSimStore(s => s.impactZones)

  const handleMapReady = useCallback((map) => {
    mapRef.current = map
  }, [mapRef])

  const cursorClass = mode === 'observe'
    ? ''
    : 'cursor-crosshair'

  return (
    <div className={`relative w-full h-full ${cursorClass}`}>
      <MapContainer
        center={[30, 43]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        whenReady={(e) => handleMapReady(e.target)}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        <MapInteraction mapRef={mapRef} onMapClick={onMapClick} />
        <FlyToController />
        <CanvasOverlay canvasRef={canvasRef} />

        {batteries.map(battery => (
          <CircleMarker
            key={battery.id}
            center={[battery.lat, battery.lng]}
            radius={1}
            pathOptions={{ opacity: 0, fillOpacity: 0 }}
          >
            <Tooltip permanent direction="top" offset={[0, -14]}>
              <div style={{
                background: 'rgba(10,14,20,0.92)',
                border: `1px solid ${battery.color}`,
                color: battery.color,
                fontSize: '9px',
                fontFamily: 'monospace',
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}>
                {battery.name}
                <br />
                <span style={{ opacity: 0.7 }}>
                  {battery.interceptorsAvailable}/{battery.interceptorsTotal} ready
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {impactZones.map(zone => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={10}
            pathOptions={{
              color: '#ff3333',
              weight: 2,
              fillColor: '#ff0000',
              fillOpacity: 0.15,
            }}
          />
        ))}
      </MapContainer>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />

      {mode !== 'observe' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] bg-mil-panel border border-mil-yellow text-mil-yellow text-xs font-mono px-4 py-2 pointer-events-none">
          {mode === 'placing-origin'
            ? '▶ Click map to set LAUNCH ORIGIN'
            : '▶ Click map to set TARGET'}
        </div>
      )}
    </div>
  )
}
