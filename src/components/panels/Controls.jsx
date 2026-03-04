import React from 'react'
import { SCENARIOS, MISSILE_TYPES } from '../../simulation/config.js'
import { useSimStore } from '../../store/useSimStore.js'

const SCENARIO_LIST = Object.values(SCENARIOS)

const TYPE_LIST = Object.entries(MISSILE_TYPES).map(([key, val]) => ({
  key,
  label: val.label,
  color: val.color,
}))

export default function Controls({ onStartScenario, onReset }) {
  const mode = useSimStore(s => s.mode)
  const selectedType = useSimStore(s => s.selectedType)
  const activeScenario = useSimStore(s => s.activeScenario)
  const running = useSimStore(s => s.running)
  const setMode = useSimStore(s => s.setMode)
  const setSelectedType = useSimStore(s => s.setSelectedType)
  const setActiveScenario = useSimStore(s => s.setActiveScenario)

  const handleScenario = (id) => {
    setActiveScenario(id)
    onStartScenario(id)
  }

  const handleManual = () => {
    if (mode === 'observe') {
      setMode('placing-origin')
    } else {
      setMode('observe')
    }
  }

  return (
    <div className="space-y-3">
      {/* Scenarios */}
      <div>
        <SectionLabel>SCENARIOS</SectionLabel>
        <div className="space-y-1 mt-1">
          {SCENARIO_LIST.map(s => (
            <button
              key={s.id}
              className={`scenario-btn ${activeScenario === s.id && running ? 'active' : ''}`}
              onClick={() => handleScenario(s.id)}
            >
              <div className="font-bold text-[11px] uppercase tracking-wider">{s.name}</div>
              <div className="text-[9px] text-mil-dim mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Missile type */}
      <div>
        <SectionLabel>MISSILE TYPE</SectionLabel>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {TYPE_LIST.map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className="px-2 py-1.5 text-[10px] font-mono font-bold border transition-all duration-150 cursor-pointer"
              style={{
                borderColor: selectedType === t.key ? t.color : '#1e2a3a',
                color: selectedType === t.key ? t.color : '#4a5568',
                backgroundColor: selectedType === t.key ? `${t.color}15` : 'transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual launch */}
      <div>
        <SectionLabel>MANUAL LAUNCH</SectionLabel>
        <button
          onClick={handleManual}
          className={`w-full mt-1 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-150 cursor-pointer ${
            mode !== 'observe'
              ? 'border-mil-yellow text-mil-yellow bg-mil-yellow/10'
              : 'border-mil-dim text-mil-dim hover:border-mil-accent hover:text-mil-accent'
          }`}
        >
          {mode === 'observe' ? '▶ SET LAUNCH POINTS' : '✕ CANCEL'}
        </button>
        {mode !== 'observe' && (
          <p className="text-[9px] text-mil-dim mt-1 text-center">
            {mode === 'placing-origin' ? 'Click map → set origin' : 'Click map → set target'}
          </p>
        )}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-1.5 text-xs font-bold uppercase tracking-wider border border-mil-red/40 text-mil-red/60 hover:border-mil-red hover:text-mil-red transition-all duration-150 cursor-pointer"
      >
        ⟳ RESET ALL
      </button>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[9px] font-bold tracking-widest text-mil-dim uppercase border-b border-mil-border pb-1">
      {children}
    </div>
  )
}
