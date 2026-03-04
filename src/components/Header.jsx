import React from 'react'
import { useSimStore } from '../store/useSimStore.js'

export default function Header() {
  const running = useSimStore(s => s.running)
  const stats = useSimStore(s => s.stats)
  const mode = useSimStore(s => s.mode)

  const now = new Date()
  const timeStr = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z'

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-mil-border bg-mil-panel shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-mil-green animate-pulse" />
        <span className="text-mil-accent font-bold text-sm tracking-widest uppercase">
          IAMD
        </span>
        <span className="text-gray-500 text-xs">|</span>
        <span className="text-gray-400 text-xs tracking-wider">
          Integrated Air & Missile Defense Simulator
        </span>
      </div>

      <div className="flex items-center gap-6">
        <StatChip label="LAUNCHED" value={stats.launched} color="text-mil-yellow" />
        <StatChip label="INTERCEPTED" value={stats.intercepted} color="text-mil-green" />
        <StatChip label="HITS" value={stats.hits} color="text-mil-red" />
        <div className={`text-xs font-bold tracking-widest px-2 py-0.5 border ${
          running
            ? 'border-mil-green text-mil-green'
            : 'border-mil-dim text-mil-dim'
        }`}>
          {running ? '● LIVE' : '○ STANDBY'}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mode !== 'observe' && (
          <span className="text-mil-yellow text-xs font-bold uppercase tracking-wider blink">
            {mode === 'placing-origin' ? '▶ CLICK: SET ORIGIN' : '▶ CLICK: SET TARGET'}
          </span>
        )}
        <span className="text-mil-dim text-xs font-mono">{timeStr}</span>
      </div>
    </header>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-mil-dim text-xs">{label}:</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}
