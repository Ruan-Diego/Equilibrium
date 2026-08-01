import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  type Timestamp as TimestampType,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Score } from '@/domain/score'

export interface AttentionEvent {
  id: string
  areaId: string
  previousValue: Score
  value: Score
  createdAt: TimestampType
}

function eventsCol(uid: string) {
  return collection(db, 'users', uid, 'events')
}

export async function listEventsForArea(
  uid: string,
  areaId: string,
  since?: Date,
): Promise<AttentionEvent[]> {
  const constraints = [
    where('areaId', '==', areaId),
    orderBy('createdAt', 'asc'),
  ] as const

  const q = since
    ? query(
        eventsCol(uid),
        where('areaId', '==', areaId),
        where('createdAt', '>=', Timestamp.fromDate(since)),
        orderBy('createdAt', 'asc'),
      )
    : query(eventsCol(uid), ...constraints)

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AttentionEvent, 'id'>),
  }))
}
