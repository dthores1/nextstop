// Line icons from the design, drawn on a 24×24 grid.
const STROKE = {
  gas: <><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" /><path d="M2.5 21h13" /><path d="M7 7h4" /><path d="M14 10h2a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V8l-3-3" /></>,
  food: <><path d="M6 3v7a2 2 0 0 0 4 0V3" /><path d="M8 12v9" /><path d="M18 21V3c-2.2 1-3.5 3.8-3.5 7v4H18" /></>,
  ev: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />,
  lodging: <><path d="M3 19V6" /><path d="M3 15h18v4" /><path d="M21 15v-2.5A2.5 2.5 0 0 0 18.5 10H11v5" /><circle cx="7" cy="12" r="1.8" /></>,
  wc: <><circle cx="12" cy="4.5" r="2" /><path d="M8 21v-6.5L7 14V9.5A2.5 2.5 0 0 1 9.5 7h5A2.5 2.5 0 0 1 17 9.5V14l-1 .5V21" /></>,
  coffee: <><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3v2" /><path d="M12 3v2" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  x: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowLeft: <><path d="M20 12H4" /><path d="m10 6-6 6 6 6" /></>,
  arrowRight: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
  up: <><path d="M12 3v18" /><path d="m6 9 6-6 6 6" /></>,
  passed: <><path d="M12 20V5" /><path d="m6 11 6-6 6 6" /></>,
  send: <path d="M3 11 21 3l-8 18-2-8z" />,
  flag: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.2" /></>,
  pinOff: <><path d="M12 21s-6.5-6.2-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" /><path d="M4 4l16 16" /></>,
  exitRamp: <><path d="M7 21v-8a5 5 0 0 1 5-5h7" /><path d="m15 4 4 4-4 4" /></>,
  rampRight: <><path d="M8 21V3" /><path d="M8 15c0-4 3-6 8-7" /><circle cx="17.5" cy="7.8" r="1.8" fill="currentColor" /></>,
  rampLeft: <><path d="M16 21V3" /><path d="M16 15c0-4-3-6-8-7" /><circle cx="6.5" cy="7.8" r="1.8" fill="currentColor" /></>,
  filter: <><path d="M4 6h10" /><path d="M18 6h2" /><circle cx="16" cy="6" r="2" /><path d="M4 12h4" /><path d="M12 12h8" /><circle cx="10" cy="12" r="2" /><path d="M4 18h12" /><path d="M20 18h0" /><circle cx="18" cy="18" r="2" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  map: <><path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z" /><path d="M9 4v13.5" /><path d="M15 6.5V20" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><path d="M12 7.5v.5" /></>,
}
const FILL = {
  play: <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />,
  pause: <><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" /></>,
}

export const SERVICE_LABEL = { gas: 'Gas', food: 'Food', ev: 'EV charging', lodging: 'Lodging', wc: 'Restrooms', coffee: 'Coffee' }

export default function Icon({ name, size = 20, stroke = 2.2, label, style, color }) {
  const filled = FILL[name]
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}
      {...(filled ? {} : { fill: 'none', stroke: color || 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' })}
      {...(filled && color ? { color } : {})} {...a11y}>
      {filled || STROKE[name]}
    </svg>
  )
}
