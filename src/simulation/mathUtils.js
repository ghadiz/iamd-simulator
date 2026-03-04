const R = 6371  // Earth radius km

export function toRad(deg) { return deg * Math.PI / 180 }
export function toDeg(rad) { return rad * 180 / Math.PI }

export function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function midpointLatLng(lat1, lng1, lat2, lng2, t = 0.5) {
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lng: lng1 + (lng2 - lng1) * t,
  }
}

export function latLngToCanvas(map, lat, lng) {
  const point = map.latLngToContainerPoint([lat, lng])
  return { x: point.x, y: point.y }
}

// Binary search for the future missile position where an interceptor launched now will arrive simultaneously.
export function calcInterceptPoint(missile, battery, interceptorSpeed) {
  const STEPS = 20
  let lo = missile.progress
  let hi = 1.0

  for (let i = 0; i < STEPS; i++) {
    const mid = (lo + hi) / 2
    const missilePos = missile.getPosAtProgress(mid)
    const distToInterceptKm = distanceKm(battery.lat, battery.lng, missilePos.lat, missilePos.lng)
    const interceptorTravelTime = distToInterceptKm / interceptorSpeed   // seconds
    const missileProgressRemaining = mid - missile.progress
    const missileTravelTime = missileProgressRemaining / missile.config.speed / 1000  // seconds
    if (interceptorTravelTime < missileTravelTime) {
      hi = mid
    } else {
      lo = mid
    }
  }

  const prog = (lo + hi) / 2
  const pos = missile.getPosAtProgress(Math.min(prog, 0.95))
  return { progress: prog, lat: pos.lat, lng: pos.lng }
}

export function lerp(a, b, t) { return a + (b - a) * t }

export function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

export function bearingDeg(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function arcOffset(progress, arcHeightPx) {
  return -Math.sin(progress * Math.PI) * arcHeightPx
}
