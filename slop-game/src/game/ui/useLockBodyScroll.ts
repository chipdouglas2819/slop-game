import { useEffect } from 'react'

// Locks page scroll while a modal is open so scrolling inside the modal doesn't
// bleed through to the Feed behind it.
export function useLockBodyScroll(active: boolean = true) {
  useEffect(() => {
    if (!active) return
    const prevOverflow = document.body.style.overflow
    const prevOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'contain'
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.overscrollBehavior = prevOverscroll
    }
  }, [active])
}
