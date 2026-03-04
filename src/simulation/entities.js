import { MISSILE_TYPES, BATTERY_CONFIGS, getPhase } from './config.js'
import { distanceKm, lerp, arcOffset, latLngToCanvas } from './mathUtils.js'

let _idCounter = 1
export function nextId(prefix = 'E') { return `${prefix}-${String(_idCounter++).padStart(4, '0')}` }

export class Missile {
  constructor({ id, originLat, originLng, targetLat, targetLng, type }) {
    this.id = id || nextId('M')
    this.originLat = originLat
    this.originLng = originLng
    this.targetLat = targetLat
    this.targetLng = targetLng
    this.type = type
    this.config = MISSILE_TYPES[type]
    this.progress = 0          // 0 → 1
    this.status = 'active'     // active | intercepted | hit
    this.phase = 'BOOST'
    this.trail = []
    this.TRAIL_MAX = 20
    this.distanceKm = distanceKm(originLat, originLng, targetLat, targetLng)
    this.engagedBy = null
    this.detectedBy = []
  }

  update(dtMs) {
    if (this.status !== 'active') return
    this.progress += this.config.speed * dtMs
    if (this.progress >= 1.0) {
      this.progress = 1.0
      this.status = 'hit'
    }
    this.phase = getPhase(this.progress)

    const pos = this.getCurrentLatLng()
    this.trail.push({ lat: pos.lat, lng: pos.lng })
    if (this.trail.length > this.TRAIL_MAX) this.trail.shift()
  }

  getCurrentLatLng() {
    return this.getPosAtProgress(this.progress)
  }

  getPosAtProgress(t) {
    return {
      lat: lerp(this.originLat, this.targetLat, t),
      lng: lerp(this.originLng, this.targetLng, t),
    }
  }

  getCanvasPoint(map) {
    const { lat, lng } = this.getCurrentLatLng()
    const pt = latLngToCanvas(map, lat, lng)
    const yOffset = arcOffset(this.progress, this.config.arcHeight)
    return { x: pt.x, y: pt.y + yOffset }
  }

  getCanvasPointAt(map, t) {
    const pos = this.getPosAtProgress(t)
    const pt = latLngToCanvas(map, pos.lat, pos.lng)
    const yOffset = arcOffset(t, this.config.arcHeight)
    return { x: pt.x, y: pt.y + yOffset }
  }

  toSnapshot() {
    return {
      id: this.id,
      type: this.type,
      phase: this.phase,
      progress: this.progress,
      status: this.status,
      engagedBy: this.engagedBy,
      detectedBy: [...this.detectedBy],
      targetLat: this.targetLat,
      targetLng: this.targetLng,
      lat: this.getCurrentLatLng().lat,
      lng: this.getCurrentLatLng().lng,
    }
  }
}

const INTERCEPTOR_SPEED_KMpS = 100   // km/s in simulation timescale (missiles travel ~90 km/s sim-time)

export class Interceptor {
  constructor({ battery, missile, interceptLat, interceptLng }) {
    this.id = nextId('I')
    this.battery = battery   // Battery instance
    this.missile = missile   // Missile instance
    this.originLat = battery.config.lat
    this.originLng = battery.config.lng
    this.interceptLat = interceptLat
    this.interceptLng = interceptLng
    this.totalDistKm = distanceKm(battery.config.lat, battery.config.lng, interceptLat, interceptLng)
    this.progress = 0
    this.status = 'active'          // active | hit | missed
    this.trail = []
    this.TRAIL_MAX = 15
    const travelTimeSec = this.totalDistKm / INTERCEPTOR_SPEED_KMpS
    this.speed = 1.0 / (travelTimeSec * 1000)
  }

  update(dtMs) {
    if (this.status !== 'active') return
    this.progress = Math.min(this.progress + this.speed * dtMs, 1.0)

    const pos = this.getCurrentLatLng()
    this.trail.push({ lat: pos.lat, lng: pos.lng })
    if (this.trail.length > this.TRAIL_MAX) this.trail.shift()
  }

