import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export function SliderVisual() {
  const reduce = useReducedMotion()
  const [score, setScore] = useState(4)

  useEffect(() => {
    if (reduce) {
      setScore(7)
      return
    }
    const values = [3, 6, 8, 5, 9, 4]
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % values.length
      setScore(values[i]!)
    }, 1400)
    return () => window.clearInterval(id)
  }, [reduce])

  const fill = score >= 7 ? 'var(--healthy)' : score >= 5 ? 'var(--attention)' : 'var(--alert)'
  const thumbY = `${100 - score * 10}%`

  return (
    <div className="mx-auto flex h-44 items-end justify-center gap-6 sm:h-52">
      <div className="relative h-full w-10 rounded-full bg-secondary">
        <motion.div
          className="absolute inset-x-0 bottom-0 rounded-full"
          style={{ background: fill }}
          animate={{ height: `${score * 10}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="absolute left-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-md"
          style={{ background: fill }}
          animate={{ top: thumbY }}
          transition={{ type: 'spring', stiffness: 140, damping: 16 }}
        />
      </div>
      <motion.div
        key={score}
        className="mb-4 text-5xl font-semibold tabular-nums tracking-tight"
        style={{ color: fill }}
        initial={reduce ? false : { opacity: 0.4, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {score}
      </motion.div>
    </div>
  )
}
