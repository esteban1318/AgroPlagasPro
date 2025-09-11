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
        console.log('📦 Store "coordenadas" creada');
      }
    }
  });
}

// Guarda coordenadas
export async function saveCoordenadasToIndexedDB(data) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  data.forEach(item => store.add(item));
  await tx.done;
  console.log('✅ Coordenadas guardadas');
}

// Obtiene todas las coordenadas
export async function getCoordenadasFromIndexedDB() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

// Elimina todas las coordenadas
export async function deleteCoordenadasFromIndexedDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
  console.log('🧹 Coordenadas eliminadas');
}
// utils/indexedDB.js
export const getFilteredRecords = ({ startDate, endDate, pestType, location }) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error al abrir la base de datos");

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const filtered = [];
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;

          // Filtrado por fecha
          const recordDate = new Date(record.fecha.split('/').reverse().join('-')); // convierte '2/01/2025' a Date
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          const dateOk =
            (!start || recordDate >= start) &&
            (!end || recordDate <= end);

          // Filtrado por plaga
          const pestOk = !pestType || pestType === "Todos" || record.plaga_id === pestType;

          // Filtrado por ubicación
          const locationOk = !location || location === "Todos" || record.zona === location;

          if (dateOk && pestOk && locationOk) {
            filtered.push(record);
          }

          cursor.continue();
        } else {
          resolve(filtered); // devuelve todos los registros filtrados
        }
      };

      cursorRequest.onerror = () => reject("Error al leer registros");
    };
  });
};
