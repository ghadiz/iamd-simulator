import React from 'react'

export default function PipBar({ available, total, color = '#00ff88' }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 border"
          style={{
            borderColor: color,
            backgroundColor: i < available ? color : 'transparent',
            opacity: i < available ? 0.85 : 0.25,
          }}
          title={`${available}/${total} interceptors ready`}
        />
      ))}
    </div>
  )
}
