import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function cacheKey(uid: string) {
  return `eq:hasSeenIntro:${uid}`
}

function userRef(uid: string) {
  return doc(db, 'users', uid)
}

export function getCachedHasSeenIntro(uid: string): boolean | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid))
    if (raw === 'true') return true
    if (raw === 'false') return false
    return null
  } catch {
    return null
  }
}

export function setCachedHasSeenIntro(uid: string, value: boolean) {
  try {
    localStorage.setItem(cacheKey(uid), value ? 'true' : 'false')
  } catch {
    // Ignore quota / private mode failures.
  }
}

export async function getHasSeenIntro(uid: string): Promise<boolean> {
  const cached = getCachedHasSeenIntro(uid)
  if (cached === true) return true

  try {
    const snap = await getDoc(userRef(uid))
    const seen = snap.exists() && snap.data()?.hasSeenIntro === true
    setCachedHasSeenIntro(uid, seen)
    return seen
  } catch {
    return false
  }
}

export async function setHasSeenIntro(uid: string): Promise<void> {
  setCachedHasSeenIntro(uid, true)
  await setDoc(
    userRef(uid),
    {
      hasSeenIntro: true,
      introSeenAt: serverTimestamp(),
    },
    { merge: true },
  )
}
