import { useId } from 'react'
import { HIGHWAY } from '../data'

// Interstate shield. The outline is traced from the standard sign artwork (MUTCD M1-1), so the
// proportions match the real thing: nearly round through the middle, red band across the top 23%,
// "INTERSTATE" in the band, and the route number sitting just above center in the blue field.
const OUTLINE = 'M14.1 0.2 L15.6 0.6 L17.2 1 L18.8 1.3 L20.3 1.6 L21.9 1.9 L23.4 2.1 L25 2.3 L26.6 2.5 L28.1 2.6 L29.7 2.7 L31.3 2.7 L32.8 2.7 L34.4 2.7 L35.9 2.6 L37.5 2.4 L39.1 2.3 L40.6 2 L42.2 1.8 L43.8 1.6 L45.3 1.2 L46.9 0.9 L48.4 0.4 L50 0 L51.6 0.5 L53.1 0.9 L54.7 1.3 L56.3 1.6 L57.8 1.8 L59.4 2 L60.9 2.3 L62.5 2.4 L64.1 2.6 L65.6 2.7 L67.2 2.7 L68.8 2.7 L70.3 2.7 L71.9 2.6 L73.4 2.5 L75 2.3 L76.6 2.1 L78.1 1.9 L79.7 1.6 L81.3 1.3 L82.8 0.9 L84.4 0.5 L85.9 0.2 L87.7 1.6 L88.8 3.1 L89.8 4.7 L90.9 6.3 L91.8 7.8 L92.7 9.4 L93.4 10.9 L94.1 12.5 L94.8 14.1 L95.5 15.6 L96.1 17.2 L96.6 18.8 L97.2 20.3 L97.7 21.9 L98 23.4 L98.4 25 L98.8 26.6 L99.1 28.1 L99.3 29.7 L99.5 31.3 L99.7 32.8 L99.8 34.4 L99.8 35.9 L99.9 37.5 L99.9 39.1 L99.9 40.6 L99.8 42.2 L99.8 43.8 L99.6 45.3 L99.4 46.9 L99.2 48.4 L98.9 50 L98.6 51.6 L98.3 53.1 L97.9 54.7 L97.4 56.3 L97 57.8 L96.4 59.4 L95.9 60.9 L95.2 62.5 L94.6 64.1 L93.8 65.6 L93.1 67.2 L92.3 68.8 L91.4 70.3 L90.4 71.9 L89.5 73.4 L88.4 75 L87.2 76.6 L85.9 78.1 L84.6 79.7 L83.2 81.3 L81.7 82.8 L80.2 84.4 L78.4 85.9 L76.5 87.5 L74.5 89.1 L72.3 90.6 L69.8 92.2 L67.1 93.8 L64 95.3 L60.4 96.9 L55.9 98.4 L50 100 L44 98.4 L39.5 96.9 L35.9 95.3 L32.8 93.8 L30.1 92.2 L27.7 90.6 L25.5 89.1 L23.4 87.5 L21.6 85.9 L19.8 84.4 L18.2 82.8 L16.7 81.3 L15.3 79.7 L14 78.1 L12.7 76.6 L11.6 75 L10.5 73.4 L9.5 71.9 L8.5 70.3 L7.7 68.8 L6.8 67.2 L6.1 65.6 L5.3 64.1 L4.7 62.5 L4.1 60.9 L3.5 59.4 L3 57.8 L2.5 56.3 L2 54.7 L1.6 53.1 L1.3 51.6 L1 50 L0.7 48.4 L0.5 46.9 L0.3 45.3 L0.2 43.8 L0.1 42.2 L0 40.6 L0 39.1 L0 37.5 L0.1 35.9 L0.2 34.4 L0.2 32.8 L0.5 31.3 L0.6 29.7 L0.9 28.1 L1.2 26.6 L1.5 25 L1.9 23.4 L2.3 21.9 L2.7 20.3 L3.3 18.8 L3.8 17.2 L4.4 15.6 L5.1 14.1 L5.7 12.5 L6.5 10.9 L7.3 9.4 L8.1 7.8 L9.1 6.3 L10.1 4.7 L11.1 3.1 L12.3 1.6 Z'

export default function Shield({ width = 52 }) {
  const id = useId()
  return (
    <svg width={width} height={width} viewBox="0 0 100 100" role="img" aria-label={'Interstate ' + HIGHWAY.number} style={{ flex: 'none' }}>
      <defs>
        <clipPath id={id}><path d={OUTLINE} /></clipPath>
      </defs>
      <path d={OUTLINE} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="100" fill="#BF1E2E" />
        <rect x="0" y="22.8" width="100" height="78" fill="#1C4E9A" />
        <rect x="0" y="21.6" width="100" height="1.4" fill="#FFFFFF" />
        <path d={OUTLINE} fill="none" stroke="#FFFFFF" strokeWidth="4.6" />
      </g>
      <text x="50" y="18.6" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight="700" fontSize="14" fill="#FFFFFF" textLength="62" lengthAdjust="spacingAndGlyphs">INTERSTATE</text>
      <text x="50" y="76" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight="900" fontSize="63" fill="#FFFFFF" textLength="66" lengthAdjust="spacingAndGlyphs">{HIGHWAY.number}</text>
    </svg>
  )
}
