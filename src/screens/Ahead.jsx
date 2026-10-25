import Icon from '../components/Icon'
import Shield from '../components/Shield'
import ExitPlate, { ExitTag } from '../components/ExitPlate'
import TabBar from '../components/TabBar'
import { Link, useNav } from '../nav'
import { useTrip } from '../state'
import { HIGHWAY, CAT_LABEL, MI_PER_MIN } from '../data'
import { exitsAhead, etaOf, exitInfo, services, placeById, exitByNum, fmtEta, fmtMiles, positionTitle, sideLabel } from '../model'
import { C, kicker, ellipsis, row, col } from '../ui'

const SERVICE_ORDER = ['gas', 'food', 'ev', 'lodging', 'wc']

export default function Ahead() {
  const trip = useTrip()
  const { nav } = useNav()
  const { mode, position, lastPassed, stop, running, setRunning, passed, setPassed, startMile } = trip
  const manual = mode === 'manual'
  const green = C.green

  const up = exitsAhead(position)
  const heroRaw = up[0] || null
  const stopPlace = stop ? placeById[stop.placeIds[0]] : null
  const stopExit = stop ? exitByNum[stop.exit] : null
  const stopAhead = !!(stopExit && etaOf(stopExit, position) > 0.05)

  const deco = (x) => {
    const eta = etaOf(x, position)
    const isMatch = !!(stop && x.num === stop.exit)
    const svc = services(x.num)
    const svcs = SERVICE_ORDER.filter((k) => svc[k] > 0).map((k) => {
      const on = isMatch && stopPlace && (k === 'wc' ? stopPlace.cat === 'wc' : stopPlace.cat === k)
      return { key: k, label: CAT_LABEL[k], count: k === 'wc' ? '' : String(svc[k]), on }
    })
    const soon = !manual && eta < 1.5
    const idx = up.indexOf(x)
    const prevX = idx > 0 ? up[idx - 1] : lastPassed
    const gapMi = Math.round((x.base - (prevX ? prevX.base : position)) * MI_PER_MIN)
    const info = exitInfo(x)
    return {
      ...x, eta, svcs, isMatch, info,
      kicker: isMatch ? 'NEXT EXIT · YOUR STOP' : 'NEXT EXIT',
      gapText: prevX ? gapMi + ' mi after ' + exitInfo(prevX).label : 'First exit past your starting point',
      rightBig: manual ? '+' + gapMi : fmtEta(eta),
      rightUnit: manual ? ' mi' : ' min',
      footText: isMatch ? stop.name + ' · ' + sideLabel(stopPlace) : 'See what’s at this exit',
      border: soon || isMatch ? C.amber : 'rgba(255,255,255,0.9)',
    }
  }
  const hero = heroRaw ? deco(heroRaw) : null
  const rest = up.slice(1, 5).map(deco)
  const stopEta = stopAhead ? Math.max(1, Math.round(etaOf(stopExit, position) + (stopPlace ? stopPlace.off : 0))) : 0

  return (
    <div className="screen">
      <header style={{ padding: '22px 16px 14px', ...row, gap: 14, borderBottom: '1px solid ' + C.line }}>
        <Shield width={52} />
        <div style={{ flex: 1, minWidth: 0, ...col, gap: 3 }}>
          <div style={{ fontSize: 46, lineHeight: 0.9, fontWeight: 900, letterSpacing: '0.02em' }}>{HIGHWAY.direction}</div>
          <div style={{ ...row, gap: 7, fontSize: 14, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span>{HIGHWAY.road}</span><span aria-hidden="true">·</span><span style={ellipsis}>near {HIGHWAY.near}</span>
          </div>
        </div>
        {!manual && (
          <button onClick={() => setRunning(!running)} aria-label={running ? 'Pause drive simulation' : 'Simulate driving'}
            style={{ width: 60, height: 60, flex: 'none', borderRadius: 14, border: '1px solid ' + (running ? C.amber : C.border), background: running ? C.amber : C.card, color: running ? C.ink : C.fg, ...col, alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', padding: 0 }}>
            <Icon name={running ? 'pause' : 'play'} size={20} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>{running ? 'PAUSE' : 'DRIVE'}</span>
          </button>
        )}
      </header>

      {manual && (
        <div style={{ margin: '12px 16px 0', minHeight: 52, flex: 'none', ...row, gap: 10, padding: '6px 6px 6px 12px', borderRadius: 14, background: C.card, border: '1px solid ' + C.border }}>
          <Icon name="pinOff" size={20} color={C.muted} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: C.muted2, lineHeight: 1.3 }}>
            Manual mode · started {lastPassed ? 'past ' + exitInfo(lastPassed).label : positionTitle(startMile).replace(/^./, (c) => c.toLowerCase())}
          </div>
          <Link to="/setup" style={{ flex: 'none', height: 40, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 10, color: C.amber, fontSize: 14, fontWeight: 900, textDecoration: 'none' }}>Use location</Link>
        </div>
      )}

      {stop && (
        <div style={{ margin: '12px 16px 0', minHeight: 60, flex: 'none', ...row, gap: 12, padding: '6px 4px 6px 12px', borderRadius: 14, background: C.amberBg, border: '1.5px solid ' + C.amber }}>
          <Icon name="flag" size={22} stroke={2.4} color={C.amber} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: C.amber }}>{stopAhead ? 'YOUR STOP' : 'YOU PASSED YOUR STOP'}</div>
            <div style={{ fontSize: 16, fontWeight: 800, ...ellipsis }}>{stop.name} ·&nbsp; {stopExit ? exitInfo(stopExit).label : ''}</div>
          </div>
          {stopAhead && !manual && (
            <div style={{ flex: 'none', textAlign: 'right', fontSize: 26, lineHeight: 1, fontWeight: 900, color: C.amber }}>{stopEta}<span style={{ fontSize: 13, fontWeight: 800 }}> min</span></div>
          )}
          <button onClick={() => trip.setStop(null)} aria-label="Remove your stop" style={{ width: 44, height: 44, flex: 'none', border: 0, borderRadius: 12, background: 'transparent', color: C.fg, ...row, justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={20} stroke={2.4} />
          </button>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {hero ? (
          <Link to={'/exit/' + hero.num} aria-label="Exit details" style={{ display: 'block', textDecoration: 'none', color: '#FFFFFF', marginTop: 12, background: green, borderRadius: 18, padding: 6 }}>
            <div style={{ border: '2.5px solid ' + hero.border, borderRadius: 13, padding: '14px 16px 16px', ...col, gap: 12 }}>
              <div style={{ ...row, justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: hero.isMatch ? C.amber : '#FFFFFF' }}>{hero.kicker}</span>
                <ExitTag green={green}>{hero.info.tab} {hero.num}</ExitTag>
              </div>
              {!manual ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 84, lineHeight: 0.85, fontWeight: 900 }}>{fmtEta(hero.eta)}</span>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>min</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 18, fontWeight: 700, opacity: 0.85 }}>{fmtMiles(hero.eta)} mi</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 800 }}>{hero.info.tab}</span>
                    <span style={{ fontSize: 84, lineHeight: 0.85, fontWeight: 900 }}>{hero.num}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.85, marginTop: -4 }}>{hero.gapText}</div>
                </>
              )}
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{hero.label} · {hero.place}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {hero.svcs.map((s) => (
                  <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px', borderRadius: 8, background: s.on ? C.amber : 'rgba(255,255,255,0.15)', color: s.on ? C.ink : '#FFFFFF', fontSize: 14, fontWeight: 800 }}>
                    <Icon name={s.key} size={18} />{s.label} {s.count}
                  </span>
                ))}
              </div>
              <div style={{ ...row, gap: 8, borderTop: '1px solid rgba(255,255,255,0.28)', paddingTop: 10, fontSize: 15, fontWeight: 700 }}>
                <span style={{ flex: 1 }}>{hero.footText}</span>
                <Icon name="chevronRight" size={20} stroke={2.4} />
              </div>
            </div>
          </Link>
        ) : (
          <div style={{ marginTop: 12, border: '1.5px dashed ' + C.border, borderRadius: 18, padding: 20, fontSize: 17, fontWeight: 700, color: C.muted }}>
            {manual ? 'You’ve passed every exit in the sample corridor.' : 'End of the sample corridor. Restarting the drive…'}
          </div>
        )}

        {manual && hero && (
          <>
            <button onClick={() => setPassed([...passed, hero.num])} style={{ width: '100%', height: 64, marginTop: 10, borderRadius: 16, border: '2px solid ' + C.amber, background: 'transparent', color: C.amber, ...row, justifyContent: 'center', gap: 10, fontSize: 19, fontWeight: 900, cursor: 'pointer' }}>
              <Icon name="passed" size={24} stroke={2.6} />Passed {hero.info.title} {hero.num}
            </button>
            {lastPassed && (
              <div style={{ ...row, justifyContent: 'center', gap: 6, marginTop: 4, fontSize: 14, fontWeight: 700, color: C.muted }}>
                <span>Marked {exitInfo(lastPassed).label} as passed</span>
                <button onClick={() => setPassed(passed.slice(0, -1))} style={{ height: 40, border: 0, background: 'transparent', color: C.amber, fontSize: 14, fontWeight: 900, padding: '0 6px', cursor: 'pointer' }}>Undo</button>
              </div>
            )}
          </>
        )}

        <div style={{ ...row, justifyContent: 'space-between', margin: '20px 0 4px' }}>
          <span style={kicker}>THEN</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Ahead only · open now</span>
        </div>
        {rest.map((x) => (
          <Link key={x.num} to={'/exit/' + x.num} style={{ ...row, gap: 12, padding: '12px 0', borderBottom: '1px solid ' + C.line, color: C.fg, textDecoration: 'none' }}>
            <ExitPlate tab={x.info.tab} num={x.num} green={green} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, ...ellipsis }}>{x.label} · {x.place}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {x.svcs.map((s) => (
                  <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: s.on ? C.amber : C.muted2, fontSize: 13, fontWeight: 800 }}>
                    <Icon name={s.key} size={16} label={s.label} />{s.count}
                  </span>
                ))}
                {x.isMatch && <span style={{ height: 20, display: 'inline-flex', alignItems: 'center', padding: '1px 7px 0', borderRadius: 5, background: C.amber, color: C.ink, fontSize: 11, fontWeight: 900, letterSpacing: '0.06em' }}>YOUR STOP</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 900 }}>{x.rightBig}<span style={{ fontSize: 15, fontWeight: 800 }}>{x.rightUnit}</span></div>
            </div>
          </Link>
        ))}
      </main>
      <TabBar />
    </div>
  )
}
