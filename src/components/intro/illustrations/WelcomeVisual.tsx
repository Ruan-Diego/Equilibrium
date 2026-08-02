import { motion, useReducedMotion } from 'motion/react'

const orbs = [
  { color: 'var(--healthy)', x: '18%', y: '28%', size: 72, delay: 0 },
  { color: 'var(--attention)', x: '68%', y: '22%', size: 56, delay: 0.35 },
  { color: 'var(--alert)', x: '42%', y: '62%', size: 64, delay: 0.7 },
  { color: 'var(--balanced)', x: '78%', y: '58%', size: 48, delay: 1.05 },
] as const

export function WelcomeVisual() {
  const reduce = useReducedMotion()

  return (
    <div className="relative mx-auto h-44 w-full max-w-xs sm:h-52">
      {orbs.map((orb) => (
        <motion.span
          key={orb.color + orb.x}
          aria-hidden
          className="absolute rounded-full blur-[1px]"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `color-mix(in srgb, ${orb.color} 55%, transparent)`,
            translate: '-50% -50%',
          }}
          animate={
            reduce
              ? { opacity: 0.7 }
              : {
                  opacity: [0.45, 0.85, 0.45],
                  scale: [1, 1.12, 1],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 3.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: orb.delay,
                }
          }
        />
      ))}
      <motion.p
        className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        Equilibrium
      </motion.p>
    </div>
  )
}
