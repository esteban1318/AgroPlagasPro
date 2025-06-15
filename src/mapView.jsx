import React, { useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Map, { Marker, Source, Layer, GeolocateControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import droneIcon from './iconos/capaIcono.png';
import arbolIcon from './iconos/marcadorArbol.png';
import Supercluster from 'supercluster';
import pako from 'pako';
import { useMapStore } from './store/useMapStore.ts';
import { useLocation } from 'react-router-dom';
import PestFilterContext from './PestFilterContext.jsx';
import Triangulo from './iconos/alerta.png';
import SidebarMapas from './sideBarMapas.jsx';

//import DbConnectionForm from './DbConnectionForm';

// Helper para comprimir/descomprimir datos en localStorage
const compressData = (data) => {
  try {
    const json = JSON.stringify(data);
    const compressed = pako.gzip(json);
    const chunkSize = 0x8000;
    let str = '';
    for (let i = 0; i < compressed.length; i += chunkSize) {
      const slice = compressed.subarray(i, i + chunkSize);
      str += String.fromCharCode.apply(null, slice);
    }
    return btoa(str);
  } catch (error) {
    console.error('Error compressing data:', error);
    return null;
  }
};

const decompressData = (compressed) => {
  try {
    const binary = atob(compressed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decompressed = pako.ungzip(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
};
// Función auxiliar para calcular densidad (fuera del componente)
const calcularDensidad = (feature, todasFeatures) => {
  const RADIO = 0.01; // Ajusta este valor según tu escala
  const [lng, lat] = feature.geometry.coordinates;

  // Contar features cercanas
  const featuresCercanas = todasFeatures.filter(f => {
    const [fLng, fLat] = f.geometry.coordinates;
    const distancia = Math.sqrt((fLng - lng) ** 2 + (fLat - lat) ** 2);
    return distancia <= RADIO;
  });

  // Normalizar densidad entre 0 y 1
  const maxDensidad = 20; // Ajusta según tus datos
  return Math.min(featuresCercanas.length / maxDensidad, 1);
};
const MapView = ({ coordinates, filteredFeatures, markerStyles, selectedPlagaId, collapsed, setCollapsed }) => {
  const { selectedPlagas } = useContext(PestFilterContext);
  const location = useLocation();
  const savedFeaturesCompressed = localStorage.getItem('uploadedFeatures');
  // === Antes de los useState ===
  let initialFeatures = [];
  // 1) Raw puro
  const raw = localStorage.getItem('uploadedFeaturesRaw');
  if (raw) {
    try {
      initialFeatures = JSON.parse(raw);
    } catch {
      initialFeatures = [];
    }
  } else {
    // 2) Sino, intenta descomprimir el comprimido
    const comp = localStorage.getItem('uploadedFeatures');
    if (comp) {
      try {
        initialFeatures = decompressData(comp) || [];
      } catch {
        initialFeatures = [];
      }
    }
    // 3) Guarda el raw para usos futuros
    localStorage.setItem('uploadedFeaturesRaw', JSON.stringify(initialFeatures));
  }

  const { setSelectedPest, selectedPest } = useContext(PestFilterContext);

  const savedMapStyle = localStorage.getItem('mapStyle') || 'mapbox://styles/mapbox/satellite-streets-v12';
  const savedViewport = JSON.parse(localStorage.getItem('mapViewport')) || {
    latitude: 4.5709,
    longitude: -74.2973,
    zoom: 6,
  };

  const menuRef = useRef(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mapStyle, setMapStyle] = useState(savedMapStyle);
  const [uploadedFeatures, setUploadedFeatures] = useState(initialFeatures);
  const [displayedFeatures, setDisplayedFeatures] = useState(initialFeatures);
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCoord, setHoveredCoord] = useState(null);
  const [dibujando, setDibujando] = useState(false);
  const [mostrarMenuCapas, setMostrarMenuCapas] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [viewport, setViewport] = useState(savedViewport);
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [showDbForm, setShowDbForm] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '5432',
    database: 'planilla_sdb_backup',
    user: 'postgres',
    password: '1318',
  });
  const [tables, setTables] = useState([]);
  const mapRef = useRef(null);
  const superclusterRef = useRef(null);
  const { drawCoords, setDrawCoords } = useMapStore();
  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  //redirigir desde boton con plaga
  /* useEffect(() => {
     if (location.state?.pestName) {
       setSelectedPest(location.state.pestName);
     }
   }, [location.state?.pestName, setSelectedPest]);*/

  //filtrado por plaga
  /*useEffect(() => {
    if (selectedPest) {
      setDisplayedFeatures(
        uploadedFeatures.filter(f => f.properties.plaga === selectedPest)
      );
    } else {
      setDisplayedFeatures(uploadedFeatures);
    }
  }, [selectedPest, uploadedFeatures,]);*/
  //actualizar fuente del mapa
  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource('plagas-source')) {
      console.log("🔍 Features a mostrar:", displayedFeatures);
      mapRef.current.getSource('plagas-source').setData({
        type: 'FeatureCollection',
        features: displayedFeatures
      });
    }
  }, [displayedFeatures]);
  //guardar en localstore
  useEffect(() => {
    try {
      const compressedFeatures = compressData(uploadedFeatures);
      if (compressedFeatures) {
        localStorage.setItem('uploadedFeatures', compressedFeatures);
      }
      localStorage.setItem('mapStyle', mapStyle);
      localStorage.setItem('mapViewport', JSON.stringify(viewport));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [uploadedFeatures, mapStyle, viewport]);

  useEffect(() => {
    const supercluster = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });
    supercluster.load(uploadedFeatures);
    superclusterRef.current = supercluster;
    const compressed = compressData(uploadedFeatures);
    if (compressed) {
      localStorage.setItem('uploadedFeatures', compressed);
    }
    // 2) Guardar la versión JSON pura
    localStorage.setItem(
      'uploadedFeaturesRaw',
      JSON.stringify(uploadedFeatures)
    );
  }, [uploadedFeatures]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || uploadedFeatures.length === 0) return;

    const updateVisibleFeatures = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      const visible = zoom > 10
        ? uploadedFeatures.filter(f => {
          const coords = f?.geometry?.coordinates;
          if (!coords || coords.length !== 2) return false;
          return bounds.contains(coords);
        }).slice(0, 3000)
        : [];

      setVisibleFeatures(visible);
    };

    updateVisibleFeatures();
    map.on('moveend', updateVisibleFeatures);

    return () => {
      // ✅ usa la variable local `map`, no `mapRef.current`
      map.off('moveend', updateVisibleFeatures);
    };
  }, [uploadedFeatures]);


  useEffect(() => {
    if (!mapRef.current || !superclusterRef.current) {
      setClusters([]);
      return;
    }

    if (!superclusterRef.current.trees || superclusterRef.current.trees.length === 0) {
      setClusters([]);
      return;
    }

    try {
      const bounds = mapRef.current.getBounds();
      const zoom = Math.round(mapRef.current.getZoom());

      const newClusters = superclusterRef.current.getClusters(
        [
          bounds.getWest() || -180,
          bounds.getSouth() || -90,
          bounds.getEast() || 180,
          bounds.getNorth() || 90,
        ],
        zoom
      );
      setClusters(newClusters);
    } catch (error) {
      console.error('Error calculando clústeres:', error);
      setClusters([]);
    }
  }, [viewport]);
  // Cierra el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const storedFeatures = JSON.parse(localStorage.getItem('features') || '[]');
    const plagaIds = [...new Set(storedFeatures.map(f => f?.properties?.plaga_id))];
    console.log('🪲 Plaga IDs guardados en localStorage:', plagaIds);
  }, []);


  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || typeof map.getSource !== 'function') return; // ⚠️ Protege de errores

    Object.entries(markerStyles).forEach(([plagaId, style]) => {
      const sourceId = `plaga-${plagaId}-source`;
      const heatmapLayerId = `plaga-${plagaId}-heatmap`;

      if (map.getSource(sourceId)) {
        // Si el heatmap está activado y la capa no existe, agrégala
        if (style.heatmapEnabled) {
          if (!map.getLayer(heatmapLayerId)) {
            map.addLayer({
              id: heatmapLayerId,
              type: 'heatmap',
              source: sourceId,
              paint: {
                'heatmap-radius': style.heatmapRadius || 20,
                'heatmap-intensity': 1,
              }
            });
          } else {
            // Si ya existe, actualiza el radio
            map.setPaintProperty(heatmapLayerId, 'heatmap-radius', style.heatmapRadius || 20);
          }
        } else {
          // Si el heatmap está desactivado, quita la capa
          if (map.getLayer(heatmapLayerId)) {
            map.removeLayer(heatmapLayerId);
          }
        }
      }
    });
  }, [markerStyles]);



  const handleMove = useCallback((evt) => {
    const newViewport = {
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
    };
    setViewport(newViewport);
  }, []);

  const handleDeleteCoord = useCallback((index) => {
    setDrawCoords((coords) => coords.filter((_, i) => i !== index));
  }, [setDrawCoords]);
  //funcion que permite subir los datos desde formato csv
  const handleFileUpload = useCallback((fileEvent) => {
    console.log('🪲 Plaga IDs guardados en localStorage');
    const file = fileEvent.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadedFeatures([]); // Limpiar datos previos

    const worker = new Worker(new URL('./csvWorker.js', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (messageEvent) => {
      console.log('Datos recibidos del Web Worker:', messageEvent.data);
      if (messageEvent.data.error) {
        console.error('Error en Web Worker:', messageEvent.data.error);
        alert('Error al procesar el CSV: ' + messageEvent.data.error);
        setIsLoading(false);
        worker.terminate();
        return;
      }

      const features = messageEvent.data.features;
      console.log('Features recibidas:', features);

      if (features.length === 0) {
        alert('No se encontraron datos válidos en el CSV.');
        setIsLoading(false);
        worker.terminate();
        return;
      }

      // ✅ Guardar x, y, plaga_id en localStorage
      const simplified = features.map(f => ({
        x: f.properties.x,
        y: f.properties.y,
        plaga_id: f.properties.plaga_id,
      }));
      localStorage.setItem('plagas_csv', JSON.stringify(simplified));
      console.log('✅ x, y, plaga_id guardados en localStorage:', simplified);

      const CHUNK_SIZE = 2000;
      const totalChunks = Math.ceil(features.length / CHUNK_SIZE);
      console.log('Total de chunks:', totalChunks);

      const loadChunk = (chunkIndex) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunk = features.slice(start, end);
        console.log(`Cargando chunk ${chunkIndex + 1}/${totalChunks}:`, chunk.length, 'features');

        setUploadedFeatures((prev) => [...prev, ...chunk]);

        if (chunkIndex < totalChunks - 1) {
          setTimeout(() => loadChunk(chunkIndex + 1), 50);
        } else {
          setIsLoading(false);
          console.log('Carga completada, total features:', features.length);
        }
      };

      loadChunk(0);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Error en Web Worker:', error);
      alert('Error al procesar el CSV: ' + error.message);
      setIsLoading(false);
      worker.terminate();
    };

    const reader = new FileReader();
    reader.onload = function (e) {
      const csvText = e.target.result;
      worker.postMessage(csvText); // ✅ envía el contenido de texto, no el archivo
    };
    reader.readAsText(file, 'UTF-8'); // ✅ fuerza la codificación correcta
  }, []);
  //funcion que dispara la carga de datos desde la base de datos
  const connectToDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://agroplagaspro-backend-1.onrender.com/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido al conectar a la base de datos');
      }

      const tables = await response.json();
      setTables(tables);
      setShowDbForm(true);
    } catch (error) {
      console.error('Error conectando a la base de datos:', error);
      alert('Error al conectar a la base de datos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dbConfig]);
  //funcion que obtiene los datos de la tabla selecionada
  const loadTableData = useCallback(async (table) => {
    if (!table) return;

    try {
      setIsLoading(true);
      const bounds = mapRef.current.getBounds();
      const response = await fetch('https://agroplagaspro-backend-1.onrender.com/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dbConfig,
          table,
          /* bbox: {
             west: bounds.getWest(),
             east: bounds.getEast(),
             south: bounds.getSouth(),
             north: bounds.getNorth(),
           }, */
        }),
      });
      if (!response.ok) throw new Error('Error al cargar los datos');
      const geojson = await response.json();

      const optimizedFeatures = (geojson?.features || [])
        .map(f => {
          const coordinates = f.geometry?.coordinates;

          if (!coordinates || coordinates.length !== 2) return null;

          const lng = parseFloat(Number(coordinates[0]).toFixed(6));
          const lat = parseFloat(Number(coordinates[1]).toFixed(6));

          if (isNaN(lng) || isNaN(lat)) return null;

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            properties: {
              plaga_id: f.properties?.plaga_id || null,
              x: lng,
              y: lat
            }
          };
        }).filter(Boolean);

      console.log("Datos a guardar en localStorage:", optimizedFeatures);
      console.log('📦 GeoJSON recibido:', geojson);
      console.log('✅ Features optimizadas:', optimizedFeatures);

      // Extraer IDs de plaga
      const plagaIDs = optimizedFeatures
        .map(f => f.properties?.plaga_id)
        .filter(id => id !== null && id !== undefined);

      console.log('🪲 IDs de plaga extraídos:', plagaIDs);

      // Guardar los IDs en localStorage
      localStorage.setItem('plagaIDs', JSON.stringify(plagaIDs));
      console.log('🪲 Plaga IDs guardados en localStorage');

      setUploadedFeatures(optimizedFeatures);
      setIsLoading(false);
      setShowDbForm(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
      setIsLoading(false);
    }
  }, [dbConfig]);
  //console.log("Selected Feature:", location.state?.selectedFeature);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Función que contiene toda la lógica de manejo de heatmaps
    function handleHeatmapLayers(map) {
      // Obtener todos los ids de heatmap en el mapa (por convención)
      const existingHeatmapLayerIds = map.getStyle().layers
        .filter(layer => layer.id.startsWith('heatmap-'))
        .map(layer => layer.id);

      // Eliminar capas y fuentes que ya no están activas en markerStyles
      existingHeatmapLayerIds.forEach(layerId => {
        const plagaId = layerId.replace('heatmap-', '');
        const sourceId = `heatmap-source-${plagaId}`;

        const style = markerStyles[plagaId];
        if (!style || !style.heatmapEnabled) {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
            console.log(`🗑️ Eliminada capa: ${layerId}`);
          }
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
            console.log(`🗑️ Eliminado source: ${sourceId}`);
          }
        }
      });

      // Filtrar plagas con heatmap activado
      const plagasConHeatmap = Object.entries(markerStyles).filter(([_, style]) => style.heatmapEnabled);

      if (plagasConHeatmap.length === 0) return;

      plagasConHeatmap.forEach(([plagaId, style]) => {
        const layerId = `heatmap-${plagaId}`;
        const sourceId = `heatmap-source-${plagaId}`;

        const featuresForPlaga = uploadedFeatures.filter(f => f.properties?.plaga_id === plagaId);

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: featuresForPlaga
            }
          });

          map.addLayer({
            id: layerId,
            type: 'heatmap',
            source: sourceId,
            minzoom: 12,
            maxzoom: 18,
            paint: {
              'heatmap-weight': 1,
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                12, 1,
                18, 3
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                12, 10,
                18, 25
              ],
              'heatmap-opacity': 0.8,
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 255, 0)',
                0.2, 'rgba(0, 0, 255, 0.3)',
                0.4, 'rgba(0, 255, 0, 0.4)',
                0.6, 'rgba(255, 255, 0, 0.5)',
                0.8, 'rgba(255, 165, 0, 0.6)',
                1, 'rgba(255, 0, 0, 0.7)'
              ]
            }
          });
          console.log(`✅ Capa de calor agregada: ${layerId}`);
        } else {
          const source = map.getSource(sourceId);
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features: featuresForPlaga
            });
          }
        }
      });
    }

    if (!map.isStyleLoaded()) {
      // Esperar a que el estilo esté listo
      const onStyleLoad = () => {
        handleHeatmapLayers(map);
        map.off('style.load', onStyleLoad);
      };
      map.on('style.load', onStyleLoad);
    } else {
      // Si ya está listo, ejecuta directamente
      handleHeatmapLayers(map);
    }

  }, [markerStyles, uploadedFeatures]);


  useEffect(() => {
    if (!mapRef.current) return;

    const handleClick = () => {
      console.log('click');
    };

    mapRef.current.on('click', handleClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleClick);
      }
    };
  }, []);
  //recalibra el mapa cuando el sidebar collapsa
  useEffect(() => {
    const timeout = setTimeout(() => {
      const map = mapRef.current?.getMap?.();
      if (map && typeof map.resize === 'function') {
        map.resize();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [collapsed]);


  // Nueva función para limpiar localStorage
  const fileInputRef = useRef(null);
  const clearLocalStorageFeatures = useCallback(() => {
    try {
      localStorage.removeItem('uploadedFeatures');
      setUploadedFeatures([]);
      setClusters([]);
      setVisibleFeatures([]);
      setSelectedFeature(null);

      // 💡 Limpiar input de tipo file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Coordenadas limpiadas correctamente.');
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      alert('Error al limpiar las coordenadas: ' + error.message);
    }
  }, []);

  const lineFeatures = useMemo(
    () => uploadedFeatures.filter((f) => f.geometry?.type === 'LineString'),
    [uploadedFeatures]
  );

  const markerLayer = {
    id: 'point-layer',
    type: 'circle',
    paint: {
      'circle-radius': 1.8,//determina la grandura del circle de la coordenada
      'circle-color': '#00FF00',//determina el color
      'circle-opacity': 1,
    },
  };
  const pointLayer = {
    id: 'optimized-points',
    type: 'circle',
    source: 'points',
    minzoom: 10,
    paint: {
      'circle-color': [
        'match',
        ['get', 'tipo'],
        'Frutos', '#4CAF50',
        'Floral', '#9C27B0',
        '#607D8B'
      ],
      'circle-radius': {
        'base': 1.5,
        'stops': [
          [10, 2],
          [14, 3],
          [18, 5]
        ]
      },
      'circle-opacity': 0.8,
      'circle-stroke-width': 0.5
    }
  };

  const heatmapData = {
    type: 'FeatureCollection',
    features: uploadedFeatures.map(feature => ({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        density: 1
      }
    }))
  };

  const mapStyles = [
    { label: 'Callejero', value: 'mapbox://styles/mapbox/streets-v12' },
    { label: 'Satélite', value: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { label: 'Híbrido', value: 'mapbox://styles/mapbox/light-v10' },
    { label: 'Noche', value: 'mapbox://styles/mapbox/dark-v10' },
  ];

  const renderMarkers = useMemo(() => {
    if (uploadedFeatures.length === 0) return null;
    return (
      <Source
        id="points"
        type="geojson"
        data={{
          type: 'FeatureCollection',
          features: uploadedFeatures.filter(f =>
            f.geometry?.type === 'Point' &&
            f.geometry.coordinates &&
            f.geometry.coordinates.length === 2
          )
        }}
      >
        <Layer {...markerLayer} />
      </Source>
    );
  }, [uploadedFeatures]); // Actualizado para depender de uploadedFeatures

  const shapeGroupedFeatures = useMemo(() => {
    const groups = { circle: [], square: [], triangle: [] };

    for (const feature of displayedFeatures) {
      const plagaId = feature.properties.plaga_id;
      const shape = markerStyles[plagaId]?.shape || 'circle';

      const enrichedFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          color: markerStyles[plagaId]?.color || '#FF0000'
        }
      };

      if (groups[shape]) groups[shape].push(enrichedFeature);
    }

    return groups;
  }, [displayedFeatures, markerStyles]);

  const onLoad = async (e) => {
    const map = e.target;

    if (!map.hasImage('triangle-icon')) {
      const response = await fetch(Triangulo);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      map.addImage('triangle-icon', imageBitmap);
    }
  };


  return (


    <div
      className="map-container"
      style={{
        width: collapsed ? 'calc(100vw - 120px)' : 'calc(100vw - 235px)',
        transition: 'width 0.3s ease',
      }}
    >


      {showDbForm && (
        <div className="db-form">
          <h3>Conectar a PostgreSQL</h3>
          <input
            type="text"
            placeholder="Host (ej: localhost)"
            value={dbConfig.host}
            onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
          />

          <input
            type="text"
            placeholder="Base de datos"
            value={dbConfig.database}
            onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
          />
          <input
            type="text"
            placeholder="Usuario"
            value={dbConfig.user}
            onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
          />

          <select onChange={(e) => loadTableData(e.target.value)}>
            <option value="">Selecciona una tabla</option>
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <button className='btnCargarTabla' onClick={() => setShowDbForm(false)}>Cerrar</button>
        </div>
      )}

      <Map
        ref={mapRef}
        {...viewport}
        onMove={handleMove}
        mapStyle={mapStyle}
        mapboxAccessToken="pk.eyJ1IjoicG92ZWRhMTMxOCIsImEiOiJjbWE5ZHA3YjgxcnN0MmtvYjBlYXFnNnI3In0.UXIOSfPa2AAH18GT0352uQ"
        onClick={(event) => {
          if (!dibujando) return;
          const { lngLat } = event;
          setDrawCoords((prev) => [...prev, { latitude: lngLat.lat, longitude: lngLat.lng }]);
        }}
        onDblClick={(event) => {
          event.preventDefault();
          if (!dibujando || drawCoords.length < 3) return;
          setDrawCoords((prev) => [...prev, prev[0]]);
          setDibujando(false);
        }}
        onLoad={onLoad}
      >

        <Source id='plagas-source' type='geojson' data={{ type: 'FeatureCollection', features: displayedFeatures }}>
          {/* Capa para puntos no seleccionados */}
          <Layer
            id="plagas-layer-default"
            type="circle"
            filter={['!=', ['get', 'plaga_id'], selectedPlagaId]}
            paint={{
              'circle-radius': 3,
              'circle-color': '#00FF00',
              'circle-opacity': 0.6
            }}
          />

          {/* Capa para el punto seleccionado */}
          <Layer
            id="plagas-layer-selected"
            type="circle"
            filter={['==', ['get', 'plaga_id'], selectedPlagaId]}
            paint={{
              'circle-radius': 4,
              'circle-color': markerStyles[selectedPlagaId]?.color || '#FF0000',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
              'circle-opacity': 1
            }}
          />
        </Source>


        <Source id="square-source" type="geojson" data={{ type: 'FeatureCollection', features: shapeGroupedFeatures.square }}>
          <Layer
            id="square-layer"
            type="symbol"
            layout={{
              'icon-image': 'square-icon',
              'icon-size': 1
            }}
          />
        </Source>

        <Source id="triangle-source" type="geojson" data={{ type: 'FeatureCollection', features: shapeGroupedFeatures.triangle }}>
          <Layer
            id="triangle-layer"
            type="symbol"
            layout={{
              'icon-image': 'triangle-icon',  // debe coincidir con el nombre usado en addImage
              'icon-size': 1,
              'icon-allow-overlap': true     // permite que los iconos se superpongan sin desaparecer
            }}
          />
        </Source>
        {lineFeatures.length > 0 && (
          <Source id="lines-source" type="geojson" data={{ type: 'FeatureCollection', features: lineFeatures }}>
            <Layer id="only-line-layer" type="line" paint={{ 'line-color': '#0000FF', 'line-width': 2 }} />
          </Source>
        )}

        {renderMarkers}

        {selectedFeature && (
          <Popup
            latitude={selectedFeature.geometry.coordinates[1]}
            longitude={selectedFeature.geometry.coordinates[0]}
            onClose={() => setSelectedFeature(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div>
              <h4>Punto seleccionado</h4>
            </div>
          </Popup>
        )}


      </Map>
      <div className="controls-container">
        <button className="btn-inicio-terreno" onClick={() => setDibujando(!dibujando)}>
          {dibujando ? '🛑 Terminar dibujo' : '🖊️ Iniciar dibujo'}
        </button>

        <button
          className="btn-cerrar-terreno"
          disabled={drawCoords.length < 3}
          onClick={() => {
            setDrawCoords((prev) => [...prev, prev[0]]);
            setDibujando(false);
          }}
        >
          ✅ Cerrar terreno
        </button>

        <label className="btn-cargar-coords">
          📥
          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>

        <div className="map-controls">

          {mostrarMenu && (
            <div className="menu-heatmap">
              <ul>
                <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Opción 1</li>
                <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Opción 2</li>
              </ul>
            </div>
          )}
          <div className="layer-switcher">
            <button
              className="btn-cambiar-capa"
              onClick={(e) => {
                e.stopPropagation();
                setMostrarMenuCapas((prev) => !prev);
              }}
            >
              <img src={droneIcon} alt="Cambiar capa" className="icono-boton" />
            </button>
            {mostrarMenuCapas && (
              <div className="dropdown-layers">
                {mapStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      setMapStyle(style.value);
                      setMostrarMenuCapas(false);
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className='btn-limpiar-coords' onClick={clearLocalStorageFeatures}>
          🗑️
        </button>

        <button className='btn-conectar-db' onClick={connectToDatabase}>
          📊
        </button>
      </div>
    </div >
  );
};

export default MapView;