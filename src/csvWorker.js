/* eslint-disable no-restricted-globals */
import Papa from 'papaparse';

addEventListener('message', (e) => {
  const file = e.data;
  const allFeatures = [];

  console.log('Web Worker: Iniciando parseo del CSV');

  Papa.parse(file, {
    header: true, // Leer encabezados
    dynamicTyping: true, // Convertir valores numéricos a number
    skipEmptyLines: true,
    chunk: (results) => {
      console.log('Web Worker: Procesando chunk', results.data);
   
      const feats = results.data.map(row => {
  // Normalizar coordenadas: convertir coma decimal a punto
  const rawX = typeof row.x === 'string' ? row.x.replace(',', '.').trim() : row.x;
  const rawY = typeof row.y === 'string' ? row.y.replace(',', '.').trim() : row.y;

  const longitude = parseFloat(rawX);
  const latitude = parseFloat(rawY);

  if (
    isNaN(longitude) ||
    isNaN(latitude)
  ) {
   console.warn('❌ Coordenadas inválidas detectadas en el CSV:', {
      originalX: row.x,
      originalY: row.y,
      parsedX: rawX,
      parsedY: rawY,
      longitude,
      latitude,
      fila: row
    });
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    properties: {
      ...row,
      x: longitude,
      y: latitude,
    }
  };
}).filter(Boolean);


      allFeatures.push(...feats);
    },
    complete: () => {
      console.log('Web Worker: Parseo completado, total features:', allFeatures.length);
      postMessage({ features: allFeatures });
    },
    error: (err) => {
      console.error('Web Worker: Error al parsear CSV:', err);
      postMessage({ error: err.message });
    },
  });
});