import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { IntroSlideId } from '@/content/introSlides'
import { WelcomeVisual } from './illustrations/WelcomeVisual'
import { SliderVisual } from './illustrations/SliderVisual'
import { AreasVisual } from './illustrations/AreasVisual'
import { ColorsVisual } from './illustrations/ColorsVisual'
import { HistoryVisual } from './illustrations/HistoryVisual'
import { ReadyVisual } from './illustrations/ReadyVisual'

const visuals: Record<IntroSlideId, () => ReactNode> = {
  welcome: () => <WelcomeVisual />,
  scores: () => <SliderVisual />,
  areas: () => <AreasVisual />,
  colors: () => <ColorsVisual />,
  history: () => <HistoryVisual />,
  ready: () => <ReadyVisual />,
}

type IntroSlideViewProps = {
  id: IntroSlideId
  title: string
  body: string
}

export function IntroSlideView({ id, title, body }: IntroSlideViewProps) {
  const reduce = useReducedMotion()
  const Visual = visuals[id]

  return (
    <div className="flex h-full flex-col px-2">
      <div className="flex min-h-[11rem] items-center justify-center sm:min-h-[13rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${id}`}
            className="w-full"
            initial={reduce ? false : { opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ duration: 0.28 }}
          >
            <Visual />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`copy-${id}`}
          className="mt-4 flex flex-1 flex-col gap-3 text-center"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {body}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
