import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_STOP, EXITS, START_MP, MI_PER_MIN } from './data'
import { exitByNum, exitsAhead, etaOf } from './model'
import { useNav } from './nav'

const TripCtx = createContext(null)

const STEP = { '15x': 0.25, '30x': 0.5, '60x': 1 } // simulated minutes per real second
const CORRIDOR_END = 33 // minutes; the sample drive loops after the last exit

export function TripProvider({ children }) {
  const { screen, params, nav, back } = useNav()

  const [mode, setMode] = useState('live') // 'live' uses the drive simulation; 'manual' moves when you mark exits passed
  const [elapsed, setElapsed] = useState(0) // live position: minutes driven from MP 114
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState('30x')
  const [startMile, setStartMile] = useState(START_MP) // manual mode starting milepost
  const [passed, setPassed] = useState([]) // manual mode: exit numbers marked as passed, in order
  const [stop, setStop] = useState(DEFAULT_STOP) // { exit, placeIds, name } | null
  const [dismissed, setDismissed] = useState(null) // exit whose glance screen was dismissed
  const [toast, setToastState] = useState(null)
  const [find, setFind] = useState({
    turn: false, open: true, chains: false, kinds: { veg: true }, multi: { food: true }, showFilters: false, review: null, picks: {}, stop: null,
  })

  // Where we are, in minutes along the corridor.
  const lastPassed = passed.length ? exitByNum[passed[passed.length - 1]] : null
  const position = mode === 'manual'
    ? (lastPassed ? lastPassed.base + 0.01 : (startMile - START_MP) / MI_PER_MIN)
    : elapsed

  // Drive simulation. It slows down while the glance screen is up so there is time to read it.
  const approaching = screen === 'approaching'
  useEffect(() => {
    if (!running || mode !== 'live') return
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + STEP[speed] / (approaching ? 6 : 1)
        if (next > CORRIDOR_END) { setDismissed(null); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, mode, speed, approaching])

  // Pop the glance screen up as the next exit gets close, and close it once the exit is behind us.
  const hero = exitsAhead(position)[0] || null
  const heroEta = hero ? etaOf(hero, position) : null
  useEffect(() => {
    if (mode !== 'live') return
    if (screen === 'approaching') {
      const e = exitByNum[params[0]]
      if (!e || etaOf(e, position) <= 0.05) back('/ahead')
      return
    }
    if (running && hero && heroEta < 1.5 && dismissed !== hero.num && (screen === 'ahead' || screen === 'find')) {
      nav('/approaching/' + hero.num)
    }
  }, [mode, screen, params, position, running, hero, heroEta, dismissed, nav, back])

  const toastTimer = useRef(null)
  const setToast = useCallback((msg) => {
    setToastState(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState(null), 2600)
  }, [])

  const value = useMemo(() => ({
    mode, setMode, elapsed, setElapsed, running, setRunning, speed, setSpeed,
    startMile, setStartMile, passed, setPassed, stop, setStop, dismissed, setDismissed,
    find, setFind, toast, setToast, position, lastPassed,
    resetTrip: () => { setElapsed(0); setRunning(false); setPassed([]); setStop(DEFAULT_STOP); setDismissed(null); setFind((f) => ({ ...f, stop: null, review: null, multi: { food: true } })) },
  }), [mode, elapsed, running, speed, startMile, passed, stop, dismissed, find, toast, setToast, position, lastPassed])

  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>
}

export const useTrip = () => useContext(TripCtx)
export { EXITS }
