import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { introSlides } from '@/content/introSlides'
import {
  clampIntroIndex,
  nextIntroIndex,
  prevIntroIndex,
} from '@/lib/introDeck'
import type { IntroMode } from '@/hooks/useIntroController'
import { Button } from '@/components/ui/button'
import { IntroDeck } from './IntroDeck'
import { cn } from '@/lib/utils'

type IntroOverlayProps = {
  open: boolean
  mode: IntroMode
  onOpenChange: (open: boolean) => void
  onComplete: () => void | Promise<void>
}

const atmosphereByIndex = [
  'radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--balanced) 16%, transparent), transparent 55%), radial-gradient(ellipse at 80% 80%, color-mix(in srgb, var(--healthy) 10%, transparent), transparent 50%)',
  'radial-gradient(ellipse at 40% 30%, color-mix(in srgb, var(--healthy) 16%, transparent), transparent 55%), radial-gradient(ellipse at 70% 75%, color-mix(in srgb, var(--attention) 10%, transparent), transparent 50%)',
  'radial-gradient(ellipse at 35% 25%, color-mix(in srgb, var(--attention) 14%, transparent), transparent 55%), radial-gradient(ellipse at 75% 70%, color-mix(in srgb, var(--healthy) 10%, transparent), transparent 50%)',
  'radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--alert) 12%, transparent), transparent 55%), radial-gradient(ellipse at 80% 75%, color-mix(in srgb, var(--attention) 12%, transparent), transparent 50%)',
  'radial-gradient(ellipse at 40% 25%, color-mix(in srgb, var(--balanced) 18%, transparent), transparent 55%), radial-gradient(ellipse at 70% 80%, color-mix(in srgb, var(--healthy) 10%, transparent), transparent 50%)',
  'radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--balanced) 20%, transparent), transparent 55%), radial-gradient(ellipse at 50% 80%, color-mix(in srgb, var(--healthy) 12%, transparent), transparent 50%)',
] as const

export function IntroOverlay({
  open,
  mode,
  onOpenChange,
  onComplete,
}: IntroOverlayProps) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const isLast = index >= introSlides.length - 1

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function finish() {
    if (busy) return
    setBusy(true)
    try {
      await onComplete()
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (mode === 'firstLogin') {
        if (busy) return
        setBusy(true)
        void Promise.resolve(onComplete()).finally(() => setBusy(false))
      } else {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, mode, busy, onComplete, onOpenChange])

  function skip() {
    void finish()
  }

  function goNext() {
    if (isLast) {
      void finish()
      return
    }
    setIndex((i) => nextIntroIndex(i, introSlides.length))
  }

  function goPrev() {
    setIndex((i) => prevIntroIndex(i, introSlides.length))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Introdução ao Equilibrium"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-background/92 backdrop-blur-md" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-[background] duration-500"
            style={{ background: atmosphereByIndex[index] }}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {index + 1} de {introSlides.length}
              </p>
              {!isLast && (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={skip}
                  disabled={busy}
                >
                  Pular intro
                </button>
              )}
              {isLast && (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => onOpenChange(false)}
                  disabled={busy || mode === 'firstLogin'}
                  hidden={mode === 'firstLogin'}
                >
                  Fechar
                </button>
              )}
            </div>

            <IntroDeck
              index={index}
              onIndexChange={(next) =>
                setIndex(clampIntroIndex(next, introSlides.length))
              }
            />

            <div className="flex items-center justify-center gap-2" aria-hidden>
              {introSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir para slide ${i + 1}`}
                  className="rounded-full p-1"
                  onClick={() => setIndex(i)}
                >
                  <motion.span
                    className={cn(
                      'block h-1.5 rounded-full bg-muted-foreground/35',
                      i === index && 'bg-foreground',
                    )}
                    animate={{ width: i === index ? 22 : 8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={index === 0 || busy}
                onClick={goPrev}
              >
                Anterior
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={busy}
                onClick={goNext}
              >
                {isLast ? 'Começar' : 'Próximo'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
