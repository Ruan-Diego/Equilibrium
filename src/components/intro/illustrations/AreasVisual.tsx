import { motion, useReducedMotion } from 'motion/react'

const rails = [
  { label: 'Família', score: 0.72, color: 'var(--healthy)' },
  { label: 'Trabalho', score: 0.45, color: 'var(--attention)' },
  { label: 'Amigos', score: 0.28, color: 'var(--alert)' },
] as const

export function AreasVisual() {
  const reduce = useReducedMotion()

  return (
    <div className="mx-auto flex h-44 max-w-xs items-end justify-center gap-5 sm:h-52 sm:gap-7">
      {rails.map((rail, i) => (
        <motion.div
          key={rail.label}
          className="flex flex-col items-center gap-2"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative h-32 w-8 overflow-hidden rounded-full bg-secondary sm:h-36">
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-full"
              style={{ background: rail.color }}
              initial={reduce ? { height: `${rail.score * 100}%` } : { height: '8%' }}
              animate={{ height: `${rail.score * 100}%` }}
              transition={{
                delay: 0.2 + i * 0.12,
                type: 'spring',
                stiffness: 100,
                damping: 16,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{rail.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
