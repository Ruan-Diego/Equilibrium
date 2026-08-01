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
  archived: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

function areasCol(uid: string) {
  return collection(db, 'users', uid, 'areas')
}

function areaRef(uid: string, areaId: string) {
  return doc(db, 'users', uid, 'areas', areaId)
}

export async function listActiveAreas(uid: string): Promise<Area[]> {
  const q = query(
    areasCol(uid),
    where('archived', '==', false),
    orderBy('order'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Area, 'id'>) }))
}

export async function createArea(uid: string, name: string): Promise<string> {
  const active = await listActiveAreas(uid)
  const order = active.length
  const ref = await addDoc(areasCol(uid), {
    name,
    score: 5 as Score,
    order,
    archived: false,
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

export async function archiveArea(uid: string, areaId: string): Promise<void> {
  await updateDoc(areaRef(uid, areaId), {
    archived: true,
    updatedAt: serverTimestamp(),
  })
}
