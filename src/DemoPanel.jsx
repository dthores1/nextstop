import { useNav } from './nav'
import { useTrip } from './state'
import { exitsAhead } from './model'

// Desktop-only controls beside the phone, for walking a reviewer through the prototype.
export default function DemoPanel() {
  const { reset, nav } = useNav()
  const trip = useTrip()
  const hero = exitsAhead(trip.position)[0]
  const go = (to) => () => reset(to)
  return (
    <aside className="demo">
      <h1>NextStop</h1>
      <p>A road-trip companion that tells you what’s at the next exit before you miss the sign. Sample data for I-90 East near Sandusky, Ohio.</p>
      <h2>SCREENS</h2>
      <div className="group">
        <button onClick={go('/ahead')}>Ahead</button>
        <button onClick={() => { reset('/ahead'); if (hero) nav('/approaching/' + hero.num) }}>Approaching exit</button>
        <button onClick={() => { reset('/ahead'); nav('/exit/118') }}>Exit detail</button>
        <button onClick={() => { reset('/ahead'); nav('/exit/118'); nav('/place/green-bowl') }}>Place detail</button>
        <button onClick={() => { trip.setFind((f) => ({ ...f, multi: { food: true }, review: null })); reset('/find') }}>Find</button>
        <button onClick={() => { trip.setFind((f) => ({ ...f, multi: { food: true, ev: true, wc: true }, review: null })); reset('/find') }}>Find · combined</button>
        <button onClick={go('/setup')}>Set starting point</button>
      </div>
      <h2>DRIVE SIMULATION</h2>
      <div className="group">
        <button onClick={() => { trip.setMode('live'); trip.setRunning(!trip.running) }} aria-pressed={trip.running}>{trip.running ? 'Pause' : 'Drive'}</button>
        {['15x', '30x', '60x'].map((s) => <button key={s} onClick={() => trip.setSpeed(s)} aria-pressed={trip.speed === s}>{s}</button>)}
      </div>
      <h2>POSITIONING</h2>
      <div className="group">
        <button onClick={() => { trip.setMode('live'); trip.setDismissed(null) }} aria-pressed={trip.mode === 'live'}>Live location</button>
        <button onClick={() => { trip.setMode('manual'); trip.setRunning(false) }} aria-pressed={trip.mode === 'manual'}>Manual</button>
      </div>
      <h2>TRIP</h2>
      <div className="group">
        <button onClick={() => { trip.resetTrip(); reset('/ahead') }}>Reset trip</button>
      </div>
      <p style={{ marginTop: 6 }}>Tip: press Drive, then watch the glance screen appear as Exit 118 comes up.</p>
    </aside>
  )
}
