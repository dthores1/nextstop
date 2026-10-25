import { useEffect, useState } from 'react'
import { NavProvider, useNav } from './nav'
import { TripProvider, useTrip } from './state'
import Ahead from './screens/Ahead'
import Approaching from './screens/Approaching'
import ExitDetail from './screens/ExitDetail'
import PlaceDetail from './screens/PlaceDetail'
import Find from './screens/Find'
import Setup from './screens/Setup'
import MapScreen from './screens/MapScreen'
import DemoPanel from './DemoPanel'

function Screen() {
  const { screen } = useNav()
  switch (screen) {
    case 'approaching': return <Approaching />
    case 'exit': return <ExitDetail />
    case 'place': return <PlaceDetail />
    case 'find': return <Find />
    case 'setup': return <Setup />
    case 'map': return <MapScreen />
    default: return <Ahead />
  }
}

function Toast() {
  const { toast } = useTrip()
  return toast ? <div className="toast" role="status">{toast}</div> : null
}

// Scale the phone down when the desktop window is shorter than the device.
function useDeviceScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight
      if (w <= 520) return setScale(1)
      setScale(Math.min(1, (h - 64) / 844, (w - 340) / 390))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

function Stage() {
  const scale = useDeviceScale()
  const scaled = scale < 1
  return (
    <div className="stage">
      <div className="device-wrap" style={scaled ? { width: 390 * scale, height: 844 * scale } : undefined}>
        <div className="device" style={scaled ? { transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}>
          <Screen />
          <Toast />
        </div>
      </div>
      <DemoPanel />
    </div>
  )
}

export default function App() {
  return (
    <NavProvider>
      <TripProvider>
        <Stage />
      </TripProvider>
    </NavProvider>
  )
}
