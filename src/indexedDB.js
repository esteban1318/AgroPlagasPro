import { openDB } from 'idb';

const DB_NAME = 'PlagasDB';
const DB_VERSION = 1;
const STORE_NAME = 'coordenadas';

// Asegura que el store siempre se cree si no existe
async function getDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function saveCoordenadasToIndexedDB(data) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  data.forEach(item => store.add(item));
  await tx.done;
  console.log('✅ Guardado en IndexedDB');
}

export async function getCoordenadasFromIndexedDB() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function deleteCoordenadasFromIndexedDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
  console.log('🧹 Coordenadas eliminadas de IndexedDB');
}
