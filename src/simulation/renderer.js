import { latLngToCanvas, arcOffset, lerp } from './mathUtils.js'
import { MISSILE_TYPES } from './config.js'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

export function drawMissile(ctx, missile, map) {
  const color = MISSILE_TYPES[missile.type].color
  const { arcHeight } = missile.config
  const pt = missile.getCanvasPoint(map)

  const lookAhead = Math.min(missile.progress + 0.03, 0.999)
  const ptAhead = missile.getCanvasPointAt(map, lookAhead)
  const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x)

  if (missile.trail.length > 1) {
    ctx.beginPath()
    for (let i = 0; i < missile.trail.length; i++) {
      const t = missile.trail[i]
      const base = latLngToCanvas(map, t.lat, t.lng)
      const trailProgress = missile.progress - (missile.trail.length - 1 - i) * missile.config.speed * 50
      const yOff = arcOffset(Math.max(0, trailProgress), arcHeight)
      if (i === 0) ctx.moveTo(base.x, base.y + yOff)
      else ctx.lineTo(base.x, base.y + yOff)
    }
    ctx.strokeStyle = rgba(color, 0.45)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  drawMissilePath(ctx, missile, map)

  const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 14)
  grd.addColorStop(0, rgba(color, 0.35))
  grd.addColorStop(1, rgba(color, 0))
  ctx.beginPath()
  ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()

  ctx.save()
  ctx.translate(pt.x, pt.y)
  ctx.rotate(angle)

  const len = 10   // body half-length
  const w = 4      // max half-width

  ctx.beginPath()
  ctx.moveTo(len, 0)
  ctx.lineTo(-len * 0.3, w)
  ctx.lineTo(-len * 0.6, w * 0.5)
  ctx.lineTo(-len, w * 0.7)
  ctx.lineTo(-len * 0.85, 0)
  ctx.lineTo(-len, -w * 0.7)
  ctx.lineTo(-len * 0.6, -w * 0.5)
  ctx.lineTo(-len * 0.3, -w)
  ctx.closePath()

  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(len, 0)
  ctx.lineTo(-len * 0.85, 0)
  ctx.strokeStyle = rgba('#ffffff', 0.6)
  ctx.lineWidth = 0.8
  ctx.shadowBlur = 0
  ctx.stroke()

  ctx.restore()
}

function drawMissilePath(ctx, missile, map) {
  if (missile.progress >= 0.98) return
  const color = MISSILE_TYPES[missile.type].color
  const steps = 20

  ctx.beginPath()
  ctx.setLineDash([4, 6])
  ctx.lineWidth = 0.8
  ctx.strokeStyle = rgba(color, 0.25)

  for (let i = 0; i <= steps; i++) {
    const t = lerp(missile.progress, 1.0, i / steps)
    const pt = missile.getCanvasPointAt(map, t)
    if (i === 0) ctx.moveTo(pt.x, pt.y)
    else ctx.lineTo(pt.x, pt.y)
  }
  ctx.stroke()
  ctx.setLineDash([])
}

export function drawInterceptor(ctx, interceptor, map) {
  const color = '#00b4d8'
  const pt = interceptor.getCanvasPoint(map)

  if (interceptor.trail.length > 1) {
    ctx.beginPath()
    for (let i = 0; i < interceptor.trail.length; i++) {
      const t = interceptor.trail[i]
      const base = latLngToCanvas(map, t.lat, t.lng)
      if (i === 0) ctx.moveTo(base.x, base.y)
      else ctx.lineTo(base.x, base.y)
    }
    ctx.strokeStyle = rgba(color, 0.4)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2)
  const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 6)
  grd.addColorStop(0, rgba(color, 0.9))
  grd.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = grd
  ctx.fill()

  ctx.beginPath()
  ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

