// Hardcoded sample corridor: I-90 East on the Ohio Turnpike, starting near Sandusky (MP 114).
// Everything on screen is derived from these two tables, so counts and lists stay consistent.

export const HIGHWAY = {
  number: '90',
  name: 'I-90',
  direction: 'EAST',
  road: 'Ohio Turnpike',
  near: 'Sandusky',
  toward: { east: 'Cleveland', west: 'Toledo' },
}

export const START_MP = 114 // milepost of the starting point
export const MI_PER_MIN = 1.15 // ~69 mph; converts drive minutes to miles

// base = minutes of highway driving from MP 114; off = typical minutes from the ramp to the services
export const EXITS = [
  { num: '110', label: 'SR-4', place: 'Bellevue', toward: 'Bellevue', base: -3.5, off: 2, ease: 'same-side ramps', feed: false },
  { num: '118', label: 'US-250', place: 'Sandusky / Norwalk', toward: 'Sandusky', base: 3.6, off: 1, ease: 'same-side ramps', feed: true },
  { num: '128', rest: true, label: 'Rest area', place: 'Right off the highway', toward: '', base: 12.2, off: 0, ease: 'pull off, no exit', feed: false },
  { num: '135', label: 'Baumhart Rd', place: 'Vermilion', toward: 'Vermilion', base: 18.2, off: 3, ease: 'one left turn', feed: true },
  { num: '139', plaza: true, label: 'Service plaza', place: 'No exit needed', toward: '', base: 21.6, off: 0, ease: 'stay on the turnpike', feed: true },
  { num: '140', label: 'SR-58', place: 'Amherst / Oberlin', toward: 'Amherst', base: 22.4, off: 2, ease: 'same-side ramps', feed: true },
  { num: '142', label: 'I-90 / SR-2', place: 'Lorain', toward: 'Lorain', base: 24.1, off: 4, ease: 'busy interchange', feed: true },
  { num: '151', label: 'I-480', place: 'North Ridgeville', toward: 'North Ridgeville', base: 31.5, off: 2, ease: 'same-side ramps', feed: true },
]

// Place shape:
//  cat: 'food' | 'gas' | 'ev' | 'lodging' | 'coffee' | 'wc'   (wc = a restroom-only stop like a rest area)
//  off: minutes from the ramp; side: 'R' | 'L' | null (null = inside a plaza / rest area)
//  hours: 'till 10 PM' | '24h' | 'Opens at 4 PM'; open: open right now
//  veg: vegetarian menu / options; chain: a chain the driver may already know
//  kinds: food tags used by the Find filters: pizza, fast, healthy, sitdown
//  wc: has a restroom; wcPublic: restroom open to anyone (not just customers)
//  kind: short descriptor for the place page; tags: extra chips for the place page
const P = (id, name, mono, color, ink, exit, cat, o) => ({
  id, name, mono, color, ink, exit, cat,
  off: 1, side: 'R', hours: '24h', open: true, veg: false, chain: false, kinds: [], wc: false, wcPublic: false,
  kind: '', tags: [], attrs: '', ...o,
})

