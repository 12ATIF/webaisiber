import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 1200, delay = 200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animFrame: number

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setValue(Math.floor(eased * target))
        if (progress < 1) {
          animFrame = requestAnimationFrame(step)
        } else {
          setValue(target)
        }
      }
      animFrame = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animFrame)
    }
  }, [target, duration, delay])

  return value
}
