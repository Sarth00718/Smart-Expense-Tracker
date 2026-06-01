import { useState, useEffect } from 'react'

/**
 * SSR-safe responsive hook.
 * Never accesses window.innerWidth during render — only after mount.
 * Prevents hydration mismatch and React 18 SSR issues.
 */
const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
}

export const useResponsive = () => {
  // Start with safe defaults (mobile-first) — no window access here
  const [width, setWidth] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Now safe to read window
    const update = () => setWidth(window.innerWidth)
    update()
    setMounted(true)

    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    width,
    mounted,
    // boolean helpers
    isMobile:  mounted ? width < BREAKPOINTS.sm  : true,
    isTablet:  mounted ? width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg : false,
    isDesktop: mounted ? width >= BREAKPOINTS.lg : false,
    // breakpoint checkers
    isAbove: (bp) => mounted ? width >= (BREAKPOINTS[bp] ?? bp) : false,
    isBelow: (bp) => mounted ? width <  (BREAKPOINTS[bp] ?? bp) : true,
    // Tailwind-style helpers
    sm:  mounted ? width >= BREAKPOINTS.sm  : false,
    md:  mounted ? width >= BREAKPOINTS.md  : false,
    lg:  mounted ? width >= BREAKPOINTS.lg  : false,
    xl:  mounted ? width >= BREAKPOINTS.xl  : false,
  }
}

export default useResponsive
