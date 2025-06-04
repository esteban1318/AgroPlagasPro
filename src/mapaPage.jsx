import React, { useState } from 'react';
import SidebarMapas from './sideBarMapas';
import MapaVisualizador from './MapaVisualizador';

const MapaPage = () => {
  const [mapaActual, setMapaActual] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleMapaSelect = async (mapa) => {
    try {
      setCargando(true);
      
      // Simulamos carga de datos del mapa (reemplazar con API real)
      const datosMapa = await cargarDatosMapa(mapa.id);
      
      setMapaActual({
        ...mapa,
        ...datosMapa
      });
    } catch (error) {
      console.error("Error al cargar el mapa:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función simulada para cargar datos del mapa
  const cargarDatosMapa = async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const datos = {
          1: { 
            coordenadas: { lat: 4.6097, lng: -74.0817 },
            zoom: 12,
            capas: [
              { id: 1, nombre: "Cultivos", visible: true },
              { id: 2, nombre: "Zonas de riesgo", visible: true },
              { id: 3, nombre: "Plagas detectadas", visible: false }
            ],
            marcadores: [
              { id: 1, posicion: [4.610, -74.082], tipo: "plaga", nombre: "Gusano cogollero" }
            ]
          },
          2: { /* datos para El Colegio */ },
          // ... otros mapas
        };
        resolve(datos[id] || {});
      }, 800); // Simulamos retardo de red
    });
  };

  return (
    <div className="mapa-container">
      <SidebarMapas onMapaSelect={handleMapaSelect} />
      
      <div className="mapa-content">
        {cargando ? (
          <div className="cargando-mapa">
            <div className="spinner"></div>
            <p>Cargando mapa...</p>
          </div>
        ) : mapaActual ? (
          <MapaVisualizador mapa={mapaActual} />
        ) : (
          <div className="mapa-placeholder">
            <h3>Selecciona un mapa del panel izquierdo</h3>
            <p>o crea un nuevo mapa</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapaPage;