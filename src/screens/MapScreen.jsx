import Icon from '../components/Icon'
import TabBar from '../components/TabBar'
import { useTrip } from '../state'
import { HIGHWAY, EXITS } from '../data'
import { exitInfo, etaOf, milepost } from '../model'
import { C, row, col, kicker } from '../ui'

// Not part of the design: a simple corridor strip so the Map tab isn't a dead end.
export default function MapScreen() {
  const { position, stop } = useTrip()
  const mp = milepost(position)
  const shown = EXITS.filter((e) => e.feed)
  return (
    <div className="screen">
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px', ...col, gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>Map</h1>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{HIGHWAY.name} {HIGHWAY.direction[0] + HIGHWAY.direction.slice(1).toLowerCase()} · {HIGHWAY.road} · MP {Math.round(mp)}</div>
        <div style={{ background: C.card2, borderRadius: 18, border: '1px solid ' + C.line, padding: '18px 16px', ...col, gap: 0 }}>
          <span style={{ ...kicker, marginBottom: 10 }}>CORRIDOR</span>
          {shown.map((e, i) => {
            const eta = etaOf(e, position)
            const behind = eta <= 0.05
            const isStop = stop && stop.exit === e.num
            return (
              <div key={e.num} style={{ ...row, gap: 12, minHeight: 48 }}>
                <div style={{ width: 22, ...col, alignItems: 'center', alignSelf: 'stretch' }}>
                  <span style={{ flex: 1, width: 4, background: i === 0 ? 'transparent' : behind ? C.border : C.green }} />
                  <span style={{ width: 14, height: 14, borderRadius: 7, background: isStop ? C.amber : behind ? C.border : C.green, flex: 'none', boxShadow: isStop ? '0 0 0 3px ' + C.amberBg : 'none' }} />
                  <span style={{ flex: 1, width: 4, background: i === shown.length - 1 ? 'transparent' : (etaOf(shown[i + 1], position) <= 0.05 ? C.border : C.green) }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, padding: '6px 0' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: behind ? C.dim : C.fg }}>{exitInfo(e).label} · {e.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{e.place}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: behind ? C.dim : isStop ? C.amber : C.fg }}>{behind ? 'passed' : Math.round(eta) + ' min'}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 14, background: C.card }}>
          <Icon name="info" size={22} color={C.muted} style={{ flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: C.muted2 }}>A real map isn’t part of this prototype. This strip shows the sample corridor and where you are on it.</div>
        </div>
      </main>
      <TabBar />
    </div>
  )
}
