import { useRef, useEffect, useCallback } from 'react'
import { BATTERY_CONFIGS, SCENARIOS } from '../simulation/config.js'
import { Missile, Explosion, Battery, nextId } from '../simulation/entities.js'
import { runKillChain, checkCollisions } from '../simulation/killChain.js'
import { drawFrame } from '../simulation/renderer.js'
import { useSimStore } from '../store/useSimStore.js'

const UI_UPDATE_INTERVAL = 150   // ms between Zustand store updates

export function useGameLoop(canvasRef, mapRef) {
  const missilesRef = useRef([])
  const interceptorsRef = useRef([])
  const explosionsRef = useRef([])
  const batteriesRef = useRef([])
  const impactZonesRef = useRef([])
  const pendingLaunchesRef = useRef([])

  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const lastUIUpdateRef = useRef(0)
  const simStartTimeRef = useRef(null)
  const statsRef = useRef({ launched: 0, intercepted: 0, hits: 0, missed: 0 })
  const runningRef = useRef(false)

  const addEvent = useSimStore(s => s.addEvent)
  const updateSnapshot = useSimStore(s => s.updateSnapshot)
  const addImpactZone = useSimStore(s => s.addImpactZone)
  const setRunning = useSimStore(s => s.setRunning)

  const logEventRef = useRef(null)
  logEventRef.current = (event) => {
    addEvent({ ...event, id: nextId('EV') })
  }

  useEffect(() => {
    batteriesRef.current = BATTERY_CONFIGS.map(cfg => new Battery(cfg))
    updateSnapshot({
      threats: [],
      batteries: batteriesRef.current.map(b => b.toSnapshot()),
      stats: statsRef.current,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tickFnRef = useRef(null)
  tickFnRef.current = (timestamp) => {
    if (!runningRef.current) return

    if (!simStartTimeRef.current) simStartTimeRef.current = timestamp
    if (!lastTimeRef.current) lastTimeRef.current = timestamp

    const dtMs = Math.min(timestamp - lastTimeRef.current, 100)
    lastTimeRef.current = timestamp
    const simElapsed = timestamp - simStartTimeRef.current

    const stillPending = []
    for (const pl of pendingLaunchesRef.current) {
      if (simElapsed >= pl.fireAt) {
        missilesRef.current.push(pl.missile)
        statsRef.current.launched++
        logEventRef.current({
          type: 'warn',
          text: `LAUNCH DETECTED: ${pl.missile.id} [${pl.missile.type.toUpperCase()}] → (${pl.missile.targetLat.toFixed(1)}°, ${pl.missile.targetLng.toFixed(1)}°)`,
          time: timestamp,
        })
      } else {
        stillPending.push(pl)
      }
    }
    pendingLaunchesRef.current = stillPending

    for (const m of missilesRef.current) {
      if (m.status !== 'active') continue
      m.update(dtMs)
      if (m.status === 'hit') {
        statsRef.current.hits++
        explosionsRef.current.push(new Explosion({ lat: m.targetLat, lng: m.targetLng, type: 'impact' }))
        impactZonesRef.current.push({ id: m.id, lat: m.targetLat, lng: m.targetLng })
        addImpactZone({ id: m.id, lat: m.targetLat, lng: m.targetLng })
        logEventRef.current({
          type: 'danger',
          text: `IMPACT: ${m.id} hit target at (${m.targetLat.toFixed(2)}°, ${m.targetLng.toFixed(2)}°)`,
          time: timestamp,
        })
      }
    }

    for (const i of interceptorsRef.current) {
      if (i.status !== 'active') continue
      i.update(dtMs)
    }

    const newInterceptors = runKillChain(
      batteriesRef.current,
      missilesRef.current,
      timestamp,
      (ev) => logEventRef.current(ev),
    )
    interceptorsRef.current.push(...newInterceptors)

    const collisionResults = checkCollisions(interceptorsRef.current, missilesRef.current)
    for (const result of collisionResults) {
      if (result.type === 'intercept') {
        statsRef.current.intercepted++
        explosionsRef.current.push(new Explosion({ lat: result.lat, lng: result.lng, type: 'intercept' }))
        result.interceptor.battery.onInterceptorResolved(result.missile.id)
        logEventRef.current({
          type: 'success',
          text: `INTERCEPT: ${result.missile.id} destroyed by ${result.interceptor.battery.config.name}`,
          time: timestamp,
        })
      } else {
        result.interceptor.battery.onInterceptorResolved(result.missile.id)
        statsRef.current.missed++
        logEventRef.current({
          type: 'warn',
          text: `MISS: ${result.interceptor.id} failed on ${result.missile.id}`,
          time: timestamp,
        })
      }
    }

    for (const exp of explosionsRef.current) exp.update(dtMs)
    explosionsRef.current = explosionsRef.current.filter(e => !e.done)

    interceptorsRef.current = interceptorsRef.current.filter(i => i.status === 'active')
    missilesRef.current = missilesRef.current.filter(
      m => m.status === 'active' || m.status === 'intercepted',
    )

    const canvas = canvasRef.current
    const map = mapRef.current
    if (canvas && map) {
      const ctx = canvas.getContext('2d')
      drawFrame(ctx, canvas, map, {
        missiles: missilesRef.current,
        interceptors: interceptorsRef.current,
        explosions: explosionsRef.current,
        impactZones: impactZonesRef.current,
        batteries: batteriesRef.current.map(b => ({
          id: b.id,
          lat: b.config.lat,
          lng: b.config.lng,
          color: b.config.color,
          engagementRange: b.config.displayRadiusKm,
        })),
        timestamp,
      })
    }

    if (timestamp - lastUIUpdateRef.current > UI_UPDATE_INTERVAL) {
      lastUIUpdateRef.current = timestamp
      updateSnapshot({
        threats: missilesRef.current.map(m => m.toSnapshot()),
        batteries: batteriesRef.current.map(b => b.toSnapshot()),
        stats: { ...statsRef.current },
      })
    }

    rafRef.current = requestAnimationFrame(tickFnRef.current)
  }

  const rafCallback = useCallback((ts) => {
    if (tickFnRef.current) tickFnRef.current(ts)
  }, [])

  const stopInternal = () => {
    runningRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null
    simStartTimeRef.current = null
  }

  const startScenario = useCallback((scenarioId) => {
    const scenario = SCENARIOS[scenarioId]
    if (!scenario) return

    stopInternal()
    missilesRef.current = []
    interceptorsRef.current = []
    explosionsRef.current = []
    impactZonesRef.current = []
    statsRef.current = { launched: 0, intercepted: 0, hits: 0, missed: 0 }
    batteriesRef.current = BATTERY_CONFIGS.map(cfg => new Battery(cfg))

    pendingLaunchesRef.current = scenario.launches.map(spec => ({
      missile: new Missile({ id: nextId('M'), ...spec }),
      fireAt: spec.delay,
    }))

    runningRef.current = true
    setRunning(true)
    rafRef.current = requestAnimationFrame(rafCallback)
  }, [rafCallback, setRunning])

  const launchManual = useCallback(({ originLat, originLng, targetLat, targetLng, type }) => {
    const missile = new Missile({ id: nextId('M'), originLat, originLng, targetLat, targetLng, type })
    missilesRef.current.push(missile)
    statsRef.current.launched++
    logEventRef.current({
      type: 'warn',
      text: `MANUAL LAUNCH: ${missile.id} [${type.toUpperCase()}]`,
      time: performance.now(),
    })

    if (!runningRef.current) {
      runningRef.current = true
      setRunning(true)
      rafRef.current = requestAnimationFrame(rafCallback)
    }
  }, [rafCallback, setRunning])

  const stopLoop = useCallback(() => {
    stopInternal()
    setRunning(false)
  }, [setRunning])

  const resetAll = useCallback(() => {
    stopInternal()
    setRunning(false)
    missilesRef.current = []
    interceptorsRef.current = []
    explosionsRef.current = []
    impactZonesRef.current = []
    pendingLaunchesRef.current = []
    statsRef.current = { launched: 0, intercepted: 0, hits: 0, missed: 0 }
    batteriesRef.current = BATTERY_CONFIGS.map(cfg => new Battery(cfg))

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    updateSnapshot({
      threats: [],
      batteries: batteriesRef.current.map(b => b.toSnapshot()),
      stats: { launched: 0, intercepted: 0, hits: 0, missed: 0 },
    })
  }, [canvasRef, setRunning, updateSnapshot])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { startScenario, launchManual, stopLoop, resetAll }
}
