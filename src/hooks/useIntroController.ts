import { useCallback, useEffect, useState } from 'react'
import { getHasSeenIntro, setHasSeenIntro } from '@/data/userPrefs'

export type IntroMode = 'preview' | 'firstLogin'

type UseIntroControllerOptions = {
  uid?: string | null
  /** When true, checks prefs and auto-opens if the user has not seen the intro. */
  autoCheck?: boolean
}

export function useIntroController({
  uid = null,
  autoCheck = false,
}: UseIntroControllerOptions = {}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<IntroMode>('preview')
  const [checking, setChecking] = useState(autoCheck)

  useEffect(() => {
    if (!autoCheck || !uid) {
      setChecking(false)
      return
    }

    let cancelled = false
    setChecking(true)

    void getHasSeenIntro(uid).then((seen) => {
      if (cancelled) return
      if (!seen) {
        setMode('firstLogin')
        setOpen(true)
      }
      setChecking(false)
    })

    return () => {
      cancelled = true
    }
  }, [autoCheck, uid])

  const openPreview = useCallback(() => {
    setMode('preview')
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const complete = useCallback(async () => {
    if (mode === 'firstLogin' && uid) {
      try {
        await setHasSeenIntro(uid)
      } catch {
        // Cache already set inside setHasSeenIntro; ignore network errors.
      }
    }
    setOpen(false)
  }, [mode, uid])

  return {
    open,
    mode,
    checking,
    openPreview,
    close,
    complete,
    setOpen,
  }
}
