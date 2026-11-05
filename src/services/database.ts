import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

function removeUndefined(value: any): any {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefined(item)]));
  }
  return value;
}

/** Read all records from a Firestore collection. */
export async function readRecords<T>(name: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as T);
}

/** Mirror a state collection to Firestore, including deletions. */
export async function replaceRecords<T extends { id: string }>(name: string, records: T[]): Promise<void> {
  const existing = await getDocs(collection(db, name));
  const nextIds = new Set(records.map(record => record.id));
  const batch = writeBatch(db);
  existing.docs.forEach(item => {
    if (!nextIds.has(item.id)) batch.delete(item.ref);
  });
  records.forEach(record => batch.set(doc(db, name, record.id), removeUndefined(record)));
  await batch.commit();
}
