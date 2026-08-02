import { motion, useReducedMotion } from 'motion/react'

export function ReadyVisual() {
  const reduce = useReducedMotion()

  return (
    <div className="relative mx-auto flex h-44 max-w-xs items-center justify-center sm:h-52">
      <motion.div
        aria-hidden
        className="absolute size-36 rounded-full sm:size-40"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--balanced) 28%, transparent), transparent 70%)',
        }}
        animate={
          reduce
            ? { opacity: 0.8 }
            : { opacity: [0.55, 0.95, 0.55], scale: [0.94, 1.06, 0.94] }
        }
        transition={
          reduce
            ? undefined
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <div className="relative flex flex-col items-center gap-1 text-center">
        <motion.p
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          Com calma
        </motion.p>
        <motion.p
          className="text-xl font-semibold tracking-tight text-[var(--balanced)] sm:text-2xl"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: reduce ? 0 : 0.45 }}
        >
          Com Equilibrium
        </motion.p>
      </div>
    </div>
  )
}
