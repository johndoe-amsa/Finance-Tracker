import { useRef, useState, useCallback } from 'react'
import { Trash2, Check } from 'lucide-react'

const THRESHOLD = 0.3 // 30% of viewport width

export default function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Supprimer',
  rightLabel = 'Verifier',
}) {
  const rowRef = useRef(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const swiping = useRef(false)
  const [dismissed, setDismissed] = useState(false)
  const [deltaX, setDeltaX] = useState(0)

  const vw = typeof window !== 'undefined' ? window.innerWidth : 375

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    currentX.current = 0
    swiping.current = true
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!swiping.current) return
    const dx = e.touches[0].clientX - startX.current

    // Only allow left swipe if onSwipeLeft, right if onSwipeRight
    if (dx < 0 && !onSwipeLeft) return
    if (dx > 0 && !onSwipeRight) return

    currentX.current = dx
    setDeltaX(dx)
  }, [onSwipeLeft, onSwipeRight])

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) return
    swiping.current = false
    const dx = currentX.current
    const threshold = vw * THRESHOLD

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
    <div className="relative overflow-hidden rounded-lg">
      {/* Left reveal (swipe left = delete, shows on right side) */}
      {onSwipeLeft && (
        <div className="absolute inset-0 flex items-center justify-end px-6 bg-error rounded-lg">
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
        <div className="absolute inset-0 flex items-center justify-start px-6 bg-success rounded-lg">
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
        ref={rowRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${clampedDelta}px)`,
          transition: swiping.current ? 'none' : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
