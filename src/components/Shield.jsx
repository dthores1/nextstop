import { HIGHWAY } from '../data'

// Interstate shield.
export default function Shield({ width = 52 }) {
  const height = Math.round(width * 56 / 52)
  return (
    <svg width={width} height={height} viewBox="0 0 52 56" role="img" aria-label={'Interstate ' + HIGHWAY.number} style={{ flex: 'none' }}>
      <path d="M4 4c7 2 15 2 22-1 7 3 15 3 22 1 3 10 3 20 0 28-4 10-12 17-22 21C16 49 8 42 4 32 1 24 1 14 4 4z" fill="#FFFFFF" />
      <path d="M7 7c6 1.5 13 1.5 19-1 6 2.5 13 2.5 19 1 .6 2.2 1 4.4 1.2 6.6H5.8c.2-2.2.6-4.4 1.2-6.6z" fill="#C8102E" />
      <path d="M5.8 15.6h40.4c.4 5.4-.2 10.8-2.2 15.6-3.6 8.6-10.4 14.6-18 18-7.6-3.4-14.4-9.4-18-18-2-4.8-2.6-10.2-2.2-15.6z" fill="#1C4FA0" />
      <text x="26" y="39" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight="900" fontSize="21" fill="#FFFFFF">{HIGHWAY.number}</text>
    </svg>
  )
}
