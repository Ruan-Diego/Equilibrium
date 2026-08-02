import { motion, useReducedMotion } from 'motion/react'
import { statusLabels } from '@/domain/labels'

const swatches = [
  { key: 'healthy' as const, color: 'var(--healthy)' },
  { key: 'attention' as const, color: 'var(--attention)' },
  { key: 'alert' as const, color: 'var(--alert)' },
]

export function ColorsVisual() {
  const reduce = useReducedMotion()

  return (
    <div className="mx-auto flex h-44 max-w-sm flex-col justify-center gap-3 sm:h-52">
      {swatches.map((swatch, i) => (
        <motion.div
          key={swatch.key}
          className="flex items-center gap-3"
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.14, duration: 0.35 }}
        >
          <motion.span
            aria-hidden
            className="size-10 shrink-0 rounded-full"
            style={{ background: swatch.color }}
            animate={
              reduce
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.25,
                  }
            }
          />
          <span className="text-sm text-foreground/90">{statusLabels[swatch.key]}</span>
        </motion.div>
      ))}
    </div>
  )
}
