import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

const AnimatedNumber = ({ value, suffix = '', duration = 2000, className = '' }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const startValue = 0

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数让动画更平滑
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [value, duration])

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export default AnimatedNumber

