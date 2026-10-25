import Icon from './Icon'
import { Link, useNav } from '../nav'
import { C } from '../ui'

const TABS = [
  { to: '/ahead', screen: 'ahead', icon: 'up', label: 'Ahead' },
  { to: '/find', screen: 'find', icon: 'search', label: 'Find' },
  { to: '/map', screen: 'map', icon: 'map', label: 'Map' },
  { to: '/setup', screen: 'setup', icon: 'pin', label: 'Route' },
]

export default function TabBar() {
  const { screen } = useNav()
  return (
    <nav aria-label="Main" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', borderTop: '1px solid ' + C.line, background: C.nav, padding: '6px 8px 24px', flex: 'none' }}>
      {TABS.map((t) => {
        const active = screen === t.screen
        return (
          <Link key={t.to} to={t.to} replaceStack aria-current={active ? 'page' : undefined}
            style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: active ? C.amber : C.muted, textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>
            <Icon name={t.icon} size={22} />{t.label}
          </Link>
        )
      })}
    </nav>
  )
}
