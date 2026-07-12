import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Countdown timer for rate-limiting a repeatable action such as resending an
 * OTP. Call `start()` to begin a `seconds`-long cooldown; `remaining` ticks
 * down to 0 once per second and `active` is true while the cooldown is running.
 */
export function useCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0)
  const intervalRef = useRef(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    stop()
    setRemaining(seconds)
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stop()
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [seconds, stop])

  // Clear the interval if the component unmounts mid-cooldown.
  useEffect(() => stop, [stop])

  return { remaining, active: remaining > 0, start }
}
