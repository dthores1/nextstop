// Design tokens and a few style fragments reused across screens.
export const C = {
  bg: '#0B0F0D', fg: '#F4F6F2', muted: '#A9B3AD', muted2: '#C9D1CC', dim: '#7E8A83', dim2: '#8C9690',
  line: '#222B26', card: '#151B18', card2: '#121815', nav: '#0F1411', border: '#3A4640', chip: '#222B26', sel: '#2A3530',
  amber: '#F5B841', ink: '#14110A', amberBg: '#2A2312', green: '#0E6B47', ok: '#3FA66B', okLite: '#7FD6A4', okBg: '#12241A',
  crumb: '#1E2622',
}
export const kicker = { fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: C.muted }
export const ellipsis = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
export const row = { display: 'flex', alignItems: 'center' }
export const col = { display: 'flex', flexDirection: 'column' }
export const center = { display: 'flex', alignItems: 'center', justifyContent: 'center' }
export const circleBtn = { width: 44, height: 44, flex: 'none', borderRadius: 22, border: '1px solid ' + C.border, background: 'transparent', color: C.fg, ...center, cursor: 'pointer', padding: 0 }
export const primaryBtn = { height: 60, borderRadius: 16, border: 0, background: C.amber, color: C.ink, ...center, gap: 8, fontSize: 18, fontWeight: 900, cursor: 'pointer', textDecoration: 'none' }
export const ghostBtn = { height: 60, borderRadius: 16, border: '1.5px solid ' + C.amber, background: 'transparent', color: C.amber, ...center, gap: 8, fontSize: 18, fontWeight: 900, cursor: 'pointer', textDecoration: 'none' }
export const mono = (p, size = 44, font = 16, radius = 10) => ({ width: size, height: size, flex: 'none', borderRadius: radius, background: p.color, color: p.ink, ...center, fontSize: font, fontWeight: 900 })
