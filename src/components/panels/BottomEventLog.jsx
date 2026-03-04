import React, { useState, useRef, useEffect } from 'react'
import { useSimStore } from '../../store/useSimStore.js'

const EVENT_STYLES = {
  info:    { text: 'text-mil-accent',  prefix: '◈', bar: 'bg-mil-accent' },
  warn:    { text: 'text-mil-yellow',  prefix: '▲', bar: 'bg-mil-yellow' },
  danger:  { text: 'text-mil-red',     prefix: '✕', bar: 'bg-mil-red'    },
  success: { text: 'text-mil-green',   prefix: '✓', bar: 'bg-mil-green'  },
}

export default function BottomEventLog() {
  const [visible, setVisible] = useState(true)
  const events = useSimStore(s => s.events)
  const scrollRef = useRef(null)

  // Auto-scroll to top (newest first)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [events.length])

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[2000] flex flex-col items-center"
      style={{ width: '560px', maxWidth: '60vw' }}
    >
      {/* Log panel */}
      <div
        className="w-full transition-all duration-300 overflow-hidden"
        style={{ maxHeight: visible ? '220px' : '0px' }}
      >
        <div className="w-full border border-mil-border border-b-0 bg-mil-bg/90 backdrop-blur-sm">
          {/* Header row */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-mil-border">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-mil-accent" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-mil-accent">
                Event Log
              </span>
              <span className="text-[10px] text-mil-dim">
                ({events.length})
              </span>
            </div>
          </div>

          {/* Scrollable entries */}
          <div ref={scrollRef} className="overflow-y-auto px-3 py-2 space-y-px" style={{ maxHeight: '172px' }}>
            {events.length === 0 ? (
              <div className="text-mil-dim text-[10px] text-center py-3">
                AWAITING EVENTS...
              </div>
            ) : (
              events.map(ev => <EventEntry key={ev.id} event={ev} />)
            )}
          </div>
        </div>
      </div>

      {/* Toggle button — always visible */}
      <button
        onClick={() => setVisible(v => !v)}
        className="flex items-center gap-2 px-4 py-1 border border-mil-border border-t-0 bg-mil-panel/95 backdrop-blur-sm text-[10px] font-bold tracking-widest uppercase text-mil-dim hover:text-mil-accent hover:border-mil-accent transition-all duration-150 cursor-pointer"
      >
        <span>{visible ? '▼' : '▲'}</span>
        <span>Event Log</span>
        {!visible && events.length > 0 && (
          <span className="ml-1 text-mil-accent">{events.length}</span>
        )}
      </button>
    </div>
  )
}

function EventEntry({ event }) {
  const style = EVENT_STYLES[event.type] || { text: 'text-gray-400', prefix: '·', bar: 'bg-gray-600' }
  return (
    <div className={`log-entry flex gap-2 py-0.5 text-[10px] font-mono leading-snug ${style.text}`}>
      <span className="shrink-0">{style.prefix}</span>
      <span className="break-all opacity-90">{event.text}</span>
    </div>
  )
}
