export const BATTERY_CONFIGS = [
  {
    id: 'arrow3-negev',
    name: 'Arrow-3 / Negev',
    system: 'arrow3',
    lat: 31.0, lng: 34.9,          // Southern Occupied Territory
    color: '#00ff88',
    detectionRange: 2400,           // km — gameplay logic
    engagementRange: 2400,
    displayRadiusKm: 500,           // km — radar ring shown on map
    interceptorsTotal: 8,
    reloadTime: 45,                 // seconds per interceptor
    bestPhases: ['MIDCOURSE'],
    canEngageTypes: ['ballistic', 'hypersonic'],
    description: 'Exo-atmospheric, long-range boost/midcourse',
  },
  {
    id: 'arrow2-palmachim',
    name: 'Arrow-2 / Palmachim',
    system: 'arrow2',
    lat: 31.9, lng: 34.7,
    color: '#00ff88',
    detectionRange: 800,
    engagementRange: 800,
    displayRadiusKm: 200,
    interceptorsTotal: 12,
    reloadTime: 30,
    bestPhases: ['MIDCOURSE', 'TERMINAL'],
    canEngageTypes: ['ballistic', 'cruise'],
    description: 'Endo-atmospheric midcourse/terminal',
  },
  {
    id: 'thaad-qatar',
    name: 'THAAD / Al Udeid',
    system: 'thaad',
    lat: 25.1, lng: 51.3,           // Qatar
    color: '#00b4d8',
    detectionRange: 1000,
    engagementRange: 200,
    displayRadiusKm: 300,
    interceptorsTotal: 10,
    reloadTime: 20,
    bestPhases: ['MIDCOURSE', 'TERMINAL'],
    canEngageTypes: ['ballistic', 'hypersonic'],
    description: 'Terminal high-altitude area defense',
  },
  {
    id: 'pac3-riyadh',
    name: 'PAC-3 / Riyadh',
    system: 'pac3',
    lat: 24.7, lng: 46.7,
    color: '#ffd600',
    detectionRange: 150,
    engagementRange: 100,
    displayRadiusKm: 120,
    interceptorsTotal: 16,
    reloadTime: 8,
    bestPhases: ['TERMINAL'],
    canEngageTypes: ['ballistic', 'cruise', 'drone'],
    description: 'Patriot PAC-3, terminal defense',
  },
  {
    id: 'pac3-kuwait',
    name: 'PAC-3 / Kuwait',
    system: 'pac3',
    lat: 29.3, lng: 47.7,
    color: '#ffd600',
    detectionRange: 150,
    engagementRange: 100,
    displayRadiusKm: 120,
    interceptorsTotal: 16,
    reloadTime: 8,
    bestPhases: ['TERMINAL'],
    canEngageTypes: ['ballistic', 'cruise', 'drone'],
    description: 'Patriot PAC-3, terminal defense',
  },
  {
    id: 'iron-dome-tlv',
    name: 'Iron Dome / Tel Aviv',
    system: 'iron_dome',
    lat: 32.1, lng: 34.9,
    color: '#ff8c00',
    detectionRange: 70,
    engagementRange: 70,
    displayRadiusKm: 70,
    interceptorsTotal: 20,
    reloadTime: 5,
    bestPhases: ['TERMINAL'],
    canEngageTypes: ['cruise', 'drone', 'ballistic'],
    description: 'Short-range terminal defense',
  },
  {
    id: 'iron-dome-haifa',
    name: 'Iron Dome / Haifa',
    system: 'iron_dome',
    lat: 32.8, lng: 35.0,
    color: '#ff8c00',
    detectionRange: 70,
    engagementRange: 70,
    displayRadiusKm: 70,
    interceptorsTotal: 20,
    reloadTime: 5,
    bestPhases: ['TERMINAL'],
    canEngageTypes: ['cruise', 'drone', 'ballistic'],
    description: 'Short-range terminal defense',
  },
]

export const MISSILE_TYPES = {
  ballistic: {
    label: 'Ballistic',
    color: '#ff3333',
    speed: 0.000045,      // progress per ms
    arcHeight: 280,       // px
    radarCrossSection: 1.0,
    description: 'High-arc ballistic trajectory (Shahab, Qiam class)',
  },
  cruise: {
    label: 'Cruise',
    color: '#ff8c00',
    speed: 0.000018,
    arcHeight: 20,
    radarCrossSection: 0.3,
    description: 'Low-altitude cruise missile (Quds-1, Ya Ali class)',
  },
  hypersonic: {
    label: 'Hypersonic',
    color: '#ff00ff',
    speed: 0.000090,
    arcHeight: 150,
    radarCrossSection: 0.15,
    description: 'Maneuvering hypersonic glide vehicle',
  },
  drone: {
    label: 'Drone / UAV',
    color: '#ff6600',
    speed: 0.000012,
    arcHeight: 5,
    radarCrossSection: 0.05,
    description: 'Loitering munition / Shahed-class UAV',
  },
}

export const PHASES = {
  BOOST: { min: 0, max: 0.15, label: 'BOOST', color: '#ff3333' },
  MIDCOURSE: { min: 0.15, max: 0.80, label: 'MIDCOURSE', color: '#ffd600' },
  TERMINAL: { min: 0.80, max: 1.0, label: 'TERMINAL', color: '#ff8c00' },
}

