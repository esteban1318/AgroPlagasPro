import { openDB } from 'idb';

const DB_NAME = 'PlagasDB';
const DB_VERSION = 2;
const STORE_NAME = 'coordenadas';

// ✅ Siempre usa esta función para abrir la DB con upgrade incluido
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        console.log('📦 Store "coordenadas" creado');
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
  console.log('✅ Coordenadas guardadas');
}

export async function getCoordenadasFromIndexedDB() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteCoordenadasFromIndexedDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
  console.log('🧹 Coordenadas eliminadas');
}
