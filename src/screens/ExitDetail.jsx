import { useState } from 'react'
import Icon from '../components/Icon'
import { ExitTag } from '../components/ExitPlate'
import { Link, useNav } from '../nav'
import { useTrip } from '../state'
import { HIGHWAY, MI_PER_MIN } from '../data'
import { exitByNum, etaOf, exitInfo, placesAt, fmtEta, fmtMiles } from '../model'
import { C, row, col, circleBtn, ellipsis, mono } from '../ui'

const SECTIONS = [
  ['food', 'FOOD', 'Food'], ['gas', 'GAS', 'Gas'], ['ev', 'EV CHARGING', 'EV charging'], ['lodging', 'HOTELS', 'Hotels'], ['coffee', 'COFFEE', 'Coffee'], ['wc', 'RESTROOMS', 'Restrooms'],
]
const PREVIEW = 3

export default function ExitDetail() {
  const { params, back } = useNav()
  const { mode, position, stop } = useTrip()
  const exit = exitByNum[params[0]] || exitByNum['118']
  const info = exitInfo(exit)
  const eta = etaOf(exit, position)
  const at = placesAt(exit.num)
  const stopCat = stop && stop.exit === exit.num ? at.find((p) => p.id === stop.placeIds[0])?.cat : null
  const [open, setOpen] = useState({ food: true, [stopCat || 'food']: true })
  const [all, setAll] = useState({})

  const sections = SECTIONS.map(([k, upper, title]) => {
    let rows = k === 'wc'
      ? at.filter((p) => p.wc).map((p) => ({ ...p, attrs: (p.wcPublic ? 'Open to all' : 'Customers') + ' · ' + p.hours }))
      : at.filter((p) => p.cat === k)
    rows = rows.slice().sort((a, b) => a.off - b.off)
    return { key: k, upper, title, rows, expanded: !!open[k], showAll: !!all[k] }
  }).filter((s) => s.rows.length)

  const whenText = mode === 'manual'
    ? (eta > 0.05 ? '+' + Math.round(eta * MI_PER_MIN) + ' mi ahead' : 'Behind you')
    : (eta > 0.05 ? fmtEta(eta) + ' min ahead' : 'Behind you')

  return (
    <div className="screen">
      <div style={{ padding: '16px 16px 0', ...row, gap: 8, flex: 'none' }}>
        <button onClick={() => back('/ahead')} aria-label="Back to Ahead" style={circleBtn}><Icon name="chevronLeft" size={22} stroke={2.4} /></button>
        <span style={{ ...row, gap: 7, fontSize: 15, fontWeight: 700, color: C.muted }}><span>{HIGHWAY.name} {HIGHWAY.direction[0] + HIGHWAY.direction.slice(1).toLowerCase()}</span><span aria-hidden="true">·</span><span>{HIGHWAY.road}</span></span>
      </div>
      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px', ...col, gap: 14, position: 'relative' }}>
        <div style={{ background: C.green, borderRadius: 18, padding: 6, flex: 'none' }}>
          <div style={{ border: '2.5px solid #FFFFFF', borderRadius: 13, padding: '14px 16px 16px', color: '#FFFFFF', ...col, gap: 8 }}>
            <div style={{ ...row, justifyContent: 'space-between' }}>
              <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{exit.label}</span>
              <ExitTag>{info.tab} {exit.num}</ExitTag>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{exit.place}</div>
            <div style={{ ...row, gap: 7, fontSize: 16, fontWeight: 700, opacity: 0.9 }}>
              <span>{whenText}</span>
              {mode !== 'manual' && eta > 0.05 && <><span aria-hidden="true">·</span><span>{fmtMiles(eta)} mi</span></>}
            </div>
          </div>
        </div>
        <div style={{ ...row, gap: 6, fontSize: 12, fontWeight: 700, color: C.muted, flex: 'none', flexWrap: 'wrap' }}>
          <span>{exit.plaza || exit.rest ? 'Everything is inside, no ramp to leave' : 'Times are driving from the ramp'}</span>
          {!exit.plaza && !exit.rest && <><span aria-hidden="true">·</span><Icon name="rampRight" size={16} /><span>= side of the exit ramp</span></>}
        </div>

        {sections.map((sc) => {
          const shown = sc.showAll ? sc.rows : sc.rows.slice(0, PREVIEW)
          return (
            <section key={sc.key} aria-label={sc.title} style={{ ...col, borderRadius: 16, background: C.card2, flex: 'none' }}>
              <button onClick={() => setOpen({ ...open, [sc.key]: !sc.expanded })} aria-expanded={sc.expanded}
                style={{ height: 56, ...row, gap: 10, padding: '0 14px', border: 0, background: 'transparent', color: C.fg, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ color: C.muted2, display: 'inline-flex' }}><Icon name={sc.key} size={20} /></span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 900, letterSpacing: '0.1em' }}>{sc.upper}</span>
                <span style={{ minWidth: 28, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1px 8px 0', borderRadius: 13, background: C.chip, fontSize: 13, fontWeight: 900 }}>{sc.rows.length}</span>
                <Icon name="chevronDown" size={20} stroke={2.4} style={{ transform: sc.expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>
              {sc.expanded && (
                <div style={{ ...col, padding: '0 14px 6px' }}>
                  {shown.map((p) => (
                    <Link key={p.id} to={'/place/' + p.id} style={{ ...row, gap: 12, padding: '11px 0', borderTop: '1px solid ' + C.line, color: C.fg, textDecoration: 'none' }}>
                      <span style={mono(p)}>{p.mono}</span>
                      <span style={{ flex: 1, minWidth: 0, ...col, gap: 3 }}>
                        <span style={{ fontSize: 17, fontWeight: 800, ...ellipsis }}>{p.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.open ? C.muted : C.dim, ...ellipsis }}>{p.attrs}</span>
                      </span>
                      <span style={{ flex: 'none', ...col, alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 17, fontWeight: 900 }}>{p.off === 0 ? 'inside' : (p.off < 1 ? '<1' : p.off) + ' min'}</span>
                        <span style={{ color: C.muted2, display: 'inline-flex', minHeight: 20 }}>
                          {p.side && <Icon name={p.side === 'R' ? 'rampRight' : 'rampLeft'} size={20} label={(p.side === 'R' ? 'Right' : 'Left') + ' of the exit ramp'} />}
                        </span>
                      </span>
                    </Link>
                  ))}
                  {sc.rows.length > PREVIEW && (
                    <button onClick={() => setAll({ ...all, [sc.key]: !sc.showAll })} style={{ height: 44, border: 0, borderTop: '1px solid ' + C.line, background: 'transparent', color: C.amber, fontSize: 15, fontWeight: 800, textAlign: 'left', padding: 0, cursor: 'pointer' }}>
                      {sc.showAll ? 'Show fewer' : 'Show all ' + sc.rows.length}
                    </button>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
