import React from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import PipBar from '../ui/PipBar.jsx'

const STATUS_STYLE = {
  READY: 'border-mil-green text-mil-green',
  ENGAGING: 'border-mil-yellow text-mil-yellow',
  RELOADING: 'border-mil-orange text-mil-orange',
  OFFLINE: 'border-mil-dim text-mil-dim',
}

const SYSTEM_LABELS = {
  arrow3: 'Arrow-3',
  arrow2: 'Arrow-2',
  thaad: 'THAAD',
  pac3: 'PAC-3',
  iron_dome: 'Iron Dome',
}

export default function BatteryList() {
  const batteries = useSimStore(s => s.batteries)

  if (batteries.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-mil-dim text-xs">
        LOADING...
      </div>
    )
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-full">
      {batteries.map(battery => (
        <BatteryCard key={battery.id} battery={battery} />
      ))}
    </div>
  )
}

function BatteryCard({ battery }) {
  const statusStyle = STATUS_STYLE[battery.status] || STATUS_STYLE.OFFLINE
  const pct = battery.interceptorsAvailable / battery.interceptorsTotal

  return (
    <div
      className="panel-bg p-2.5 rounded-sm"
      style={{ borderLeftColor: battery.color, borderLeftWidth: 2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-xs font-bold text-gray-200 leading-tight">{battery.name}</div>
          <div className="text-[10px] text-mil-dim">{SYSTEM_LABELS[battery.system] || battery.system}</div>
        </div>
        <span className={`text-[9px] font-bold tracking-widest border px-1.5 py-0.5 ${statusStyle}`}>
          {battery.status}
        </span>
      </div>

      {/* Pip bar */}
      <div className="mb-1.5">
        <PipBar
          available={battery.interceptorsAvailable}
          total={battery.interceptorsTotal}
          color={battery.color}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between text-[10px] text-mil-dim">
        <span>{battery.interceptorsAvailable}/{battery.interceptorsTotal} interceptors</span>
        <span
          className="font-mono"
          style={{ color: pct > 0.5 ? '#00ff88' : pct > 0.2 ? '#ffd600' : '#ff3333' }}
        >
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  )
}