export const PLACES = [
  // Exit 110 — behind the starting point
  P('harvest-table', 'Harvest Table', 'HT', '#9C6B3C', '#FFFFFF', '110', 'food', { off: 2, side: 'L', hours: 'till 8 PM', veg: true, kinds: ['healthy', 'sitdown'], wc: true, kind: 'Farm-to-table café', attrs: 'Veg-friendly café · till 8 PM' }),
  P('firelands-charge', 'Firelands Charge', 'FC', '#7FD6A4', '#0B0F0D', '110', 'ev', { off: 1, side: 'R', kind: 'Level 3 charging', attrs: '2 × 50 kW' }),

  // Exit 118 — US-250, Sandusky / Norwalk
  P('green-bowl', 'Green Bowl', 'GB', '#5BAF4A', '#0B0F0D', '118', 'food', { off: 1, side: 'R', hours: 'till 10 PM', veg: true, kinds: ['healthy'], wc: true, kind: 'Bowls & wraps', tags: ['Order ahead'], attrs: 'Vegetarian menu · till 10 PM' }),
  P('cornerstone-grill', 'Cornerstone Grill', 'CG', '#D2452F', '#FFFFFF', '118', 'food', { off: 1, side: 'R', hours: '24h', veg: true, chain: true, kinds: ['fast'], wc: true, kind: 'Burgers & drive-thru', tags: ['Drive-thru'], attrs: 'Veg options · drive-thru · 24h' }),
  P('lakeside-pancake', 'Lakeside Pancake House', 'LP', '#3E8EDE', '#FFFFFF', '118', 'food', { off: 3, side: 'L', hours: 'till 3 PM', kinds: ['sitdown'], wc: true, kind: 'Breakfast all day', attrs: 'Sit-down · till 3 PM' }),
  P('pit-stop-bbq', 'Pit Stop BBQ', 'PB', '#8A4B2A', '#FFFFFF', '118', 'food', { off: 3, side: 'L', hours: 'till 9 PM', kinds: ['sitdown'], wc: true, kind: 'Smokehouse', attrs: 'Sit-down · till 9 PM' }),
  P('firehouse-slice', 'Firehouse Slice', 'FS', '#E4572E', '#FFFFFF', '118', 'food', { off: 2, side: 'R', hours: 'till 11 PM', veg: true, kinds: ['pizza', 'fast'], wc: true, kind: 'Pizza by the slice', attrs: 'Veggie pies · till 11 PM' }),
  P('sunrise-fuel', 'Sunrise Fuel', 'SF', '#F08A24', '#14110A', '118', 'gas', { off: 0.5, side: 'R', hours: '24h', chain: true, wc: true, wcPublic: true, kind: 'Gas & convenience', tags: ['Diesel', 'Car wash'], attrs: 'Restrooms · 24h' }),
  P('firelands-fuel', 'Firelands Fuel', 'FF', '#2F9E8F', '#0B0F0D', '118', 'gas', { off: 2, side: 'R', hours: 'till midnight', wc: true, wcPublic: true, kind: 'Gas & diesel', attrs: 'Diesel · till midnight' }),
  P('lakeport-gas', 'Lakeport Gas', 'LG', '#C9D1CC', '#14110A', '118', 'gas', { off: 2, side: 'L', hours: '24h', kind: 'Gas', attrs: 'Cash discount · 24h' }),
  P('voltway-118', 'Voltway', 'VW', '#2E5BFF', '#FFFFFF', '118', 'ev', { off: 1, side: 'R', chain: true, kind: 'Fast charging', tags: ['CCS', 'NACS'], attrs: '4 × 150 kW · 2 open now' }),
  P('lakeshore-inn', 'Lakeshore Inn', 'LI', '#6C5CE0', '#FFFFFF', '118', 'lodging', { off: 2, side: 'L', chain: true, wc: true, kind: 'Hotel', tags: ['EV charging on site'], attrs: 'EV charging on site' }),
  P('turnpike-suites', 'Turnpike Suites', 'TS', '#3E8EDE', '#FFFFFF', '118', 'lodging', { off: 2, side: 'R', wc: true, kind: 'Hotel', tags: ['Breakfast included'], attrs: 'Breakfast included' }),
  P('sandusky-lodge', 'Sandusky Lodge', 'SL', '#9C6B3C', '#FFFFFF', '118', 'lodging', { off: 4, side: 'L', wc: true, kind: 'Lodge', tags: ['Pet friendly'], attrs: 'Pet friendly' }),
  P('rest-easy-motel', 'Rest Easy Motel', 'RE', '#C9D1CC', '#14110A', '118', 'lodging', { off: 3, side: 'R', kind: 'Motel', attrs: 'Budget' }),
  P('bean-and-mile', 'Bean & Mile', 'BM', '#8A5A3B', '#FFFFFF', '118', 'coffee', { off: 1, side: 'R', hours: 'till 7 PM', wc: true, kind: 'Coffee & pastries', tags: ['Drive-thru'], attrs: 'Oat milk · drive-thru' }),

  // MP 128 — rest area
  P('rest-area-128', 'Rest area', 'RA', '#C9D1CC', '#14110A', '128', 'wc', { off: 0, side: null, hours: '24h', wc: true, wcPublic: true, kind: 'Rest area', tags: ['Vending', 'Picnic tables'], attrs: 'Restrooms only · right off the highway' }),

  // Exit 135 — Baumhart Rd, Vermilion
  P('lakeside-diner', 'Lakeside Diner', 'LD', '#3E8EDE', '#FFFFFF', '135', 'food', { off: 3, side: 'L', hours: 'till 9 PM', kinds: ['sitdown'], wc: true, kind: 'Diner', attrs: 'Sit-down · till 9 PM' }),
  P('harbor-fish-fry', 'Harbor Fish Fry', 'HF', '#2F9E8F', '#0B0F0D', '135', 'food', { off: 2, side: 'R', hours: 'till 8 PM', kinds: ['fast'], wc: true, kind: 'Fish & chips', attrs: 'Counter service · till 8 PM' }),
  P('baumhart-fuel', 'Baumhart Fuel', 'BF', '#F08A24', '#14110A', '135', 'gas', { off: 1, side: 'R', hours: '24h', wc: true, wcPublic: true, kind: 'Gas & convenience', attrs: 'Restrooms · 24h' }),

  // Plaza 139 — service plaza, no exit needed
  P('mesa-burrito', 'Mesa Burrito', 'MB', '#E9B949', '#14110A', '139', 'food', { off: 0, side: null, hours: 'till 11 PM', veg: true, chain: true, kinds: ['fast'], wc: true, kind: 'Burritos & bowls', attrs: 'Bean burritos · till 11 PM' }),
  P('turnpike-grill', 'Turnpike Grill', 'TG', '#D2452F', '#FFFFFF', '139', 'food', { off: 0, side: null, hours: '24h', chain: true, kinds: ['fast'], wc: true, kind: 'Burgers', attrs: 'Burgers · 24h' }),
  P('soup-salad-stop', 'Soup & Salad Stop', 'SS', '#5BAF4A', '#0B0F0D', '139', 'food', { off: 0, side: null, hours: 'till 9 PM', veg: true, kinds: ['healthy'], wc: true, kind: 'Salads & soups', attrs: 'Vegetarian options · till 9 PM' }),
  P('pretzel-hut', 'Pretzel Hut', 'PH', '#E9B949', '#14110A', '139', 'food', { off: 0, side: null, hours: 'till 10 PM', veg: true, chain: true, kinds: ['fast'], wc: true, kind: 'Snacks', attrs: 'Snacks · till 10 PM' }),
  P('plaza-fuel', 'Plaza Fuel', 'PF', '#C9D1CC', '#14110A', '139', 'gas', { off: 0, side: null, hours: '24h', chain: true, wc: true, wcPublic: true, kind: 'Gas & diesel', attrs: 'Diesel · 24h' }),
  P('plaza-chargers', 'Plaza Chargers', 'PC', '#C9D1CC', '#14110A', '139', 'ev', { off: 0, side: null, chain: true, kind: 'Fast charging', attrs: '6 × 250 kW · 4 open now' }),
  P('plaza-coffee', 'Plaza Coffee', 'PC', '#C9D1CC', '#14110A', '139', 'coffee', { off: 0, side: null, hours: '24h', chain: true, wc: true, kind: 'Coffee', attrs: 'Espresso · 24h' }),
  P('service-plaza-139', 'Service plaza', 'SP', '#C9D1CC', '#14110A', '139', 'wc', { off: 0, side: null, hours: '24h', wc: true, wcPublic: true, kind: 'Service plaza', tags: ['Family restroom'], attrs: 'Family restroom · no exit needed' }),

  // Exit 140 — SR-58, Amherst / Oberlin
  P('night-owl-pizza', 'Night Owl Pizza', 'NO', '#8E5CD9', '#FFFFFF', '140', 'food', { off: 2, side: 'L', hours: 'Opens at 4 PM', open: false, veg: true, kinds: ['pizza', 'sitdown'], wc: true, kind: 'Pizzeria', attrs: 'Opens at 4 PM' }),
  P('amherst-diner', 'Amherst Diner', 'AD', '#3E8EDE', '#FFFFFF', '140', 'food', { off: 2, side: 'R', hours: 'till 9 PM', kinds: ['sitdown'], wc: true, kind: 'Diner', attrs: 'Sit-down · till 9 PM' }),
  P('oberlin-wok', 'Oberlin Wok', 'OW', '#D2452F', '#FFFFFF', '140', 'food', { off: 3, side: 'L', hours: 'till 10 PM', veg: true, kinds: ['sitdown'], wc: true, kind: 'Asian', attrs: 'Veg options · till 10 PM' }),
  P('quick-burger', 'Quick Burger', 'QB', '#E9B949', '#14110A', '140', 'food', { off: 1, side: 'R', hours: '24h', chain: true, kinds: ['fast'], wc: true, kind: 'Drive-thru', attrs: 'Drive-thru · 24h' }),
  P('maple-cafe', 'Maple Café', 'MC', '#9C6B3C', '#FFFFFF', '140', 'food', { off: 2, side: 'R', hours: 'till 2 PM', veg: true, kinds: ['healthy', 'sitdown'], wc: true, kind: 'Breakfast & lunch', attrs: 'Vegetarian options · till 2 PM' }),
  P('amherst-fuel', 'Amherst Fuel', 'AF', '#F08A24', '#14110A', '140', 'gas', { off: 1, side: 'R', hours: '24h', wc: true, wcPublic: true, kind: 'Gas & convenience', attrs: 'Restrooms · 24h' }),
  P('oberlin-gas', 'Oberlin Gas', 'OG', '#2F9E8F', '#0B0F0D', '140', 'gas', { off: 3, side: 'L', hours: 'till 11 PM', kind: 'Gas', attrs: 'Till 11 PM' }),
  P('amherst-suites', 'Amherst Suites', 'AS', '#D2452F', '#FFFFFF', '140', 'lodging', { off: 2, side: 'L', chain: true, wc: true, kind: 'Hotel', tags: ['Breakfast included', 'Pool'], attrs: 'Breakfast included' }),
  P('oberlin-inn', 'Oberlin Inn', 'OI', '#6C5CE0', '#FFFFFF', '140', 'lodging', { off: 4, side: 'L', wc: true, kind: 'Inn', tags: ['Pet friendly'], attrs: 'Pet friendly' }),

  // Exit 142 — I-90 / SR-2, Lorain
  P('lorain-lunch-box', 'Lorain Lunch Box', 'LL', '#E9B949', '#14110A', '142', 'food', { off: 4, side: 'L', hours: 'till 8 PM', kinds: ['fast'], kind: 'Sandwiches', attrs: 'Sandwiches · till 8 PM' }),
  P('lakefront-gas', 'Lakefront Gas', 'LF', '#F08A24', '#14110A', '142', 'gas', { off: 4, side: 'R', hours: 'till 10 PM', kind: 'Gas', attrs: 'Till 10 PM' }),

  // Exit 151 — I-480, North Ridgeville
  P('ridge-burger', 'Ridge Burger', 'RB', '#D2452F', '#FFFFFF', '151', 'food', { off: 1, side: 'R', hours: '24h', chain: true, kinds: ['fast'], wc: true, kind: 'Burgers', attrs: 'Drive-thru · 24h' }),
  P('pasta-barn', 'Pasta Barn', 'PB', '#8A4B2A', '#FFFFFF', '151', 'food', { off: 2, side: 'R', hours: 'till 10 PM', veg: true, kinds: ['sitdown'], wc: true, kind: 'Italian', attrs: 'Sit-down · veg options · till 10 PM' }),
  P('taco-loco', 'Taco Loco', 'TL', '#E9B949', '#14110A', '151', 'food', { off: 1, side: 'L', hours: 'till 11 PM', veg: true, kinds: ['fast'], wc: true, kind: 'Tacos', attrs: 'Counter · veg options · till 11 PM' }),
  P('green-fork', 'Green Fork', 'GF', '#5BAF4A', '#0B0F0D', '151', 'food', { off: 2, side: 'R', hours: 'till 9 PM', veg: true, kinds: ['healthy'], wc: true, kind: 'Salads & grain bowls', attrs: 'Vegetarian menu · till 9 PM' }),
  P('pizza-point', 'Pizza Point', 'PP', '#E4572E', '#FFFFFF', '151', 'food', { off: 3, side: 'L', hours: 'till 11 PM', veg: true, kinds: ['pizza'], wc: true, kind: 'Pizza', attrs: 'Pizza · till 11 PM' }),
  P('lakeview-grill', 'Lakeview Grill', 'LV', '#3E8EDE', '#FFFFFF', '151', 'food', { off: 3, side: 'R', hours: 'till 10 PM', kinds: ['sitdown'], wc: true, kind: 'American grill', attrs: 'Sit-down · till 10 PM' }),
  P('bagel-depot', 'Bagel Depot', 'BD', '#9C6B3C', '#FFFFFF', '151', 'food', { off: 1, side: 'R', hours: 'till 3 PM', veg: true, kinds: ['fast'], wc: true, kind: 'Bagels', attrs: 'Breakfast · till 3 PM' }),
  P('thai-garden', 'Thai Garden', 'TG', '#D2452F', '#FFFFFF', '151', 'food', { off: 4, side: 'L', hours: 'till 9 PM', veg: true, kinds: ['sitdown'], wc: true, kind: 'Thai', attrs: 'Veg options · till 9 PM' }),
  P('chicken-shack', 'Chicken Shack', 'CS', '#F08A24', '#14110A', '151', 'food', { off: 2, side: 'L', hours: 'till 11 PM', chain: true, kinds: ['fast'], wc: true, kind: 'Fried chicken', attrs: 'Drive-thru · till 11 PM' }),
  P('ridgeville-fuel', 'Ridgeville Fuel', 'RF', '#F08A24', '#14110A', '151', 'gas', { off: 1, side: 'R', hours: '24h', chain: true, wc: true, wcPublic: true, kind: 'Gas & convenience', attrs: 'Restrooms · 24h' }),
  P('interstate-gas', 'Interstate Gas', 'IG', '#2F9E8F', '#0B0F0D', '151', 'gas', { off: 1, side: 'L', hours: '24h', wc: true, wcPublic: true, kind: 'Gas & diesel', attrs: 'Diesel · 24h' }),
  P('center-ridge-fuel', 'Center Ridge Fuel', 'CR', '#C9D1CC', '#14110A', '151', 'gas', { off: 3, side: 'R', hours: 'till midnight', kind: 'Gas', attrs: 'Till midnight' }),
  P('quickfill', 'QuickFill', 'QF', '#E9B949', '#14110A', '151', 'gas', { off: 2, side: 'L', hours: '24h', chain: true, kind: 'Gas', attrs: 'Cash discount · 24h' }),
  P('chargehub-151', 'ChargeHub', 'CH', '#7FD6A4', '#0B0F0D', '151', 'ev', { off: 2, side: 'R', kind: 'Fast charging', attrs: '8 × 350 kW · 5 open now' }),
  P('voltway-151', 'Voltway', 'VW', '#2E5BFF', '#FFFFFF', '151', 'ev', { off: 1, side: 'L', chain: true, kind: 'Fast charging', attrs: '4 × 150 kW · 1 open now' }),
  P('ridgeville-inn', 'Ridgeville Inn', 'RI', '#6C5CE0', '#FFFFFF', '151', 'lodging', { off: 2, side: 'R', chain: true, wc: true, kind: 'Hotel', tags: ['Breakfast included'], attrs: 'Breakfast included' }),
  P('comfort-stay', 'Comfort Stay', 'CS', '#3E8EDE', '#FFFFFF', '151', 'lodging', { off: 2, side: 'R', chain: true, wc: true, kind: 'Hotel', tags: ['Pool'], attrs: 'Pool · breakfast' }),
  P('turnpike-lodge', 'Turnpike Lodge', 'TL', '#9C6B3C', '#FFFFFF', '151', 'lodging', { off: 3, side: 'L', wc: true, kind: 'Lodge', tags: ['Pet friendly'], attrs: 'Pet friendly' }),
  P('airport-suites', 'Airport Suites', 'AP', '#D2452F', '#FFFFFF', '151', 'lodging', { off: 4, side: 'L', chain: true, wc: true, kind: 'Hotel', tags: ['EV charging on site'], attrs: 'EV charging on site' }),
  P('budget-motel', 'Budget Motel', 'BM', '#C9D1CC', '#14110A', '151', 'lodging', { off: 3, side: 'R', kind: 'Motel', attrs: 'Budget' }),
  P('daily-grind', 'Daily Grind', 'DG', '#8A5A3B', '#FFFFFF', '151', 'coffee', { off: 1, side: 'R', hours: 'till 8 PM', wc: true, kind: 'Coffee', tags: ['Drive-thru'], attrs: 'Drive-thru · till 8 PM' }),
]

