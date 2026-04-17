import { useRef, useState, useCallback } from 'react'
import { Trash2, Check } from 'lucide-react'

const SWIPE_THRESHOLD = 0.3 // 30% of viewport width to trigger action
const DEAD_ZONE = 10 // px of movement before swipe activates (allows taps through)

export default function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Supprimer',
  rightLabel = 'Verifier',
}) {
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const activated = useRef(false) // true once horizontal movement exceeds dead zone
  const locked = useRef(false) // true if user is scrolling vertically
  const [dismissed, setDismissed] = useState(false)
  const [deltaX, setDeltaX] = useState(0)

  const vw = typeof window !== 'undefined' ? window.innerWidth : 375

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    currentX.current = 0
    activated.current = false
    locked.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (locked.current) return

    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    // If not yet activated, check whether this is a swipe or a scroll
    if (!activated.current) {
      // If vertical movement is dominant, this is a scroll — lock out swiping
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) {
        locked.current = true
        return
      }
      // Only activate once horizontal movement exceeds the dead zone
      if (Math.abs(dx) < DEAD_ZONE) return
      activated.current = true
    }

    // Only allow left swipe if onSwipeLeft, right if onSwipeRight
    if (dx < 0 && !onSwipeLeft) return
    if (dx > 0 && !onSwipeRight) return

    currentX.current = dx
    setDeltaX(dx)
  }, [onSwipeLeft, onSwipeRight])

  const handleTouchEnd = useCallback(() => {
    // If swipe was never activated, do nothing — let the click fire naturally
    if (!activated.current) {
      currentX.current = 0
      return
    }

    activated.current = false
    const dx = currentX.current
    const threshold = vw * SWIPE_THRESHOLD

    if (dx < -threshold && onSwipeLeft) {
      setDismissed(true)
      setTimeout(() => onSwipeLeft(), 300)
    } else if (dx > threshold && onSwipeRight) {
      setDismissed(true)
      setTimeout(() => onSwipeRight(), 300)
    } else {
      setDeltaX(0)
    }
    currentX.current = 0
  }, [vw, onSwipeLeft, onSwipeRight])

  if (dismissed) {
    return <div className="swipe-dismiss" />
  }

  const showLeftReveal = deltaX < -10
  const showRightReveal = deltaX > 10
  const clampedDelta = Math.max(-vw * 0.6, Math.min(vw * 0.6, deltaX))

  return (
    <div className="relative overflow-hidden">
      {/* Left reveal (swipe left = delete, shows on right side) */}
      {onSwipeLeft && (
        <div className="absolute inset-0 flex items-center justify-end px-6 bg-error">
          <div
            className="flex items-center gap-2 text-white text-[13px] font-medium"
            style={{ opacity: showLeftReveal ? 1 : 0, transition: 'opacity 100ms' }}
          >
            <Trash2 size={16} strokeWidth={1.5} />
            {leftLabel}
          </div>
        </div>
      )}

      {/* Right reveal (swipe right = verify, shows on left side) */}
      {onSwipeRight && (
        <div className="absolute inset-0 flex items-center justify-start px-6 bg-success">
          <div
            className="flex items-center gap-2 text-white text-[13px] font-medium"
            style={{ opacity: showRightReveal ? 1 : 0, transition: 'opacity 100ms' }}
          >
            <Check size={16} strokeWidth={1.5} />
            {rightLabel}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: clampedDelta !== 0 ? `translateX(${clampedDelta}px)` : undefined,
          transition: activated.current ? 'none' : clampedDelta !== 0 ? 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