  getCurrentLatLng() {
    return {
      lat: lerp(this.originLat, this.interceptLat, this.progress),
      lng: lerp(this.originLng, this.interceptLng, this.progress),
    }
  }

  getCanvasPoint(map) {
    const { lat, lng } = this.getCurrentLatLng()
    return latLngToCanvas(map, lat, lng)
  }
}

export class Explosion {
  constructor({ lat, lng, type }) {
    this.id = nextId('X')
    this.lat = lat
    this.lng = lng
    this.type = type   // 'intercept' | 'impact'
    this.age = 0       // ms
    this.duration = type === 'impact' ? 3000 : 1200
    this.maxRadius = type === 'impact' ? 60 : 35
    this.done = false
  }

  update(dtMs) {
    this.age += dtMs
    if (this.age >= this.duration) this.done = true
  }

  get progress() { return Math.min(this.age / this.duration, 1) }
  get radius() { return this.maxRadius * this.progress }
  get opacity() { return 1 - this.progress }
}

export class Battery {
  constructor(config) {
    this.config = config
    this.id = config.id
    this.interceptorsAvailable = config.interceptorsTotal
    this.status = 'READY'          // READY | ENGAGING | RELOADING | OFFLINE
    this.targetedMissiles = new Set()
    this.reloadQueue = []          // ms timestamps for interceptor reloads
    this._lastReloadCheck = 0
  }

  canEngage(missile) {
    if (this.interceptorsAvailable <= 0) return false
    if (missile.status !== 'active') return false
    if (this.targetedMissiles.has(missile.id)) return false
    if (!this.config.canEngageTypes.includes(missile.type)) return false
    if (!this.config.bestPhases.includes(missile.phase) && missile.phase === 'BOOST') return false

    const dist = distanceKm(this.config.lat, this.config.lng, missile.getCurrentLatLng().lat, missile.getCurrentLatLng().lng)
    return dist <= this.config.engagementRange
  }

  canDetect(missile) {
    const pos = missile.getCurrentLatLng()
    const dist = distanceKm(this.config.lat, this.config.lng, pos.lat, pos.lng)
    return dist <= this.config.detectionRange * 1.5
  }

  launchInterceptor(missile, interceptPoint, nowMs) {
    if (this.interceptorsAvailable <= 0) return null
    this.interceptorsAvailable--
    this.targetedMissiles.add(missile.id)
    missile.engagedBy = this.id

    const reloadAt = nowMs + this.config.reloadTime * 1000
    this.reloadQueue.push(reloadAt)

    this.status = this.interceptorsAvailable > 0 ? 'ENGAGING' : 'RELOADING'

    return new Interceptor({
      battery: this,
      missile,
      interceptLat: interceptPoint.lat,
      interceptLng: interceptPoint.lng,
    })
  }

  tickReloads(nowMs) {
    let reloaded = 0
    this.reloadQueue = this.reloadQueue.filter(t => {
      if (nowMs >= t) {
        this.interceptorsAvailable = Math.min(
          this.interceptorsAvailable + 1,
          this.config.interceptorsTotal,
        )
        reloaded++
        return false
      }
      return true
    })
    if (this.interceptorsAvailable === this.config.interceptorsTotal) {
      this.status = 'READY'
    } else if (this.interceptorsAvailable > 0) {
      this.status = 'ENGAGING'
    }
    return reloaded
  }

  onInterceptorResolved(missileId) {
    this.targetedMissiles.delete(missileId)
  }

  toSnapshot() {
    return {
      id: this.id,
      name: this.config.name,
      system: this.config.system,
      lat: this.config.lat,
      lng: this.config.lng,
      color: this.config.color,
      interceptorsAvailable: this.interceptorsAvailable,
      interceptorsTotal: this.config.interceptorsTotal,
      status: this.status,
      engagementRange: this.config.engagementRange,
      nextReloadAt: this.reloadQueue.length > 0 ? Math.min(...this.reloadQueue) : null,
    }
  }
}