export const CATEGORIES = [
  ['food', 'Food'], ['gas', 'Gas'], ['ev', 'EV charge'], ['lodging', 'Hotel'], ['wc', 'Restroom'], ['coffee', 'Coffee'],
]
export const CAT_LABEL = { gas: 'Gas', food: 'Food', ev: 'EV', lodging: 'Hotel', wc: 'Restroom', coffee: 'Coffee' }
export const NEED_LABEL = { food: 'Food', gas: 'Gas', ev: 'EV charging', lodging: 'Hotel', coffee: 'Coffee', wc: 'Restroom' }
export const NEED_NOUN = { food: 'food', gas: 'gas', ev: 'EV charging', lodging: 'hotel', wc: 'restroom', coffee: 'coffee' }
export const RESULT_NOUN = { food: 'food', gas: 'gas', ev: 'charger', lodging: 'hotel', wc: 'restroom', coffee: 'coffee' }
export const FOOD_KINDS = [['pizza', 'Pizza'], ['fast', 'Fast food'], ['healthy', 'Healthy'], ['veg', 'Vegetarian options'], ['sitdown', 'Sit-down']]

// Where your stop lands when the app opens: the design previews with Green Bowl at Exit 118 already set.
export const DEFAULT_STOP = { exit: '118', placeIds: ['green-bowl'], name: 'Green Bowl' }
