import { calcInterceptPoint, distanceKm } from './mathUtils.js'

export function runKillChain(batteries, missiles, nowMs, logEvent) {
  const newInterceptors = []

  for (const battery of batteries) {
    battery.tickReloads(nowMs)

    for (const missile of missiles) {
      if (missile.status !== 'active') continue

      const detected = battery.canDetect(missile)
      if (detected && !missile.detectedBy.includes(battery.id)) {
        missile.detectedBy.push(battery.id)
        logEvent({
          type: 'info',
          text: `[${battery.config.name}] DETECT: ${missile.id} (${missile.type.toUpperCase()})`,
          time: nowMs,
        })
      }

      if (!detected) continue

      if (!battery.canEngage(missile)) continue

      if (battery.targetedMissiles.has(missile.id)) continue

      const INTERCEPTOR_SPEED_KMpS = 100
      const interceptPoint = calcInterceptPoint(missile, battery.config, INTERCEPTOR_SPEED_KMpS)

      // skip if intercept point is outside engagement range
      const distToIntercept = distanceKm(
        battery.config.lat, battery.config.lng,
        interceptPoint.lat, interceptPoint.lng,
      )
      if (distToIntercept > battery.config.engagementRange * 1.1) continue
      if (interceptPoint.progress >= 0.98) continue

      const interceptor = battery.launchInterceptor(missile, interceptPoint, nowMs)
      if (!interceptor) continue

      logEvent({
        type: 'success',
        text: `[${battery.config.name}] FIRE → ${missile.id} (${missile.phase}), ` +
              `ETA ${Math.round(distToIntercept / INTERCEPTOR_SPEED_KMpS)}s`,
        time: nowMs,
      })

      newInterceptors.push(interceptor)
    }
  }

  return newInterceptors
}

export function checkCollisions(interceptors, missiles) {
  const results = []

  for (const interceptor of interceptors) {
    if (interceptor.status !== 'active') continue
    const missile = interceptor.missile
    const intPos = interceptor.getCurrentLatLng()

    if (missile.status !== 'active') {
      interceptor.status = 'missed'
      results.push({ type: 'miss', interceptor, missile, lat: intPos.lat, lng: intPos.lng })
      continue
    }

    const misPos = missile.getCurrentLatLng()
    const dist = distanceKm(intPos.lat, intPos.lng, misPos.lat, misPos.lng)

    const killRadius = getKillRadius(interceptor.battery.config.system)

    if (dist < killRadius) {
      interceptor.status = 'hit'
      missile.status = 'intercepted'
      results.push({
        type: 'intercept',
        interceptor,
        missile,
        lat: (intPos.lat + misPos.lat) / 2,
        lng: (intPos.lng + misPos.lng) / 2,
      })
    } else if (interceptor.progress >= 1.0) {
      interceptor.status = 'missed'
      results.push({
        type: 'miss',
        interceptor,
        missile,
        lat: intPos.lat,
        lng: intPos.lng,
      })
    }
  }

  return results
}

function getKillRadius(system) {
  const radii = {
    arrow3: 40,
    arrow2: 20,
    thaad: 15,
    pac3: 8,
    iron_dome: 5,
  }
  return radii[system] ?? 10
}
