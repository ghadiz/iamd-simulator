import { create } from 'zustand'

export const useSimStore = create((set, get) => ({
  threats: [],
  batteries: [],
  events: [],
  stats: { launched: 0, intercepted: 0, hits: 0, missed: 0 },
  impactZones: [],

  running: false,
  activeScenario: null,

  mode: 'observe',
  pendingOrigin: null,
  selectedType: 'ballistic',
  focusedThreat: null,

  setFocusedThreat: (focusedThreat) => set({ focusedThreat }),
  setMode: (mode) => set({ mode }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setPendingOrigin: (pendingOrigin) => set({ pendingOrigin, mode: 'placing-target' }),
  setRunning: (running) => set({ running }),
  setActiveScenario: (activeScenario) => set({ activeScenario }),

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 100),
  })),

  addImpactZone: (zone) => set((state) => ({
    impactZones: [...state.impactZones, zone],
  })),

  clearImpactZones: () => set({ impactZones: [] }),

  updateSnapshot: ({ threats, batteries, stats }) => set((state) => ({
    threats,
    batteries,
    stats: stats ?? state.stats,
  })),

  resetSim: () => set({
    threats: [],
    batteries: [],
    events: [],
    stats: { launched: 0, intercepted: 0, hits: 0, missed: 0 },
    impactZones: [],
    running: false,
    activeScenario: null,
    mode: 'observe',
    pendingOrigin: null,
  }),
}))
