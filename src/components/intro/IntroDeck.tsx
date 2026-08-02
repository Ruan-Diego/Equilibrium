import {
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import { useRef } from 'react'
import { introSlides } from '@/content/introSlides'
import { introIndexFromDrag } from '@/lib/introDeck'
import { IntroSlideView } from './IntroSlideView'
import { cn } from '@/lib/utils'

type IntroDeckProps = {
  index: number
  onIndexChange: (next: number) => void
}

export function IntroDeck({ index, onIndexChange }: IntroDeckProps) {
  const reduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const slide = introSlides[index]!

  function settle(info: PanInfo) {
    const width = containerRef.current?.offsetWidth ?? 320
    const next = introIndexFromDrag(
      index,
      introSlides.length,
      info.offset.x,
      info.velocity.x,
      width,
    )
    onIndexChange(next)
    x.set(0)
  }

  return (
    <div ref={containerRef} className="relative min-h-[22rem] w-full overflow-hidden sm:min-h-[24rem]">
      <motion.div
        className={cn(
          'h-full w-full touch-pan-y rounded-2xl border border-border/50 bg-[color-mix(in_srgb,var(--card)_88%,transparent)] px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:px-8',
        )}
        style={reduce ? undefined : { x }}
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => settle(info)}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        whileDrag={reduce ? undefined : { scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <IntroSlideView id={slide.id} title={slide.title} body={slide.body} />
      </motion.div>
    </div>
  )
}
