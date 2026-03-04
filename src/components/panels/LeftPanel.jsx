import React from 'react'
import Controls from './Controls.jsx'
import ThreatsTable from './ThreatsTable.jsx'

export default function LeftPanel({ onStartScenario, onReset }) {
  return (
    <aside className="w-64 flex flex-col border-r border-mil-border bg-mil-panel shrink-0 overflow-hidden">
      <div className="p-3 border-b border-mil-border shrink-0">
        <PanelHeader>CONTROL</PanelHeader>
        <div className="mt-2">
          <Controls onStartScenario={onStartScenario} onReset={onReset} />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-3">
        <PanelHeader>THREAT TRACKS</PanelHeader>
        <div className="flex-1 overflow-hidden mt-2 flex flex-col">
          <ThreatsTable />
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
