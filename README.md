# NextStop

A design prototype for a road-trip companion app. On the highway it is hard to know what services are at
the next exit until the one sign flashes by. NextStop keeps a feed of what's ahead, warns you as your exit
comes up, and lets you search for food, gas, EV charging, hotels, or restrooms by upcoming exit.

This is a design exercise, not a product: all data is hardcoded sample data for I-90 East on the Ohio
Turnpike near Sandusky, and "your location" is a drive simulation.

## Run it

```sh
npm install
npm run dev
```

Open the printed URL. On a desktop browser the app renders inside a phone frame with demo controls beside
it (jump to any screen, run the drive simulation at 15x/30x/60x, switch live/manual mode, reset). On a
phone-sized window it fills the screen.

`npm run build` writes a static site to `dist/` that can be dropped on any static host (GitHub Pages,
Netlify, Vercel). Paths are relative, so it works from a subfolder too.

## Screens

| Screen | Route | What it shows |
| --- | --- | --- |
| Ahead | `#/ahead` | Highway + direction, your stop, the next exit as a big sign, then the exits after it. Press **DRIVE** to simulate driving. |
| Approaching | `#/approaching/118` | Pops up on its own as an exit gets close. Shows your stop at that exit, or the services there if you have no stop. |
| Exit detail | `#/exit/118` | Everything at an exit grouped by service, with minutes from the ramp and which side of the ramp. |
| Place detail | `#/place/green-bowl` | One business: hours, amenities, detour cost, turn-by-turn from the ramp. Navigate / Add stop. |
| Find | `#/find` | Search one need (ranked by time to arrive) or several (ranked by which exits cover all of them). Filters: ahead only vs. turnarounds, open now, your chains, kind of food. |
| Set starting point | `#/setup` | Manual fallback when location is off: city → highway → direction → confirm position on the strip. In manual mode you tap **Passed Exit N** to move ahead. |
| Map | `#/map` | Not in the original design; a simple corridor strip so the tab isn't dead. |

## Where things live

- `src/data.js` — the sample corridor: exits and places. Every count, list, and label on screen is derived from these two tables, so editing them is the way to change what the prototype shows.
- `src/model.js` — small helpers: ETA, exit labels, service counts, side-of-ramp wording.
- `src/state.jsx` — trip state shared across screens (mode, position, drive simulation, your stop, Find filters) and the logic that opens and closes the approaching screen.
- `src/nav.jsx` — a tiny hash router with an in-app back stack.
- `src/screens/*` — one file per screen, styled inline to match the design file.
- `src/components/*` — icons, the interstate shield, the green exit plate, the tab bar.
- `src/DemoPanel.jsx` — desktop-only controls next to the phone.

## Design source

`NextStop UI.html` and `NextStop UI.pdf` are the original Claude Design exports the app was built from.
