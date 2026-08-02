import { motion, useReducedMotion } from 'motion/react'

const path =
  'M4 52 C 28 48, 36 20, 58 28 S 96 58, 118 40 S 150 12, 176 22'

export function HistoryVisual() {
  const reduce = useReducedMotion()

  return (
    <div className="mx-auto flex h-44 max-w-sm flex-col items-center justify-center gap-4 sm:h-52">
      <motion.span
        className="rounded-full px-3 py-1 text-sm font-medium"
        style={{
          background: 'color-mix(in srgb, var(--balanced) 22%, transparent)',
          color: 'var(--balanced)',
        }}
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14 }}
      >
        Equilibrado
      </motion.span>
      <svg
        viewBox="0 0 180 64"
        className="h-16 w-full max-w-[240px]"
        aria-hidden
      >
        <motion.path
          d={path}
          fill="none"
          stroke="var(--balanced)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1.4, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="176"
          cy="22"
          r="4"
          fill="var(--healthy)"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 1.2 }}
        />
      </svg>
    </div>
  )
}
