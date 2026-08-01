import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Score } from '@/domain/score'

export interface Area {
  id: string
  name: string
  score: Score
  order: number
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

type AreaDoc = Omit<Area, 'id' | 'active'> & {
  active?: boolean
  /** @deprecated Prefer `active`. Kept for docs created before the toggle. */
  archived?: boolean
}

function areasCol(uid: string) {
  return collection(db, 'users', uid, 'areas')
}

function areaRef(uid: string, areaId: string) {
  return doc(db, 'users', uid, 'areas', areaId)
}

function eventsCol(uid: string) {
  return collection(db, 'users', uid, 'events')
}

function mapArea(id: string, data: AreaDoc): Area {
  return {
    id,
    name: data.name,
    score: data.score,
    order: data.order,
    active: data.active ?? data.archived === false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

/** All areas (active and inactive), ordered for the manage page. */
export async function listAreas(uid: string): Promise<Area[]> {
  const q = query(areasCol(uid), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapArea(d.id, d.data() as AreaDoc))
}

/** Areas that appear on Home / History (active only). */
export async function listActiveAreas(uid: string): Promise<Area[]> {
  const all = await listAreas(uid)
  return all.filter((a) => a.active)
}

export async function createArea(uid: string, name: string): Promise<string> {
  const existing = await listAreas(uid)
  const order = existing.length
  const ref = await addDoc(areasCol(uid), {
    name,
    score: 5 as Score,
    order,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function renameArea(
  uid: string,
  areaId: string,
  name: string,
): Promise<void> {
  await updateDoc(areaRef(uid, areaId), {
    name,
    updatedAt: serverTimestamp(),
  })
}

export async function setAreaActive(
  uid: string,
  areaId: string,
  active: boolean,
): Promise<void> {
  await updateDoc(areaRef(uid, areaId), {
    active,
    updatedAt: serverTimestamp(),
  })
}

export async function reorderAreas(
  uid: string,
  orderedIds: string[],
): Promise<void> {
  const batch = writeBatch(db)
  orderedIds.forEach((id, index) => {
    batch.update(areaRef(uid, id), {
      order: index,
      updatedAt: serverTimestamp(),
    })
  })
  await batch.commit()
}

/** Hard-delete the area and its attention events. */
export async function deleteArea(uid: string, areaId: string): Promise<void> {
  const eventsSnap = await getDocs(
    query(eventsCol(uid), where('areaId', '==', areaId)),
  )

  const docs = [areaRef(uid, areaId), ...eventsSnap.docs.map((d) => d.ref)]
  const chunkSize = 450
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db)
    for (const ref of docs.slice(i, i + chunkSize)) {
      batch.delete(ref)
    }
    await batch.commit()
  }
}
