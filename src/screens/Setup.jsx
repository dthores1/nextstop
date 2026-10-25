import { useRef, useState } from 'react'
import Icon from '../components/Icon'
import { useNav } from '../nav'
import { useTrip } from '../state'
import { EXITS, HIGHWAY, START_MP } from '../data'
import { positionTitle } from '../model'
import { C, row, col, center, circleBtn, kicker, primaryBtn } from '../ui'

// Exit mileposts shown on the strip; labels closer than 4 miles to the previous one are dropped so they don't overlap.
const TICKS = EXITS.filter((e) => !e.rest && !e.plaza && Number(e.num) <= 146).map((e) => Number(e.num)).filter((n, i, a) => i === 0 || n - a[i - 1] >= 4)
const LO = 104, HI = 146
const pct = (m) => ((m - LO) / (HI - LO) * 100).toFixed(1) + '%'

const field = { height: 56, borderRadius: 14, border: '1.5px solid ' + C.border, background: C.card, color: C.fg, padding: '0 12px', fontSize: 18, fontWeight: 800, width: '100%', outline: 'none' }
const choice = { minHeight: 72, ...row, gap: 14, padding: '10px 14px', borderRadius: 16, border: '1.5px solid ' + C.border, background: C.card, color: C.fg, textAlign: 'left', cursor: 'pointer', width: '100%' }
const textBtn = { alignSelf: 'flex-start', height: 44, border: 0, background: 'transparent', color: C.amber, fontSize: 15, fontWeight: 800, padding: 0, cursor: 'pointer' }