export function getPhase(progress) {
  if (progress < PHASES.BOOST.max) return 'BOOST'
  if (progress < PHASES.MIDCOURSE.max) return 'MIDCOURSE'
  return 'TERMINAL'
}

const IRAN_ORIGINS = [
  { lat: 35.7, lng: 51.4 },   // Tehran
  { lat: 32.4, lng: 48.7 },   // Ahvaz
  { lat: 36.3, lng: 59.6 },   // Mashhad
  { lat: 29.6, lng: 52.5 },   // Shiraz
]

const HOUTHI_ORIGINS = [
  { lat: 15.4, lng: 44.2 },   // Sanaa
  { lat: 14.8, lng: 42.9 },   // Hodeidah
  { lat: 13.5, lng: 44.0 },   // Taiz
]

const OT_TARGETS = [
  { lat: 32.1, lng: 34.9, name: 'Tel Aviv' },
  { lat: 31.8, lng: 35.2, name: 'Jerusalem' },
  { lat: 32.8, lng: 35.0, name: 'Haifa' },
  { lat: 31.0, lng: 34.9, name: 'Beer Sheva' },
]

const GULF_TARGETS = [
  { lat: 24.7, lng: 46.7, name: 'Riyadh' },
  { lat: 25.2, lng: 55.3, name: 'Dubai' },
  { lat: 26.2, lng: 50.6, name: 'Manama' },
  { lat: 29.4, lng: 47.9, name: 'Kuwait City' },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function makeLaunch(origin, target, type, delay) {
  return {
    originLat: origin.lat + (Math.random() - 0.5) * 0.8,
    originLng: origin.lng + (Math.random() - 0.5) * 0.8,
    targetLat: target.lat + (Math.random() - 0.5) * 0.3,
    targetLng: target.lng + (Math.random() - 0.5) * 0.3,
    type,
    delay,  // ms after scenario start
  }
}

export const SCENARIOS = {
  iran: {
    id: 'iran',
    name: 'Iranian Salvo',
    description: '6 ballistic + 2 cruise from Iran toward Occupied Territory',
    launches: [
      makeLaunch(IRAN_ORIGINS[0], OT_TARGETS[0], 'ballistic', 0),
      makeLaunch(IRAN_ORIGINS[1], OT_TARGETS[1], 'ballistic', 2000),
      makeLaunch(IRAN_ORIGINS[2], OT_TARGETS[2], 'ballistic', 4000),
      makeLaunch(IRAN_ORIGINS[3], OT_TARGETS[3], 'ballistic', 5000),
      makeLaunch(IRAN_ORIGINS[0], OT_TARGETS[0], 'ballistic', 8000),
      makeLaunch(IRAN_ORIGINS[1], OT_TARGETS[2], 'ballistic', 10000),
      makeLaunch(IRAN_ORIGINS[2], OT_TARGETS[1], 'cruise', 3000),
      makeLaunch(IRAN_ORIGINS[3], OT_TARGETS[0], 'cruise', 6000),
    ],
  },
  houthi: {
    id: 'houthi',
    name: 'Houthi Barrage',
    description: '8 mixed ballistic, cruise, drones from Yemen',
    launches: [
      makeLaunch(HOUTHI_ORIGINS[0], OT_TARGETS[0], 'ballistic', 0),
      makeLaunch(HOUTHI_ORIGINS[1], OT_TARGETS[2], 'ballistic', 3000),
      makeLaunch(HOUTHI_ORIGINS[2], GULF_TARGETS[0], 'cruise', 1000),
      makeLaunch(HOUTHI_ORIGINS[0], GULF_TARGETS[1], 'cruise', 2000),
      makeLaunch(HOUTHI_ORIGINS[1], GULF_TARGETS[2], 'drone', 0),
      makeLaunch(HOUTHI_ORIGINS[2], GULF_TARGETS[3], 'drone', 500),
      makeLaunch(HOUTHI_ORIGINS[0], GULF_TARGETS[0], 'drone', 1000),
      makeLaunch(HOUTHI_ORIGINS[1], OT_TARGETS[0], 'ballistic', 6000),
    ],
  },
  swarm: {
    id: 'swarm',
    name: 'Drone Swarm',
    description: '15 Shahed-class UAVs, multiple axes',
    launches: Array.from({ length: 15 }, (_, i) => makeLaunch(
      IRAN_ORIGINS[i % IRAN_ORIGINS.length],
      i < 8 ? OT_TARGETS[i % OT_TARGETS.length] : GULF_TARGETS[i % GULF_TARGETS.length],
      'drone',
      i * 800,
    )),
  },
  saturation: {
    id: 'saturation',
    name: 'Saturation Strike',
    description: 'All types, rapid sequential launches',
    launches: [
      ...Array.from({ length: 5 }, (_, i) => makeLaunch(IRAN_ORIGINS[i % 4], OT_TARGETS[i % 4], 'ballistic', i * 1500)),
      ...Array.from({ length: 4 }, (_, i) => makeLaunch(IRAN_ORIGINS[i % 4], GULF_TARGETS[i % 4], 'hypersonic', i * 2000 + 500)),
      ...Array.from({ length: 4 }, (_, i) => makeLaunch(HOUTHI_ORIGINS[i % 3], OT_TARGETS[i % 4], 'cruise', i * 1000)),
      ...Array.from({ length: 6 }, (_, i) => makeLaunch(HOUTHI_ORIGINS[i % 3], GULF_TARGETS[i % 4], 'drone', i * 600)),
    ],
  },
}
