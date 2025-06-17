// indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'PlagasDB';
const STORE_NAME = 'coordenadas';

export async function saveCoordenadasToIndexedDB(data) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear(); // limpiar anteriores
  data.forEach(item => store.add(item));
  await tx.done;

  console.log('✅ Guardado en IndexedDB');
}

export async function getCoordenadasFromIndexedDB() {
  const db = await openDB(DB_NAME, 1);
  return await db.getAll(STORE_NAME);
}
export async function deleteCoordenadasFromIndexedDB() {
  const db = await openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
  console.log('🧹 Coordenadas eliminadas de IndexedDB');
}