export default function Setup() {
  const { reset } = useNav()
  const { setMode, setStartMile, setPassed, setDismissed, setRunning, setToast, startMile, mode } = useTrip()
  const [step, setStep] = useState('start')
  const [entry, setEntry] = useState('city')
  const [mile, setMile] = useState(mode === 'manual' ? startMile : START_MP)
  const [city, setCity] = useState('Sandusky')
  const [exitNum, setExitNum] = useState('118')
  const trackRef = useRef(null)

  const useLocation = () => { setMode('live'); setDismissed(null); reset('/ahead') }
  const startHere = () => { setMode('manual'); setStartMile(mile); setPassed([]); setDismissed(null); setRunning(false); reset('/ahead') }
  const exitNext = () => { const n = Number(exitNum); setMile(TICKS.includes(n) ? n : 118); setEntry('exit'); setStep('direction') }
  const prev = { highway: 'start', direction: entry === 'city' ? 'highway' : 'start', confirm: 'direction' }

  const crumbs = []
  if (step !== 'start') crumbs.push(entry === 'city' ? city + ', OH' : 'Ohio · Exit ' + exitNum)
  if (step === 'direction' || step === 'confirm') crumbs.push('I-80 / I-90')
  if (step === 'confirm') crumbs.push('East')

  const setFromPointer = (e) => {
    const r = trackRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - r.left, 0), r.width)
    setMile(Math.round(LO + 2 + (x / r.width) * (HI - LO - 4)))
  }

  return (
    <div className="screen" style={{ fontVariantNumeric: 'normal' }}>
      <div style={{ padding: '16px 16px 0', minHeight: 60, ...row, gap: 8, flex: 'none' }}>
        {step !== 'start' && <button onClick={() => setStep(prev[step] || 'start')} aria-label="Back" style={circleBtn}><Icon name="chevronLeft" size={22} stroke={2.4} /></button>}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {crumbs.map((c) => <span key={c} style={{ height: 30, display: 'inline-flex', alignItems: 'center', padding: '1px 10px 0', borderRadius: 15, background: C.crumb, color: C.muted2, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>{c}</span>)}
        </div>
      </div>
      <main style={{ flex: 1, overflowY: 'auto', padding: 16, ...col, gap: 18 }}>
        {step === 'start' && (
          <div style={{ ...col, gap: 18 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>Where are you starting?</h1>
            <div style={{ ...col, alignItems: 'center', gap: 8 }}>
              <button onClick={useLocation} aria-describedby="loc-hint" style={{ width: '100%', height: 60, borderRadius: 16, border: '1.5px solid ' + C.border, background: C.card, color: C.fg, ...center, gap: 10, padding: '0 16px', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>
                <Icon name="send" size={24} color={C.amber} />Use my location
              </button>
              <span id="loc-hint" style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Auto-detects your highway and direction</span>
            </div>
            <div style={{ ...row, gap: 10, color: C.muted, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em' }}>
              <span style={{ flex: 1, height: 1, background: C.line }} />OR ENTER IT<span style={{ flex: 1, height: 1, background: C.line }} />
            </div>
            {entry === 'city' ? (
              <div style={{ ...col, gap: 8 }}>
                <label htmlFor="city" style={kicker}>CITY OR TOWN</label>
                <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter a city or town" style={{ ...field, border: '1.5px solid ' + C.amber, padding: '0 16px', fontSize: 20 }} />
                <div style={{ ...col, borderRadius: 14, background: C.card, overflow: 'hidden' }}>
                  {[(city || 'Sandusky') + ', OH', (city || 'Sandusky') + ', MI'].map((name, i) => (
                    <button key={name} onClick={() => { setEntry('city'); setMile(START_MP); setStep('highway') }} style={{ minHeight: 56, ...row, gap: 12, padding: '8px 14px', border: 0, borderBottom: i === 0 ? '1px solid ' + C.line : 0, background: 'transparent', color: C.fg, textAlign: 'left', cursor: 'pointer' }}>
                      <Icon name="pin" size={20} color={C.muted} /><span style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>{name}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setEntry('exit')} style={textBtn}>Know your exit? Enter it instead</button>
              </div>
            ) : (
              <div style={{ ...col, gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  <div style={{ ...col, gap: 8 }}>
                    <label htmlFor="st" style={kicker}>STATE</label>
                    <select id="st" defaultValue="Ohio" style={field}><option>Ohio</option><option>Pennsylvania</option><option>Indiana</option></select>
                  </div>
                  <div style={{ ...col, gap: 8 }}>
                    <label htmlFor="ex" style={kicker}>EXIT NUMBER</label>
                    <input id="ex" value={exitNum} onChange={(e) => setExitNum(e.target.value.replace(/\D/g, ''))} inputMode="numeric" style={{ ...field, border: '1.5px solid ' + C.amber, padding: '0 14px', fontSize: 22, fontWeight: 900 }} />
                  </div>
                </div>
                <div style={{ ...col, gap: 8 }}>
                  <label htmlFor="hw" style={kicker}>HIGHWAY</label>
                  <select id="hw" defaultValue="I-80 / I-90 · Ohio Turnpike" style={field}><option>I-80 / I-90 · Ohio Turnpike</option><option>I-90 · Cleveland &amp; lakeshore</option><option>I-71</option><option>I-75</option></select>
                </div>
                <button onClick={exitNext} style={{ ...primaryBtn, height: 56, borderRadius: 14, fontSize: 17 }}>Continue · Exit {exitNum || '—'}</button>
                <button onClick={() => setEntry('city')} style={textBtn}>Search by city instead</button>
              </div>
            )}
          </div>
        )}

        {step === 'highway' && (
          <div style={{ ...col, gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>Choose your highway</h1>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.muted, marginTop: -6 }}>Highways near {city || 'Sandusky'}, OH</div>
            <div style={{ ...col, gap: 10 }}>
              <button onClick={() => setStep('direction')} style={choice}>
                <span style={{ flex: 'none', display: 'flex', gap: 4 }}>
                  {['80', '90'].map((n) => <span key={n} style={{ width: 34, height: 34, borderRadius: 8, background: '#1C4FA0', color: '#FFFFFF', ...center, fontSize: 15, fontWeight: 900 }}>{n}</span>)}
                </span>
                <span style={{ flex: 1, ...col, gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 900 }}>I-80 / I-90</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Ohio Turnpike · toll</span>
                </span>
                <Icon name="chevronRight" size={20} stroke={2.4} />
              </button>
              <button onClick={() => setToast('This prototype only has data for I-90 East')} style={choice}>
                <span style={{ flex: 'none', width: 72, display: 'flex' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, background: '#FFFFFF', color: C.ink, ...center, fontSize: 15, fontWeight: 900 }}>2</span>
                </span>
                <span style={{ flex: 1, ...col, gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 900 }}>OH-2</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Lake Erie shore</span>
                </span>
                <Icon name="chevronRight" size={20} stroke={2.4} />
              </button>
              <button onClick={() => setToast('This prototype only has data for I-90 East')} style={{ height: 52, borderRadius: 16, border: '1.5px dashed ' + C.border, background: 'transparent', color: C.muted2, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>Other nearby highways…</button>
            </div>
          </div>
        )}

        {step === 'direction' && (
          <div style={{ ...col, gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>Which way are you going?</h1>
            <div role="group" aria-label="Direction" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <button onClick={() => { setToast('Sample data covers eastbound only, continuing east'); setStep('confirm') }} style={{ height: 120, borderRadius: 18, border: '1.5px solid ' + C.border, background: C.card, color: C.fg, ...col, alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <span style={{ ...row, gap: 8, fontSize: 28, fontWeight: 900 }}><Icon name="arrowLeft" size={26} stroke={2.6} />WEST</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>toward {HIGHWAY.toward.west}</span>
              </button>
              <button onClick={() => setStep('confirm')} style={{ height: 120, borderRadius: 18, border: 0, background: C.green, color: '#FFFFFF', ...col, alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', boxShadow: `inset 0 0 0 3px ${C.green}, inset 0 0 0 5px #FFFFFF` }}>
                <span style={{ ...row, gap: 8, fontSize: 28, fontWeight: 900 }}>EAST<Icon name="arrowRight" size={26} stroke={2.6} /></span>
                <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.9 }}>toward {HIGHWAY.toward.east}</span>
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ ...col, gap: 14 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>Confirm where to start</h1>
            <div ref={trackRef} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e) }} onPointerMove={(e) => e.buttons && setFromPointer(e)}
              style={{ position: 'relative', height: 210, borderRadius: 18, background: C.card2, border: '1px solid ' + C.line, overflow: 'hidden', cursor: 'ew-resize', touchAction: 'none', userSelect: 'none' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 118, height: 10, background: C.border }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 122, height: 2, background: 'repeating-linear-gradient(90deg, #8C9690 0 10px, transparent 10px 20px)' }} />
              <div style={{ position: 'absolute', left: 30, top: 40, width: 110, height: 56, borderRadius: '50%', background: 'rgba(169,179,173,0.12)' }} />
              <div style={{ position: 'absolute', left: 50, top: 56, fontSize: 14, fontWeight: 800, color: C.muted2 }}>{city || 'Sandusky'}</div>
              {TICKS.map((t) => (
                <div key={t} style={{ position: 'absolute', left: pct(t), top: 134, transform: 'translateX(-50%)', ...col, alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 2, height: 8, background: '#8C9690' }} />
                  <span style={{ background: C.green, color: '#FFFFFF', borderRadius: 5, padding: '2px 5px 0', fontSize: 11, fontWeight: 900 }}>{t}</span>
                </div>
              ))}
              <div style={{ position: 'absolute', left: pct(mile), top: 70, transform: 'translateX(-50%)', ...col, alignItems: 'center', color: C.amber, transition: 'left 80ms' }}>
                <svg width="34" height="44" viewBox="0 0 24 31" aria-hidden="true"><path d="M12 30s-10-9.5-10-17.5a10 10 0 0 1 20 0C22 20.5 12 30 12 30z" fill={C.amber} /><circle cx="12" cy="12.5" r="4" fill={C.ink} /></svg>
              </div>
              <div style={{ position: 'absolute', right: 12, top: 12, ...row, gap: 6, fontSize: 13, fontWeight: 900, color: C.fg }}>EAST<Icon name="arrowRight" size={18} stroke={2.6} /></div>
            </div>
            <div style={{ ...row, gap: 10 }}>
              <button onClick={() => setMile(Math.max(LO + 2, mile - 2))} aria-label="Move start point west" style={{ width: 52, height: 52, flex: 'none', borderRadius: 14, border: '1.5px solid ' + C.border, background: 'transparent', color: C.fg, ...center, cursor: 'pointer' }}><Icon name="chevronLeft" size={22} stroke={2.6} /></button>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 900 }}>{positionTitle(mile)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Drag the pin or nudge it</div>
              </div>
              <button onClick={() => setMile(Math.min(HI - 2, mile + 2))} aria-label="Move start point east" style={{ width: 52, height: 52, flex: 'none', borderRadius: 14, border: '1.5px solid ' + C.border, background: 'transparent', color: C.fg, ...center, cursor: 'pointer' }}><Icon name="chevronRight" size={22} stroke={2.6} /></button>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 14, background: C.card }}>
              <Icon name="info" size={22} color={C.muted} style={{ flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: C.muted2 }}>Without location, NextStop shows exits ahead of this point but can’t tell when you pass them. Tap <span style={{ fontWeight: 900, color: C.fg }}>Passed this exit</span> to move ahead.</div>
            </div>
          </div>
        )}
      </main>
      {step === 'confirm' && (
        <div style={{ padding: '12px 16px 28px', borderTop: '1px solid ' + C.line, background: C.nav, flex: 'none' }}>
          <button onClick={startHere} style={{ ...primaryBtn, width: '100%' }}>Start from here</button>
        </div>
      )}
    </div>
  )
}
