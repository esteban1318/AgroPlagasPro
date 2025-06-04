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
        // Mapear x,y a longitude,latitude
        const longitude = row.x;
        const latitude = row.y;

        if (
          typeof longitude !== 'number' ||
          typeof latitude !== 'number' ||
          isNaN(longitude) ||
          isNaN(latitude)
        ) {
          console.warn('Web Worker: Fila inválida', row);
          return null;
        }

        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
          properties: {
            id: '', // No hay id en el CSV
            tipo: 'Frutos', // Valor por defecto
          },
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