import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { clampScore, type Score } from '@/domain/score'

export async function setAreaScore(
  uid: string,
  areaId: string,
  nextScore: number,
): Promise<void> {
  const next = clampScore(nextScore)
  const areaRef = doc(db, 'users', uid, 'areas', areaId)
  const eventsCol = collection(db, 'users', uid, 'events')

  await runTransaction(db, async (tx) => {
    const areaSnap = await tx.get(areaRef)
    if (!areaSnap.exists()) {
      throw new Error(`Area ${areaId} not found`)
    }

    const previous = areaSnap.data().score as Score
    if (previous === next) {
      return
    }

    tx.update(areaRef, {
      score: next,
      updatedAt: serverTimestamp(),
    })

    const eventRef = doc(eventsCol)
    tx.set(eventRef, {
      areaId,
      previousValue: previous,
      value: next,
      createdAt: serverTimestamp(),
    })
  })
}
