import Icon from '../components/Icon'
import Shield from '../components/Shield'
import { ExitTag } from '../components/ExitPlate'
import { Link, useNav } from '../nav'
import { useTrip } from '../state'
import { HIGHWAY, PLACES, EXITS, CAT_LABEL } from '../data'
import { exitByNum, etaOf, exitInfo, placeById, services, fmtEta, fmtMiles, serviceText } from '../model'
import { C, row, col, center, mono } from '../ui'

const ICON_ROW = ['gas', 'food', 'ev', 'lodging', 'wc']

export default function Approaching() {
  const { params, back, nav, reset } = useNav()
  const { mode, position, stop, setStop, setDismissed } = useTrip()
  const manual = mode === 'manual'
  const exit = exitByNum[params[0]] || exitByNum['118']
  const info = exitInfo(exit)
  const eta = etaOf(exit, position)
  const sp = stop && stop.exit === exit.num ? placeById[stop.placeIds[0]] : null
  const hasStop = !!sp

  // What to aim for if this one goes by.
  const later = EXITS.filter((e) => e.base > exit.base)
  let passLead, passTarget
  if (hasStop) {
    const match = (p) => p.cat === sp.cat && (!sp.veg || p.veg) && p.open
    const target = later.find((e) => PLACES.some((p) => p.exit === e.num && match(p)))
    passLead = 'Next ' + (sp.cat === 'ev' ? 'fast charger' : sp.cat === 'food' && sp.veg ? 'vegetarian food' : CAT_LABEL[sp.cat].toLowerCase()) + ':'
    passTarget = target ? exitInfo(target).label + ' · ' + fmtEta(etaOf(target, position)) + ' min' : 'Nothing in the sample corridor'
  } else {
    const target = later.find((e) => { const s = services(e.num); return s.food > 0 && s.gas > 0 })
    passLead = 'Next food + gas:'
    passTarget = target ? exitInfo(target).label + ' · ' + fmtEta(etaOf(target, position)) + ' min' : '—'
  }

  const dismiss = () => setDismissed(exit.num)
  const svc = services(exit.num)
  const icons = ICON_ROW.filter((k) => svc[k] > 0).slice(0, 4)
  const pillAmber = hasStop || !manual

  return (
    <div className="screen" style={{ padding: '22px 16px 28px', gap: 16 }}>
      <div style={{ ...row, gap: 10 }}>
        <Shield width={34} />
        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.02em' }}>{HIGHWAY.direction}</span>
        <span style={{ flex: 1 }} />
        <span style={{ height: 30, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '1px 12px 0', borderRadius: 15, background: pillAmber ? C.amber : C.sel, color: pillAmber ? C.ink : C.fg, fontSize: 13, fontWeight: 900, letterSpacing: '0.08em' }}>
          {hasStop && <Icon name="flag" size={14} stroke={2.8} />}
          {hasStop ? 'YOUR STOP' : manual ? 'NEXT EXIT' : 'COMING UP'}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: C.green, borderRadius: 22, padding: 7, display: 'flex' }}>
        <div style={{ flex: 1, border: '3px solid ' + (hasStop ? C.amber : '#FFFFFF'), borderRadius: 16, padding: 20, ...col, gap: 14, color: '#FFFFFF', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ExitTag size={22}>{info.tab} {exit.num}</ExitTag>
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 800 }}>{exit.label}<br />{exit.place}</div>
          <div style={{ flex: 1 }} />
          {!manual ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: C.amber }}>
              <span style={{ fontSize: 128, lineHeight: 0.8, fontWeight: 900, letterSpacing: '-0.02em' }}>{Math.max(0.1, Number(fmtMiles(eta))).toFixed(1)}</span>
              <span style={{ fontSize: 34, fontWeight: 900 }}>MI</span>
            </div>
          ) : (
            <div style={{ ...col, gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 30, fontWeight: 900 }}>{info.tab}</span>
                <span style={{ fontSize: 128, lineHeight: 0.8, fontWeight: 900, letterSpacing: '-0.02em' }}>{exit.num}</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, opacity: 0.9 }}>First exit past your starting point</span>
            </div>
          )}
          <div style={{ ...row, gap: 10, fontSize: 22, fontWeight: 800 }}>
            <Icon name="exitRamp" size={30} stroke={2.4} />
            <span>{exit.plaza ? 'Plaza on the right' : manual ? 'Exit on the right' : 'Exit right · under ' + Math.max(1, Math.ceil(eta)) + ' min'}</span>
          </div>
          {!hasStop ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(icons.length, 1)}, minmax(0, 1fr))`, gap: 8, borderTop: '1.5px solid rgba(255,255,255,0.35)', paddingTop: 16 }}>
              {icons.map((k) => (
                <div key={k} style={{ ...col, alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 800 }}>
                  <Icon name={k} size={34} stroke={2} />{CAT_LABEL[k]}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...row, gap: 12, borderTop: '1.5px solid rgba(255,255,255,0.35)', paddingTop: 16 }}>
              <span style={{ ...mono(sp, 52, 19, 12), boxShadow: '0 0 0 2px ' + C.amber }}>{sp.mono}</span>
              <span style={{ flex: 1, minWidth: 0, ...col, gap: 3 }}>
                <span style={{ fontSize: 26, lineHeight: 1.05, fontWeight: 900 }}>{sp.name}</span>
                <span style={{ ...row, gap: 6, fontSize: 15, fontWeight: 800, color: C.amber }}>
                  <Icon name={sp.cat === 'wc' ? 'wc' : sp.cat} size={18} stroke={2.4} />{serviceText(sp)}
                </span>
              </span>
              <span style={{ flex: 'none', ...col, alignItems: 'flex-end', gap: 2 }}>
                {sp.side && <Icon name={sp.side === 'R' ? 'rampRight' : 'rampLeft'} size={26} label={(sp.side === 'R' ? 'Right' : 'Left') + ' of the exit ramp'} />}
                <span style={{ fontSize: 14, fontWeight: 800 }}>{sp.off === 0 ? 'inside' : (sp.off < 1 ? '<1' : sp.off) + ' min'}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...col, gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: C.muted }}>{hasStop ? 'IF YOU MISS IT' : 'IF YOU PASS IT'}</div>
        <div style={{ fontSize: 19, fontWeight: 700 }}>{passLead} <span style={{ color: C.amber, fontWeight: 900 }}>{passTarget}</span></div>
      </div>

      <div style={{ ...col, gap: 6 }}>
        {hasStop ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setStop(null); dismiss(); reset('/ahead') }} style={{ width: 112, flex: 'none', height: 64, borderRadius: 16, border: '1.5px solid ' + C.border, background: 'transparent', color: C.muted2, ...center, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>Skip stop</button>
            <Link to={'/place/' + sp.id} onClick={dismiss} style={{ flex: 1, height: 64, borderRadius: 16, background: C.amber, color: C.ink, ...center, gap: 8, fontSize: 20, fontWeight: 900, textDecoration: 'none' }}>
              <Icon name="send" size={22} stroke={2.4} />Navigate
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { dismiss(); back('/ahead') }} style={{ width: 128, flex: 'none', height: 64, borderRadius: 16, border: '1.5px solid ' + C.border, background: 'transparent', color: C.muted2, ...center, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>Keep driving</button>
            <Link to={'/exit/' + exit.num} onClick={dismiss} style={{ flex: 1, height: 64, borderRadius: 16, background: C.amber, color: C.ink, ...center, fontSize: 19, fontWeight: 900, textDecoration: 'none' }}>Stopping here</Link>
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, color: C.dim, textAlign: 'center' }}>{manual ? 'Mark the exit passed on the Ahead screen to move on' : 'Closes on its own once you pass the exit'}</div>
      </div>
    </div>
  )
}
