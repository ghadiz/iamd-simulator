import React from 'react'
import { useSimStore } from '../../store/useSimStore.js'

export default function StatsPanel() {
  const stats = useSimStore(s => s.stats)
  const { launched, intercepted, hits, missed } = stats
  const interceptRate = launched > 0 ? Math.round((intercepted / launched) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-2 p-2 panel-bg rounded-sm">
      <StatBox label="LAUNCHED" value={launched} color="#ffd600" />
      <StatBox label="INTERCEPTED" value={intercepted} color="#00ff88" />
      <StatBox label="HITS" value={hits} color="#ff3333" />
      <StatBox label="INT. RATE" value={`${interceptRate}%`} color="#00b4d8" />
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="flex flex-col items-center py-1.5 border border-mil-border rounded-sm bg-mil-bg/50">
      <span className="text-[10px] text-mil-dim uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  )
}
