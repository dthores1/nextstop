import { EXITS, PLACES, MI_PER_MIN, START_MP } from './data'

export const exitByNum = Object.fromEntries(EXITS.map((e) => [e.num, e]))
export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]))

// Sign-plate wording for an exit: a service plaza and a rest area are not numbered exits.
export function exitInfo(exitOrNum) {
  const e = typeof exitOrNum === 'string' ? exitByNum[exitOrNum] : exitOrNum
  if (!e) return { tab: 'EXIT', num: '', label: '', title: 'Exit' }
  if (e.plaza) return { tab: 'PLAZA', num: e.num, label: 'Plaza ' + e.num, title: 'Plaza' }
  if (e.rest) return { tab: 'REST', num: e.num, label: 'MP ' + e.num, title: 'Rest area' }
  return { tab: 'EXIT', num: e.num, label: 'Exit ' + e.num, title: 'Exit' }
}

export const placesAt = (num) => PLACES.filter((p) => p.exit === num)

// Service counts shown on the Ahead feed. Restrooms count any public one.
export function services(num) {
  const at = placesAt(num)
  const n = (cat) => at.filter((p) => p.cat === cat).length
  return { gas: n('gas'), food: n('food'), ev: n('ev'), lodging: n('lodging'), wc: at.filter((p) => p.wcPublic).length }
}

export const etaOf = (exit, position) => exit.base - position
export const milepost = (position) => START_MP + position * MI_PER_MIN
export const fmtEta = (eta) => (eta < 1 ? '<1' : String(Math.round(eta)))
export const fmtMiles = (eta) => (eta * MI_PER_MIN).toFixed(1)

export function exitsAhead(position) {
  return EXITS.filter((e) => e.feed && etaOf(e, position) > 0.05)
}

// "Between Exit 110 and 118" style wording for a milepost (manual mode).
export function positionTitle(mile) {
  const nums = EXITS.filter((e) => !e.rest && !e.plaza).map((e) => Number(e.num))
  if (nums.includes(mile)) return 'At Exit ' + mile
  const before = nums.filter((n) => n < mile).pop()
  const after = nums.find((n) => n > mile)
  if (before && after) return 'Between Exit ' + before + ' and ' + after
  return after ? 'Before Exit ' + after : 'After Exit ' + before
}

export function offText(p) {
  if (p.off === 0) return p.cat === 'wc' && exitByNum[p.exit]?.rest ? 'Right off the highway' : 'In the plaza'
  return (p.off < 1 ? '<1' : p.off) + ' min from ramp'
}

export function sideLabel(p) {
  if (p.side === 'R') return 'right of ramp'
  if (p.side === 'L') return 'left of ramp'
  return exitByNum[p.exit]?.rest ? 'at the rest area' : 'in the plaza'
}

// One-line service description for the stop card on the glance screen.
export function serviceText(p) {
  if (p.cat === 'food') return p.veg ? 'Vegetarian food' : 'Food'
  if (p.cat === 'ev') return 'EV charging · ' + p.attrs.replace(/^.*·\s*/, '')
  if (p.cat === 'gas') return 'Gas'
  if (p.cat === 'lodging') return 'Hotel'
  if (p.cat === 'coffee') return 'Coffee'
  return 'Restroom'
}
