import Icon from '../components/Icon'
import ExitPlate from '../components/ExitPlate'
import TabBar from '../components/TabBar'
import { Link, useNav } from '../nav'
import { useTrip } from '../state'
import { PLACES, CATEGORIES, FOOD_KINDS, NEED_LABEL, NEED_NOUN, RESULT_NOUN, HIGHWAY } from '../data'
import { exitByNum, etaOf, exitInfo, exitsAhead, milepost, offText } from '../model'
import { C, row, col, center, kicker, ellipsis, mono } from '../ui'

const SCALE = 34 // minutes represented by a full time bar
const pct = (m) => (Math.max(0, m) / SCALE * 100).toFixed(1) + '%'
const cluster = (p) => p.exit + ':' + (p.off === 0 ? 'plaza' : p.side + '-' + Math.round(p.off))

export default function Find() {
  const { reset } = useNav()
  const { find, setFind, position, stop, setStop, setToast } = useTrip()
  const s = find
  const set = (patch) => setFind((f) => ({ ...f, ...patch }))

  const M = s.multi || {}
  const sel = CATEGORIES.map((c) => c[0]).filter((k) => M[k])
  const combined = sel.length > 1
  const cat = sel.length === 1 ? sel[0] : 'food'
  const K = s.kinds || {}

  // Timing from where we are now. Places behind us need a turnaround at the next exit.
  const nextAhead = exitsAhead(position)[0]
  const timed = (p) => {
    const e = exitByNum[p.exit]
    const eta = etaOf(e, position)
    if (eta > 0.05) return { ...p, drive: eta, uturn: 0, behind: false }
    const drive = nextAhead ? etaOf(nextAhead, position) : 0
    return { ...p, drive, uturn: Math.round((nextAhead ? nextAhead.base : position) - e.base) + 2, behind: true }
  }
  const D = {}
  for (const [k] of CATEGORIES) D[k] = PLACES.filter((p) => (k === 'wc' ? p.wcPublic : p.cat === k)).map(timed)
  const noteFor = (k, p) => {
    let t = k === 'wc' && p.cat !== 'wc' ? (p.cat === 'gas' ? 'Gas station' : NEED_LABEL[p.cat]) + ' · open to all · ' + p.hours : p.attrs
    return p.behind ? 'Behind you · ' + t : t
  }

  const cats = CATEGORIES.map(([k, label]) => {
    const on = !!M[k]
    const pick = () => {
      const next = { ...M, [k]: !on }
      if (Object.keys(next).some((x) => next[x])) set({ multi: next })
    }
    return { key: k, label, on, pick }
  })
  const kindsOn = ['pizza', 'fast', 'healthy', 'sitdown'].filter((k) => K[k])
  const foodOk = (p) => (!K.veg || p.veg) && (kindsOn.length === 0 || kindsOn.some((k) => p.kinds.includes(k)))
  const okPlace = (k, p) => (s.turn || !p.behind) && (!s.open || p.open) && (k !== 'food' || foodOk(p)) && (!s.chains || p.chain)

  // Single need: every matching place, ranked by time to arrive.
  const list = D[cat].filter((p) => okPlace(cat, p)).map((p) => ({ ...p, total: p.drive + p.uturn + p.off })).sort((a, b) => a.total - b.total)
  const results = list.map((p, i) => {
    const exitLabel = exitInfo(p.exit).label
    const offTxt = p.off === 0 ? 'on highway' : (p.off < 1 ? '<1' : p.off) + ' off'
    const where = p.behind
      ? exitLabel + ' · U-turn at ' + (nextAhead ? nextAhead.num : '—') + ' · ' + offTxt
      : exitLabel + ' · ' + Math.round(p.drive) + ' ahead + ' + offTxt
    const key = cat + ':' + p.id
    const picked = !!(s.stop && s.stop.key === key)
    return {
      ...p, exitLabel, where, picked, key,
      reach: String(Math.round(p.total)),
      note: noteFor(cat, p),
      ring: i === 0 ? C.amber : C.card,
      wDrive: pct(p.drive), wTurn: pct(p.uturn), wOff: pct(Math.max(p.off, 0.6)),
      add: () => {
        if (picked) { set({ stop: null }); if (stop && stop.placeIds.join() === p.id) setStop(null); return }
        set({ stop: { key, ids: [p.id], name: p.name, text: exitLabel + ' · ' + Math.round(p.total) + ' min away' } })
        setStop({ exit: p.exit, placeIds: [p.id], name: p.name })
      },
    }
  })

  // Several needs: group matching places by exit, rank by how many needs each covers, then by time.
  const groups = {}
  sel.forEach((k) => {
    D[k].forEach((p) => {
      if (!okPlace(k, p)) return
      const g = groups[p.exit] || (groups[p.exit] = { exit: p.exit, drive: p.drive, uturn: p.uturn, behind: p.behind, by: {} })
      ;(g.by[k] = g.by[k] || []).push(p)
    })
  })
  const wantWc = !!M.wc
  const destNeeds = sel.filter((k) => k !== 'wc')
  const needCount = sel.length
  let combos = Object.keys(groups).map((ex) => {
    const g = groups[ex]
    const e = exitByNum[ex]
    const lab = exitInfo(e)
    const bests = []
    const picked = []
    const lines = destNeeds.map((k) => {
      // If a restroom is wanted too, prefer places that have one; then whichever is closest to the ramp.
      const best = (g.by[k] || []).slice().sort((a, b) => (wantWc ? (b.wc ? 1 : 0) - (a.wc ? 1 : 0) : 0) || (a.off - b.off))[0]
      if (best) { bests.push(best); picked.push({ need: k, p: best }) }
      return { key: k, has: !!best, p: best, name: best ? best.name : '', offText: best ? offText(best) : '', missingText: 'No ' + NEED_NOUN[k] + ' here' }
    })
    let covered = bests.length
    if (wantWc) {
      // A restroom can come with another stop, or be a stop of its own (a rest area, a gas station).
      const host = bests.find((p) => p.wc)
      const own = host ? null : (g.by.wc || []).slice().sort((a, b) => a.off - b.off)[0]
      if (host || own) covered += 1
      if (own) { bests.push(own); picked.push({ need: 'wc', p: own }) }
      lines.push({ key: 'wc', has: !!(host || own), p: host || own, name: host ? 'Restroom at ' + host.name : own ? own.name : '', offText: own ? offText(own) : '', missingText: 'No restroom here' })
    }
    const all = covered === needCount
    const cl = bests.map(cluster)
    const sameSpot = all && cl.length > 1 && cl.every((c) => c === cl[0])
    const time = g.drive + g.uturn
    return {
      exit: ex, covered, all, t: time, time: String(Math.round(time)), tab: lab.tab, num: lab.num, exitLabel: lab.label,
      place: e.plaza || e.rest ? e.label : e.label + ' · ' + e.toward,
      sub: g.behind ? 'Behind you · turnaround' : e.plaza ? 'No exit needed' : e.rest ? 'Pull off, no exit' : 'Ahead',
      badge: all ? (needCount === 1 ? 'Has it' : 'Matches all ' + needCount) : covered + ' of ' + needCount,
      walk: sameSpot ? (cl[0].endsWith('plaza') ? 'All inside the plaza' : 'All on one block, walkable') : '',
      lines, picked,
      choose: () => { const init = {}; picked.forEach((x) => { init[x.p.id] = true }); set({ review: ex, picks: init }) },
    }
  })
  combos.sort((a, b) => (b.covered - a.covered) || (a.t - b.t))
  combos = combos.map((x, i) => ({ ...x, ring: i === 0 && x.all ? C.ok : C.card }))
  const allCount = combos.filter((x) => x.all).length

  // Review sheet for a chosen exit: confirm which places to add. The first one is where Navigate goes.
  const rvCombo = s.review ? combos.find((x) => x.exit === s.review) : null
  const PK = s.picks || {}
  let order = 0
  const rvItems = rvCombo ? rvCombo.picked.map((x) => {
    const on = !!PK[x.p.id]
    if (on) order += 1
    return {
      p: x.p, on, isFirst: on && order === 1,
      need: NEED_LABEL[x.need] + (x.p.wc && wantWc && x.need !== 'wc' ? ' · restroom' : ''),
      off: offText(x.p),
      flip: () => set({ picks: { ...PK, [x.p.id]: !on } }),
    }
  }) : []
  const chosen = rvItems.filter((i) => i.on)
  const rvConfirm = () => {
    if (!chosen.length || !rvCombo) return
    const ids = chosen.map((i) => i.p.id)
    const name = chosen.map((i) => i.p.name).join(' + ')
    set({ review: null, stop: { key: 'combo:' + rvCombo.exit, ids, name, text: rvCombo.exitLabel + ' · ' + rvCombo.time + ' min away · Navigate starts at ' + chosen[0].p.name } })
    setStop({ exit: rvCombo.exit, placeIds: ids, name })
  }

  const sumParts = []
  if (combined ? M.food : cat === 'food') FOOD_KINDS.forEach(([k, label]) => { if (K[k]) sumParts.push(k === 'veg' ? 'Vegetarian' : label) })
  if (s.open) sumParts.push('Open now')
  if (s.chains) sumParts.push('My chains')
  sumParts.push(s.turn ? 'Turnarounds OK' : 'Ahead only')

  const isFood = combined ? !!M.food : cat === 'food'
  const title = combined ? 'One stop for all' : 'Nearest ' + RESULT_NOUN[cat]
  const hasStop = !!(s.stop && stop && stop.placeIds.join() === s.stop.ids.join())
  const toggles = [['open', 'Open now'], ['chains', 'My chains']]

  const Switch = ({ on, label, flip }) => (
    <button role="switch" aria-checked={on} onClick={flip} style={{ height: 44, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 14px 0 8px', borderRadius: 22, border: '1.5px solid ' + (on ? C.amber : C.border), background: 'transparent', color: C.fg, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
      <span style={{ width: 28, height: 28, borderRadius: 14, background: on ? C.amber : C.chip, color: C.ink, ...center }}>{on && <Icon name="check" size={16} stroke={3} />}</span>
      {label}
    </button>
  )

  return (
    <div className="screen">
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px', ...col, gap: 14 }}>
        <div style={{ ...row, gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, flex: 1, lineHeight: 1.05 }}>{title}</h1>
          <span style={{ height: 32, display: 'inline-flex', alignItems: 'center', padding: '0 10px', borderRadius: 8, background: C.green, color: '#FFFFFF', fontSize: 14, fontWeight: 900, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{HIGHWAY.name} {HIGHWAY.direction[0]} · MP {Math.round(milepost(position))}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: -6 }}>
          {combined ? 'Showing exits that have all ' + sel.length + ' · tap one to remove it' : 'Pick more than one to find a single stop for everything'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {cats.map((c) => (
            <button key={c.key} onClick={c.pick} aria-pressed={c.on} style={{ height: 56, borderRadius: 14, border: '1.5px solid ' + (c.on ? C.amber : C.line), background: c.on ? C.amber : C.card, color: c.on ? C.ink : C.fg, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {c.on && <Icon name="check" size={16} stroke={3} />}{c.label}
            </button>
          ))}
        </div>
        <div style={{ ...row, gap: 10, minHeight: 48, padding: '0 4px 0 14px', borderRadius: 14, background: C.card }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 800, color: C.muted2, ...ellipsis }}>{sumParts.join(' · ')}</span>
          <button onClick={() => set({ showFilters: !s.showFilters })} aria-expanded={!!s.showFilters} style={{ flex: 'none', height: 44, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', border: 0, borderRadius: 10, background: s.showFilters ? C.amber : C.chip, color: s.showFilters ? C.ink : C.fg, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
            <Icon name="filter" size={18} stroke={2.4} />{s.showFilters ? 'Done' : 'Filters'}
          </button>
        </div>

        {s.showFilters && (
          <div style={{ ...col, gap: 14, padding: 14, borderRadius: 16, border: '1.5px solid ' + C.line }}>
            <div role="group" aria-label="Direction" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', background: C.card, borderRadius: 14, padding: 4, gap: 4 }}>
              <button onClick={() => set({ turn: false })} aria-pressed={!s.turn} style={{ height: 46, borderRadius: 11, border: 0, background: s.turn ? 'transparent' : C.sel, color: s.turn ? C.muted : C.fg, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Ahead only</button>
              <button onClick={() => set({ turn: true })} aria-pressed={!!s.turn} style={{ height: 46, borderRadius: 11, border: 0, background: s.turn ? C.sel : 'transparent', color: s.turn ? C.fg : C.muted, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Turnarounds OK</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {toggles.map(([k, label]) => <Switch key={k} on={!!s[k]} label={label} flip={() => set({ [k]: !s[k] })} />)}
            </div>
            {isFood && (
              <div style={{ ...col, gap: 8 }}>
                <span style={kicker}>KIND OF FOOD</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {FOOD_KINDS.map(([k, label]) => <Switch key={k} on={!!K[k]} label={label} flip={() => set({ kinds: { ...K, [k]: !K[k] } })} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {combined ? (
          <>
            <div style={{ ...col, gap: 2, marginTop: 6 }}>
              <span style={kicker}>{s.turn ? 'STOPS NEARBY' : 'STOPS AHEAD'}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.dim }}>
                {allCount === 0 ? 'No exit has everything' : allCount + (s.turn ? ' nearby ' : ' upcoming ') + (allCount === 1 ? 'exit has' : 'exits have') + ' everything'}
              </span>
            </div>
            {combos.map((x) => (
              <div key={x.exit} style={{ background: C.card, borderRadius: 16, padding: 14, ...col, gap: 12, border: '1.5px solid ' + x.ring }}>
                <div style={{ ...row, gap: 12 }}>
                  <ExitPlate tab={x.tab} num={x.num} width={62} numSize={22} />
                  <span style={{ flex: 1, minWidth: 0, ...col, gap: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, ...ellipsis }}>{x.place}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{x.sub}</span>
                  </span>
                  <span style={{ flex: 'none', fontSize: 30, lineHeight: 1, fontWeight: 900 }}>{x.time}<span style={{ fontSize: 14 }}> min</span></span>
                </div>
                <div style={{ ...row, gap: 8, flexWrap: 'wrap' }}>
                  {x.all ? (
                    <span style={{ height: 30, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '1px 10px 0', borderRadius: 15, background: C.ok, color: C.bg, fontSize: 14, fontWeight: 900 }}><Icon name="check" size={15} stroke={3.2} />{x.badge}</span>
                  ) : (
                    <span style={{ height: 30, display: 'inline-flex', alignItems: 'center', padding: '1px 10px 0', borderRadius: 15, border: '1.5px solid ' + C.border, color: C.muted2, fontSize: 14, fontWeight: 900 }}>{x.badge}</span>
                  )}
                  {x.walk && <span style={{ fontSize: 13, fontWeight: 700, color: C.okLite }}>{x.walk}</span>}
                </div>
                <div style={col}>
                  {x.lines.map((l) => l.has ? (
                    <Link key={l.key} to={'/place/' + l.p.id} style={{ minHeight: 44, ...row, gap: 10, borderTop: '1px solid ' + C.line, color: C.fg, textDecoration: 'none' }}>
                      <span style={{ width: 28, flex: 'none', display: 'inline-flex', justifyContent: 'center', color: C.okLite }}><Icon name={l.key} size={20} label={NEED_LABEL[l.key]} /></span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 800, ...ellipsis }}>{l.name}</span>
                      <span style={{ flex: 'none', fontSize: 13, fontWeight: 700, color: C.muted }}>{l.offText}</span>
                    </Link>
                  ) : (
                    <div key={l.key} style={{ minHeight: 44, ...row, gap: 10, borderTop: '1px solid ' + C.line, color: C.dim2 }}>
                      <span style={{ width: 28, flex: 'none', display: 'inline-flex', justifyContent: 'center' }}><Icon name="x" size={18} stroke={2.4} /></span>
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{l.missingText}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...row, gap: 10, borderTop: '1px solid ' + C.line, paddingTop: 10 }}>
                  <Link to={'/exit/' + x.exit} style={{ flex: 1, minWidth: 0, height: 44, display: 'inline-flex', alignItems: 'center', gap: 4, color: C.fg, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>View {x.exitLabel}<Icon name="chevronRight" size={18} stroke={2.4} /></Link>
                  <button onClick={x.choose} style={{ flex: 'none', height: 44, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 12, border: '1.5px solid ' + C.amber, background: 'transparent', color: C.amber, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}><Icon name="plus" size={16} stroke={3} />Add stop</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <span style={kicker}>BY TIME TO ARRIVE</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{results.length + (results.length === 1 ? ' match' : ' matches')}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 700, color: C.muted }}>
              {[['#5D6A63', 'Highway'], ['#7AA2F7', 'Turnaround'], [C.amber, 'Off highway']].map(([bg, label]) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 2, background: bg }} />{label}</span>
              ))}
            </div>
            {results.map((r) => (
              <div key={r.key} style={{ background: C.card, borderRadius: 16, padding: 14, ...col, gap: 10, border: '1.5px solid ' + r.ring }}>
                <Link to={'/place/' + r.id} aria-label={r.name + ' details'} style={{ ...row, gap: 12, color: C.fg, textDecoration: 'none' }}>
                  <span style={mono(r)}>{r.mono}</span>
                  <span style={{ flex: 1, minWidth: 0, ...col }}>
                    <span style={{ fontSize: 17, fontWeight: 800, ...ellipsis }}>{r.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{r.where}</span>
                  </span>
                  <span style={{ textAlign: 'right', flex: 'none', fontSize: 30, lineHeight: 1, fontWeight: 900 }}>{r.reach}<span style={{ fontSize: 14 }}> min</span></span>
                </Link>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: C.bg }}>
                  <span style={{ width: r.wDrive, background: '#5D6A63' }} />
                  <span style={{ width: r.wTurn, background: '#7AA2F7' }} />
                  <span style={{ width: r.wOff, background: C.amber }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: r.open ? C.muted2 : C.dim }}>{r.note}</div>
                <div style={{ ...row, gap: 10 }}>
                  <Link to={'/exit/' + r.exit} style={{ flex: 1, minWidth: 0, height: 44, display: 'inline-flex', alignItems: 'center', gap: 4, color: C.fg, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>View {r.exitLabel}<Icon name="chevronRight" size={18} stroke={2.4} /></Link>
                  <button onClick={r.add} aria-pressed={r.picked} style={{ flex: 'none', height: 44, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 12, border: '1.5px solid ' + C.amber, background: r.picked ? C.amber : 'transparent', color: r.picked ? C.ink : C.amber, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
                    <Icon name={r.picked ? 'check' : 'plus'} size={16} stroke={3} />{r.picked ? 'Added' : 'Add stop'}
                  </button>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div style={{ border: '1.5px dashed ' + C.border, borderRadius: 16, padding: 18, fontSize: 15, color: C.muted, lineHeight: 1.4 }}>Nothing matches in the next 35 minutes. Turn off a filter or allow turnarounds.</div>
            )}
          </>
        )}
      </main>

      {hasStop && (
        <div role="status" style={{ flex: 'none', margin: '0 12px 10px', padding: '8px 8px 8px 14px', borderRadius: 16, background: C.amber, color: C.ink, ...row, gap: 8 }}>
          <Icon name="check" size={22} stroke={3} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, ...ellipsis }}>{s.stop.name} added</div>
            <div style={{ fontSize: 13, fontWeight: 700, ...ellipsis }}>{s.stop.text}</div>
          </div>
          <Link to="/ahead" replaceStack style={{ flex: 'none', height: 44, display: 'inline-flex', alignItems: 'center', padding: '0 10px', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 900, textDecoration: 'underline' }}>Trip</Link>
          <button onClick={() => setToast('Directions to ' + s.stop.name.split(' + ')[0] + ' would open in your maps app')} style={{ flex: 'none', height: 44, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', border: 0, borderRadius: 12, background: C.ink, color: C.amber, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}><Icon name="send" size={16} stroke={2.4} />Navigate</button>
        </div>
      )}
      <TabBar />

      {rvCombo && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', ...col, justifyContent: 'flex-end', zIndex: 5 }} onClick={() => set({ review: null })}>
          <div role="dialog" aria-label={'Stop at ' + rvCombo.exitLabel} onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: '24px 24px 0 0', padding: '18px 16px 30px', ...col, gap: 14 }}>
            <div style={{ ...row, gap: 12 }}>
              <ExitPlate tab={rvCombo.tab} num={rvCombo.num} width={56} numSize={20} />
              <span style={{ flex: 1, minWidth: 0, ...col, gap: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 900 }}>Stop at {rvCombo.exitLabel}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{rvCombo.place} · {rvCombo.time} min</span>
              </span>
              <button onClick={() => set({ review: null })} aria-label="Close" style={{ width: 44, height: 44, flex: 'none', border: 0, borderRadius: 22, background: C.chip, color: C.fg, ...center, cursor: 'pointer' }}><Icon name="x" size={20} stroke={2.4} /></button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.muted2 }}>Add these to your trip. Navigate goes to the first one.</div>
            <div style={{ ...col, gap: 8 }}>
              {rvItems.map((i) => (
                <button key={i.p.id} role="checkbox" aria-checked={i.on} onClick={i.flip} style={{ minHeight: 68, ...row, gap: 12, padding: '8px 12px', borderRadius: 14, border: '1.5px solid ' + (i.on ? C.amber : C.border), background: C.nav, color: C.fg, textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, border: '2px solid ' + C.amber, background: i.on ? C.amber : 'transparent', color: C.ink, ...center }}>{i.on && <Icon name="check" size={16} stroke={3.2} />}</span>
                  <span style={mono(i.p, 40, 14, 9)}>{i.p.mono}</span>
                  <span style={{ flex: 1, minWidth: 0, ...col, gap: 2 }}>
                    <span style={{ ...row, gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 800 }}>{i.p.name}</span>
                      {i.isFirst && <span style={{ height: 20, display: 'inline-flex', alignItems: 'center', padding: '1px 7px 0', borderRadius: 5, background: C.amber, color: C.ink, fontSize: 11, fontWeight: 900, letterSpacing: '0.06em' }}>FIRST</span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{i.need} · {i.off}</span>
                  </span>
                </button>
              ))}
            </div>
            <button onClick={rvConfirm} style={{ height: 60, borderRadius: 16, border: 0, background: chosen.length ? C.amber : C.sel, color: chosen.length ? C.ink : C.dim2, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>
              {chosen.length === 0 ? 'Pick at least one place' : chosen.length === 1 ? 'Add ' + chosen[0].p.name : 'Add ' + chosen.length + ' stops at ' + rvCombo.exitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
