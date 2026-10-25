import { C } from '../ui'

// The little green highway-sign plate: "EXIT / 118".
export default function ExitPlate({ tab, num, width = 66, numSize = 24, green = C.green }) {
  return (
    <span style={{ width, flex: 'none', display: 'block', background: green, borderRadius: 9, padding: 3 }}>
      <span style={{ display: 'block', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 7, textAlign: 'center', padding: '5px 2px 3px', color: '#FFFFFF' }}>
        <span style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>{tab}</span>
        <span style={{ display: 'block', fontSize: numSize, lineHeight: 1, fontWeight: 900 }}>{num}</span>
      </span>
    </span>
  )
}

// White "EXIT 118" tag used on the big sign.
export function ExitTag({ children, size = 15, green = C.green, invert }) {
  return (
    <span style={{ background: invert ? green : '#FFFFFF', color: invert ? '#FFFFFF' : green, borderRadius: size > 18 ? 8 : 6, padding: size > 18 ? '6px 14px 3px' : '4px 10px 2px', fontSize: size, fontWeight: 900, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}
