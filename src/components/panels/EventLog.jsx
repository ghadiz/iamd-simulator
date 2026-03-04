import React, { useRef, useEffect } from 'react'
import { useSimStore } from '../../store/useSimStore.js'

const EVENT_STYLES = {
  info:    'text-mil-accent',
  warn:    'text-mil-yellow',
  danger:  'text-mil-red',
  success: 'text-mil-green',
}

const EVENT_PREFIX = {
  info:    '◈',
  warn:    '▲',
  danger:  '✕',
  success: '✓',
}

export default function EventLog() {
  const events = useSimStore(s => s.events)
  const scrollRef = useRef(null)

  useEffect(() => {
    // Auto-scroll to top (newest events at top)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [events.length])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-px">
      {events.length === 0 && (
        <div className="text-mil-dim text-xs text-center py-4">
          AWAITING EVENTS...
        </div>
      )}
      {events.map(ev => (
        <EventEntry key={ev.id} event={ev} />
      ))}
    </div>
  )
}

function EventEntry({ event }) {
  const style = EVENT_STYLES[event.type] || 'text-gray-400'
  const prefix = EVENT_PREFIX[event.type] || '·'

  return (
    <div className={`log-entry flex gap-1.5 py-0.5 text-[10px] font-mono leading-tight ${style}`}>
      <span className="shrink-0 mt-0.5">{prefix}</span>
      <span className="break-all">{event.text}</span>
    </div>
  )
}
