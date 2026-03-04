import React from 'react'

const PHASE_STYLES = {
  BOOST: 'border-mil-red text-mil-red bg-red-950/30',
  MIDCOURSE: 'border-mil-yellow text-mil-yellow bg-yellow-950/30',
  TERMINAL: 'border-mil-orange text-mil-orange bg-orange-950/30',
}

export default function PhaseTag({ phase }) {
  const style = PHASE_STYLES[phase] || 'border-mil-dim text-mil-dim'
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-widest border uppercase ${style}`}>
      {phase}
    </span>
  )
}