export function drawExplosion(ctx, explosion, map) {
  const pt = latLngToCanvas(map, explosion.lat, explosion.lng)
  const p = explosion.progress
  const r = explosion.radius

  if (explosion.type === 'intercept') {
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 100, ${explosion.opacity * 0.9})`
    ctx.lineWidth = 2
    ctx.stroke()

    if (p < 0.3) {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, r * 0.5, 0, Math.PI * 2)
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 0.5)
      grd.addColorStop(0, `rgba(255, 255, 200, ${(1 - p / 0.3) * 0.8})`)
      grd.addColorStop(1, `rgba(255, 200, 0, 0)`)
      ctx.fillStyle = grd
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(pt.x, pt.y, r * 0.6, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0, 200, 255, ${explosion.opacity * 0.5})`
    ctx.lineWidth = 1
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
    const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r)
    grd.addColorStop(0, `rgba(255, 100, 0, ${explosion.opacity * 0.9})`)
    grd.addColorStop(0.4, `rgba(255, 50, 0, ${explosion.opacity * 0.6})`)
    grd.addColorStop(1, `rgba(255, 0, 0, 0)`)
    ctx.fillStyle = grd
    ctx.fill()

    ctx.beginPath()
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 60, 0, ${explosion.opacity * 0.7})`
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function rangeToPixels(map, centerPx, lat, lng, rangeKm) {
  const latOffset = rangeKm / 111
  const edgePt = latLngToCanvas(map, lat + latOffset, lng)
  return Math.abs(centerPx.y - edgePt.y)
}

export function drawRadar(ctx, battery, map, timestamp) {
  const { lat, lng, color, engagementRange } = battery
  const center = latLngToCanvas(map, lat, lng)
  const radiusPx = rangeToPixels(map, center, lat, lng, engagementRange)

  if (radiusPx < 8) return

  const { r, g, b } = hexToRgb(color)

  const ringFractions = [0.33, 0.66, 1.0]
  ringFractions.forEach((frac, i) => {
    const rr = radiusPx * frac
    ctx.beginPath()
    ctx.arc(center.x, center.y, rr, 0, Math.PI * 2)
    const alpha = i === 2 ? 0.45 : 0.15
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
    ctx.lineWidth = i === 2 ? 1.2 : 0.6
    ctx.setLineDash(i === 2 ? [] : [3, 6])
    ctx.stroke()
    ctx.setLineDash([])
  })

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(center.x - radiusPx, center.y)
  ctx.lineTo(center.x + radiusPx, center.y)
  ctx.moveTo(center.x, center.y - radiusPx)
  ctx.lineTo(center.x, center.y + radiusPx)
  ctx.strokeStyle = `rgba(${r},${g},${b},0.08)`
  ctx.lineWidth = 0.5
  ctx.stroke()
  ctx.restore()

  // each battery gets a slightly different rotation speed so they don't all sync up
  const speedVariance = 1 + (battery.id.charCodeAt(0) % 5) * 0.08
  const rotPeriodMs = 3200 / speedVariance
  const angle = ((timestamp % rotPeriodMs) / rotPeriodMs) * Math.PI * 2

  const sweepArc = Math.PI * 0.55

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(center.x, center.y)
  ctx.arc(center.x, center.y, radiusPx, angle - sweepArc, angle)
  ctx.closePath()

  const gradFill = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radiusPx)
  gradFill.addColorStop(0, `rgba(${r},${g},${b},0.0)`)
  gradFill.addColorStop(0.4, `rgba(${r},${g},${b},0.06)`)
  gradFill.addColorStop(1, `rgba(${r},${g},${b},0.18)`)
  ctx.fillStyle = gradFill
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(center.x, center.y)
  ctx.lineTo(
    center.x + Math.cos(angle) * radiusPx,
    center.y + Math.sin(angle) * radiusPx,
  )
  ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`
  ctx.lineWidth = 1.5
  ctx.shadowColor = `rgba(${r},${g},${b},0.9)`
  ctx.shadowBlur = 6
  ctx.stroke()
  ctx.restore()

  ctx.beginPath()
  ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.arc(center.x, center.y, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

export function drawImpactZones(ctx, zones, map) {
  for (const zone of zones) {
    const pt = latLngToCanvas(map, zone.lat, zone.lng)
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 50, 0, 0.6)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'
    ctx.lineWidth = 2
    const s = 5
    ctx.beginPath()
    ctx.moveTo(pt.x - s, pt.y - s)
    ctx.lineTo(pt.x + s, pt.y + s)
    ctx.moveTo(pt.x + s, pt.y - s)
    ctx.lineTo(pt.x - s, pt.y + s)
    ctx.stroke()
  }
}

export function drawFrame(ctx, canvas, map, { missiles, interceptors, explosions, impactZones, batteries = [], timestamp = 0 }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of batteries) {
    drawRadar(ctx, b, map, timestamp)
  }

  drawImpactZones(ctx, impactZones, map)

  for (const m of missiles) {
    if (m.status === 'intercepted' || m.status === 'hit') continue
    drawMissile(ctx, m, map)
  }

  for (const i of interceptors) {
    if (i.status !== 'active') continue
    drawInterceptor(ctx, i, map)
  }

  for (const e of explosions) {
    drawExplosion(ctx, e, map)
  }
}
