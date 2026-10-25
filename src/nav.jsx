import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// A tiny hash router with an in-memory back stack, so "Back" inside the phone behaves like a
// native app and a refresh still lands on the same screen.
const NavCtx = createContext(null)

const parse = (hash) => {
  const p = (hash || '').replace(/^#/, '') || '/ahead'
  return p.startsWith('/') ? p : '/' + p
}

export function NavProvider({ children }) {
  const [stack, setStack] = useState(() => [parse(window.location.hash)])
  const path = stack[stack.length - 1]

  useEffect(() => {
    if (parse(window.location.hash) !== path) window.history.replaceState(null, '', '#' + path)
  }, [path])

  useEffect(() => {
    const onHash = () => {
      const p = parse(window.location.hash)
      setStack((s) => (s[s.length - 1] === p ? s : [...s, p]))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const nav = useCallback((to) => setStack((s) => (s[s.length - 1] === to ? s : [...s, to])), [])
  const reset = useCallback((to) => setStack([to]), [])
  const replace = useCallback((to) => setStack((s) => [...s.slice(0, -1), to]), [])
  const back = useCallback((fallback = '/ahead') => setStack((s) => (s.length > 1 ? s.slice(0, -1) : [fallback])), [])

  const [, screen, ...params] = path.split('/')
  return <NavCtx.Provider value={{ path, screen, params, nav, reset, replace, back }}>{children}</NavCtx.Provider>
}

export const useNav = () => useContext(NavCtx)

export function Link({ to, replaceStack, onClick, children, ...rest }) {
  const { nav, reset } = useNav()
  return (
    <a
      href={'#' + to}
      onClick={(e) => {
        e.preventDefault()
        onClick && onClick(e)
        replaceStack ? reset(to) : nav(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
