import Icon from '../components/Icon'
import { ExitTag } from '../components/ExitPlate'
import { Link, useNav } from '../nav'
import { useTrip } from '../state'
import { HIGHWAY, MI_PER_MIN } from '../data'
import { placeById, exitByNum, etaOf, exitInfo, fmtEta } from '../model'
import { C, row, col, center, circleBtn, kicker, primaryBtn, ghostBtn, mono } from '../ui'

const hwName = HIGHWAY.name + ' ' + HIGHWAY.direction[0] + HIGHWAY.direction.slice(1).toLowerCase()

export default function PlaceDetail() {
  const { params, back, reset } = useNav()
  const { mode, position, stop, setStop, setToast } = useTrip()
  const p = placeById[params[0]] || placeById['green-bowl']
  const exit = exitByNum[p.exit]
  const info = exitInfo(exit)
  const eta = etaOf(exit, position)
  const isStop = !!(stop && stop.placeIds.includes(p.id))

  const hoursText = p.hours === '24h' ? 'Open 24 hours' : p.open ? 'Open ' + p.hours : p.hours
  const whenText = mode === 'manual'
    ? (eta > 0.05 ? '+' + Math.round(eta * MI_PER_MIN) + ' mi ahead' : 'Behind you')
    : (eta > 0.05 ? fmtEta(eta) + ' min ahead' : 'Behind you')

  const chips = []
  if (p.cat === 'food' && p.veg) chips.push({ label: 'Vegetarian menu', on: true })
  if (p.wc && p.cat !== 'wc') chips.push({ label: 'Restrooms' })
  p.tags.forEach((t) => chips.push({ label: t }))

  const inside = p.off === 0
  const detour = inside ? 2 : p.off * 2 + 4
  const dist = (Math.max(p.off, 0.5) * 0.4).toFixed(1)
  const turn = p.side === 'R' ? 'right' : 'left'
  const steps = inside
    ? [
      { icon: 'exitRamp', green: true, text: exit.rest ? 'Pull off at the rest area at MP ' + exit.num : 'Stay on the turnpike' },
      { icon: 'pin', text: exit.rest ? p.name + ' right off the highway' : 'Pull into the service plaza at MP ' + exit.num },
      { icon: 'pin', text: p.name + (exit.rest ? '' : ' inside the plaza') },
    ]
    : [
      { icon: 'exitRamp', green: true, text: 'Take Exit ' + exit.num + ' toward ' + exit.toward },
      { icon: p.side === 'R' ? 'rampRight' : 'rampLeft', text: 'Turn ' + turn + ' on ' + exit.label + ' at the end of the ramp', label: (p.side === 'R' ? 'Right' : 'Left') + ' of the exit ramp' },
      { icon: 'pin', text: p.name + ' on the ' + turn + ' · ' + dist + ' mi' },
    ]

  const makeStop = () => setStop({ exit: p.exit, placeIds: [p.id], name: p.name })

  return (
    <div className="screen">
      <div style={{ padding: '16px 16px 0', ...row, gap: 10, flex: 'none' }}>
        <button onClick={() => back('/exit/' + p.exit)} aria-label={'Back to ' + info.label} style={circleBtn}><Icon name="chevronLeft" size={22} stroke={2.4} /></button>
        <ExitTag size={14} invert>{info.tab} {exit.num}</ExitTag>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>{whenText}</span>
      </div>
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px', ...col, gap: 18 }}>
        <div style={{ ...row, gap: 14 }}>
          <div style={mono(p, 64, 22, 14)}>{p.mono}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.05, fontWeight: 900 }}>{p.name}</h1>
            <div style={{ ...row, gap: 7, marginTop: 4, fontSize: 15, fontWeight: 700, color: C.muted, flexWrap: 'wrap' }}>
              <span>{p.kind}</span><span aria-hidden="true">·</span><span style={{ color: p.open ? C.muted : C.amber }}>{hoursText}</span>
            </div>
          </div>
        </div>
        <Link to={'/exit/' + p.exit} style={{ alignSelf: 'flex-start', height: 44, margin: '-8px 0 -6px', display: 'inline-flex', alignItems: 'center', gap: 4, color: C.amber, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
          View everything at {info.label}<Icon name="chevronRight" size={18} stroke={2.4} />
        </Link>
        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chips.map((c) => c.on ? (
              <span key={c.label} style={{ height: 34, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 17, background: C.okBg, border: '1.5px solid ' + C.ok, color: C.okLite, fontSize: 14, fontWeight: 800 }}>
                <Icon name="check" size={16} stroke={3} />{c.label}
              </span>
            ) : (
              <span key={c.label} style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 17, background: C.card, border: '1.5px solid ' + C.line, fontSize: 14, fontWeight: 800 }}>{c.label}</span>
            ))}
          </div>
        )}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, ...col, gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ ...kicker, flex: 1 }}>DETOUR</span>
            <span style={{ fontSize: 30, lineHeight: 1, fontWeight: 900, color: C.amber }}>~{detour}<span style={{ fontSize: 15, fontWeight: 800 }}> min</span></span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
            {inside
              ? `Adds about ${detour} minutes: pull off, park, and merge back onto ${hwName}.`
              : `Adds about ${detour} minutes of driving: off at Exit ${exit.num}, to ${p.name}, and back on ${hwName}.`}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Time spent at the stop isn’t included.</div>
        </div>
        <section aria-label="Getting there" style={col}>
          <h2 style={{ margin: '0 0 8px', ...kicker }}>GETTING THERE</h2>
          {steps.map((s, i) => (
            <div key={i} style={{ ...row, gap: 12, padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid ' + C.line : 0 }}>
              <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 8, background: s.green ? C.green : C.chip, color: s.green ? '#FFFFFF' : C.fg, ...center }}>
                <Icon name={s.icon} size={20} stroke={s.green ? 2.4 : 2.2} label={s.label} />
              </span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{s.text}</span>
            </div>
          ))}
        </section>
      </main>
      <div style={{ padding: '10px 16px 28px', borderTop: '1px solid ' + C.line, background: C.nav, ...col, gap: 8, flex: 'none' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textAlign: 'center' }}>
          {isStop ? 'This is your stop. Navigate opens directions now' : 'Navigate adds it as your stop and opens directions now'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <button onClick={() => { makeStop(); setToast('Directions to ' + p.name + ' would open in your maps app') }} style={ghostBtn}>
            <Icon name="send" size={20} />Navigate
          </button>
          {isStop ? (
            <button onClick={() => { setStop(null) }} style={{ ...primaryBtn, background: C.sel, color: C.fg }}>
              <Icon name="check" size={18} stroke={3} />Your stop
            </button>
          ) : (
            <button onClick={() => { makeStop(); reset('/ahead') }} style={primaryBtn}>
              <Icon name="plus" size={18} stroke={3} />Add stop
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
