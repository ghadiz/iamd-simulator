import React from 'react'
import BatteryList from './BatteryList.jsx'
import StatsPanel from './StatsPanel.jsx'

export default function RightPanel() {
  return (
    <aside className="w-72 flex flex-col border-l border-mil-border bg-mil-panel shrink-0 overflow-hidden">
      {/* Stats */}
      <div className="p-3 border-b border-mil-border shrink-0">
        <PanelHeader>ENGAGEMENT STATS</PanelHeader>
        <div className="mt-2">
          <StatsPanel />
        </div>
      </div>

      {/* Battery status */}
      <div className="p-3 flex flex-col flex-1 overflow-hidden">
        <PanelHeader>BATTERY STATUS</PanelHeader>
        <div className="mt-2 overflow-y-auto flex-1">
          <BatteryList />
        </div>
      </div>
    </aside>
  )
}

function PanelHeader({ children }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-1.5 h-1.5 bg-mil-accent" />
      <span className="text-[10px] font-bold tracking-widest uppercase text-mil-accent">
        {children}
      </span>
    </div>
  )
}
