import React from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import PhaseTag from '../ui/PhaseTag.jsx'
import { MISSILE_TYPES } from '../../simulation/config.js'



const STATUS_STYLE = {
  active: 'text-mil-red',
  intercepted: 'text-mil-green',
  hit: 'text-gray-500',
}

export default function ThreatsTable() {
  const threats = useSimStore(s => s.threats)
  const setFocusedThreat = useSimStore(s => s.setFocusedThreat)

  if (threats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-mil-dim text-xs">
        NO ACTIVE THREATS
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-mil-panel z-10">
          <tr className="border-b border-mil-border text-mil-dim uppercase tracking-wider">
            <th className="py-1 px-2 text-left font-normal">ID</th>
            <th className="py-1 px-2 text-left font-normal">Type</th>
            <th className="py-1 px-2 text-left font-normal">Phase</th>
            <th className="py-1 px-2 text-right font-normal">%</th>
            <th className="py-1 px-2 text-left font-normal">Status</th>
            <th className="py-1 px-2 text-left font-normal">Engaged</th>
          </tr>
        </thead>
        <tbody>
          {threats.map(t => (
            <ThreatRow key={t.id} threat={t} onFocus={() => setFocusedThreat({ lat: t.lat, lng: t.lng })} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ThreatRow({ threat, onFocus }) {
  const typeConfig = MISSILE_TYPES[threat.type]
  const statusStyle = STATUS_STYLE[threat.status] || 'text-gray-400'
  const isActive = threat.status === 'active'

  return (
    <tr
      onClick={onFocus}
      title="Click to track on map"
      className={`border-b border-mil-border/50 cursor-pointer hover:bg-mil-accent/10 hover:border-mil-accent/30 transition-colors ${isActive ? 'threat-active' : 'opacity-60'}`}
    >
      <td className="py-1 px-2 font-mono text-[10px]" style={{ color: typeConfig?.color || '#aaa' }}>
        {threat.id}
      </td>
      <td className="py-1 px-2 capitalize text-gray-300">{typeConfig?.label || threat.type}</td>
      <td className="py-1 px-2">
        <PhaseTag phase={threat.phase} />
      </td>
      <td className="py-1 px-2 text-right font-mono text-gray-400">
        {(threat.progress * 100).toFixed(0)}%
      </td>
      <td className={`py-1 px-2 uppercase text-[10px] font-bold tracking-wider ${statusStyle}`}>
        {threat.status}
      </td>
      <td className="py-1 px-2 text-[10px] text-mil-accent truncate max-w-[80px]">
        {threat.engagedBy
          ? threat.engagedBy.split('-').slice(0, 2).join('-')
          : <span className="text-mil-dim">—</span>
        }
      </td>
    </tr>
  )
}
