import { useId } from 'react'
import { HIGHWAY } from '../data'

// Interstate shield drawn to the real sign's proportions: crest along the top with a dip in the middle,
// shoulders that bow out slightly, a point at the bottom, red band over blue, white border.
const OUTLINE = 'M50 12 C37 16 21 14 7 6 C4 8 3 10 3 13 C3 36 4 52 12 66 C20 80 34 90 50 97 C66 90 80 80 88 66 C96 52 97 36 97 13 C97 10 96 8 93 6 C79 14 63 16 50 12 Z'

export default function Shield({ width = 52 }) {
  const id = useId()
  return (
    <svg width={width} height={width} viewBox="0 0 100 100" role="img" aria-label={'Interstate ' + HIGHWAY.number} style={{ flex: 'none' }}>
      <defs>
        <clipPath id={id}><path d={OUTLINE} /></clipPath>
      </defs>
      <path d={OUTLINE} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="100" fill="#C41E3A" />
        <rect x="0" y="31" width="100" height="69" fill="#1F4E9C" />
        <rect x="0" y="29.5" width="100" height="1.5" fill="#FFFFFF" />
        <path d={OUTLINE} fill="none" stroke="#FFFFFF" strokeWidth="5" />
      </g>
      <text x="50" y="24.5" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight="800" fontSize="11" fill="#FFFFFF" textLength="62" lengthAdjust="spacingAndGlyphs">INTERSTATE</text>
      <text x="50" y="80" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight="900" fontSize="50" fill="#FFFFFF" letterSpacing="-1">{HIGHWAY.number}</text>
    </svg>
  )
}
