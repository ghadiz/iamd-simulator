import React, { useRef, useCallback } from 'react'
import Header from './components/Header.jsx'
import SimMap from './components/map/SimMap.jsx'
import LeftPanel from './components/panels/LeftPanel.jsx'
import RightPanel from './components/panels/RightPanel.jsx'
import BottomEventLog from './components/panels/BottomEventLog.jsx'
import { useGameLoop } from './hooks/useGameLoop.js'
import { useSimStore } from './store/useSimStore.js'

export default function App() {
  const canvasRef = useRef(null)
  const mapRef = useRef(null)

  const { startScenario, launchManual, resetAll } = useGameLoop(canvasRef, mapRef)

  const mode = useSimStore(s => s.mode)
  const pendingOrigin = useSimStore(s => s.pendingOrigin)
  const selectedType = useSimStore(s => s.selectedType)
  const setPendingOrigin = useSimStore(s => s.setPendingOrigin)
  const setMode = useSimStore(s => s.setMode)
  const resetSim = useSimStore(s => s.resetSim)

  const handleMapClick = useCallback((lat, lng) => {
    if (mode === 'placing-origin') {
      setPendingOrigin({ lat, lng })
    } else if (mode === 'placing-target' && pendingOrigin) {
      launchManual({
        originLat: pendingOrigin.lat,
        originLng: pendingOrigin.lng,
        targetLat: lat,
        targetLng: lng,
        type: selectedType,
      })
      setMode('observe')
    }
  }, [mode, pendingOrigin, selectedType, setPendingOrigin, launchManual, setMode])

  const handleReset = useCallback(() => {
    resetAll()
    resetSim()
  }, [resetAll, resetSim])

  return (
    <div className="flex flex-col h-screen bg-mil-bg text-gray-300 font-mono overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel onStartScenario={startScenario} onReset={handleReset} />
        <div className="relative flex-1 overflow-hidden">
          <SimMap
            canvasRef={canvasRef}
            mapRef={mapRef}
            onMapClick={handleMapClick}
            mode={mode}
          />
          <BottomEventLog />
        </div>
        <RightPanel />
      </div>
    </div>
  )
}
