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
import {
  saveCoordenadasToIndexedDB,
  getCoordenadasFromIndexedDB,
  deleteCoordenadasFromIndexedDB // <-- ¡importar aquí!
} from './indexedDB'; // Ajusta la ruta si está en otra carpeta
import btnLlamarEstadisticas from './iconos/btn-abrir-Est-rapidas.png';


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
const MapView = ({ polygonData, coordinates, filteredFeatures, markerStyles, selectedPlagaId, collapsed, setCollapsed, dateRange, setDateRange }) => {
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
    zoom: 15,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    return savedSidebarState !== null ? JSON.parse(savedSidebarState) : true; // true = abierto por defecto
  });
  const [filteredData, setFilteredData] = useState([]);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCoordenadasFromIndexedDB();
        console.log("Datos de IndexedDB:", data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    }
    fetchData();
  }, []);

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

  // ✅ Solo guarda estilo y zoom
  useEffect(() => {
    if (mapStyle) {
      localStorage.setItem("mapStyle", mapStyle);
    }
  }, [mapStyle]);

  // Efecto para guardar el estado cada vez que cambie
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    const supercluster = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });
    supercluster.load(uploadedFeatures);
    superclusterRef.current = supercluster;

    // ❌ No guardar en localStorage
  }, [uploadedFeatures]);

  const filteredByDate = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return filteredFeatures;

    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;

    return filteredFeatures.filter((f) => {
      const fecha = new Date(f.properties.fecha); // 👈 asegúrate de tener fecha en tus datos
      const validStart = start ? fecha >= start : true;
      const validEnd = end ? fecha <= end : true;
      return validStart && validEnd;
    });
  }, [filteredFeatures, dateRange]);

  useEffect(() => {
    // aquí ya actualizas la capa/markers con filteredByDate
  }, [filteredByDate]);
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
        }).slice(0, 4000)
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
  const handleDateChange = async (range) => {
    // Consultamos IndexedDB y filtramos
    const allData = await getAllDataFromIndexedDB(); // tu función de lectura
    const filtered = allData.filter(item => {
      const itemDate = new Date(item.fecha);
      return itemDate >= new Date(range.start) && itemDate <= new Date(range.end);
    });
    setFilteredData(filtered);
  };


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
      const menu = menuRef.current;
      if (menu && !menu.contains(event.target)) {
        setMostrarMenu(false);
      }
    };


    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const renderFeaturesToMap = useCallback((features) => {
    const CHUNK_SIZE = 2000;
    const totalChunks = Math.ceil(features.length / CHUNK_SIZE);

    let accumulatedFeatures = [];

    const loadChunk = (chunkIndex) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = features.slice(start, end);

      // 🗺️ Dibuja directamente en el mapa (adaptar si tienes función específica)
      // Aquí puedes agregar los puntos al mapa directamente si usas mapbox.addSource/addLayer
      // Si no, puedes pasar esto a otra función más abajo.

      accumulatedFeatures = [...accumulatedFeatures, ...chunk];

      if (chunkIndex < totalChunks - 1) {
        setTimeout(() => loadChunk(chunkIndex + 1), 30); // velocidad mejorada
      } else {
        setUploadedFeatures(accumulatedFeatures); // ⚠️ solo una vez al final
        setIsLoading(false);
      }
    };

    loadChunk(0);
  }, []);


  //funcion para cargar csv
  const handleFileUpload = useCallback((fileEvent) => {
    const file = fileEvent.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadedFeatures([]); // Limpiar datos previos del mapa

    const worker = new Worker(new URL('./csvWorker.js', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = async (messageEvent) => {
      if (messageEvent.data.error) {
        console.error('Error en Web Worker:', messageEvent.data.error);
        alert('Error al procesar el CSV: ' + messageEvent.data.error);
        setIsLoading(false);
        worker.terminate();
        return;
      }

      const features = messageEvent.data.features;
      if (features.length === 0) {
        alert('No se encontraron datos válidos en el CSV.');
        setIsLoading(false);
        worker.terminate();
        return;
      }

      // ✅ Datos simplificados para renderizar el mapa o guardar en localStorage si lo deseas
      const simplified = features.map(f => ({
        x: f.properties.x,
        y: f.properties.y,
        plaga_id: f.properties.plaga_id,
      }));

      // ✅ Datos completos para IndexedDB y backend
      const allProperties = features.map(f => f.properties);

      // ✅ Guardar solo en IndexedDB (más seguro para datos grandes)
      await saveCoordenadasToIndexedDB(allProperties);

      // ✅ Enviar al backend
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await fetch(`https://agroplagaspro-backend-1.onrender.com/api/coordenadas/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allProperties),
          });

          if (!response.ok) {
            throw new Error(`Error al guardar coordenadas en backend (${response.status})`);
          }

          console.log('🛰 Coordenadas guardadas en el backend exitosamente.');
        } catch (err) {
          console.error('❌ Error al guardar coordenadas en el backend:', err);
        }
      } else {
        console.error('⚠️ Usuario no encontrado en localStorage');
      }

      // ✅ Terminar worker
      worker.terminate();

      // ✅ Renderizar el mapa (usa features originales con geometría)
      await renderFeaturesToMap(features);
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
      worker.postMessage(csvText);
    };
    reader.readAsText(file, 'UTF-8');
  }, [renderFeaturesToMap]);



  useEffect(() => {
    async function loadPlagasFromDB() {
      const data = await getCoordenadasFromIndexedDB();

      // Asegúrate de que mapRef y mapRef.current existan y estén listos
      const map = mapRef.current;
      if (!map || !map.addSource) {
        console.warn('🛑 Mapa aún no está listo');
        return;
      }

      if (data.length > 0) {
        const geojson = {
          type: 'FeatureCollection',
          features: data.map((f, index) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [f.x, f.y],
            },
            properties: {
              plaga_id: f.plaga_id,
              id: index,
            },
          })),
        };

        if (!map.getSource('plagas-source')) {
          map.addSource('plagas-source', {
            type: 'geojson',
            data: geojson,
          });
        }

        if (!map.getLayer('plagas-layer-default')) {
          map.addLayer({
            id: 'plagas-layer-default',
            type: 'circle',
            source: 'plagas-source',
            paint: {
              'circle-radius': 4,
              'circle-color': '#ff0000',
            },
          });
        }
      }
    }

    loadPlagasFromDB();
  }, []);

  const handleClearMap = async () => {
    await deleteCoordenadasFromIndexedDB(); // elimina los datos
    setDisplayedFeatures([]);               // limpia el estado del mapa
    alert('Coordenadas eliminadas del mapa y de la base local.');
  };


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
      localStorage.removeItem('plagas_csv');
      localStorage.removeItem('plagaIDs');

      setUploadedFeatures([]);
      setClusters([]);
      setVisibleFeatures([]);
      setSelectedFeature(null);

      // 💡 Limpiar input de tipo file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // 🗺️ Limpiar fuentes y capas del mapa
      const map = mapRef.current?.getMap?.();
      if (map) {
        const layers = map.getStyle().layers || [];

        layers.forEach((layer) => {
          const { id } = layer;
          if (
            id.startsWith('heatmap-') ||
            id.startsWith('plaga-layer') ||  // tu prefijo de puntos si usas alguno
            id.startsWith('cluster')        // si tienes capas de cluster
          ) {
            if (map.getLayer(id)) {
              map.removeLayer(id);
              console.log(`✅ Capa eliminada: ${id}`);
            }
          }
        });

        const sources = ['plagas-source', ...Object.keys(markerStyles || {}).map(id => `heatmap-source-${id}`)];
        sources.forEach(sourceId => {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
            console.log(`🗑️ Fuente eliminada: ${sourceId}`);
          }
        });
      }

      alert('Coordenadas limpiadas correctamente.');
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      alert('Error al limpiar las coordenadas: ' + error.message);
    }
  }, [markerStyles]);


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

    // 🔹 Cargar datos desde IndexedDB al cargar el mapa
    const data = await getCoordenadasFromIndexedDB(); // asegúrate de tener esta función implementada
    if (data && data.length > 0) {
      const geojson = {
        type: 'FeatureCollection',
        features: data.map((f, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [f.x, f.y],
          },
          properties: {
            plaga_id: f.plaga_id,
            id: index,
          },
        })),
      };

      // ⚠️ Esta función debe estar definida en tu componente
      setDisplayedFeatures(geojson.features);
    }

    // 🔹 Cargar ícono "triangle-icon" si no está cargado
    if (!map.hasImage('triangle-icon')) {
      const response = await fetch(Triangulo);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      map.addImage('triangle-icon', imageBitmap);
    }

    // 🔹 (Opcional) Agregar más íconos si los necesitas aquí
    // if (!map.hasImage('square-icon')) {
    //   ...
    // }
  };

  const polygonLayer = {
    id: 'polygon-layer',
    type: 'fill',
    paint: {
      'fill-color': '#3388ff',
      'fill-opacity': 0.2,
      'fill-outline-color': '#3388ff'
    }
  };

  const polygonOutlineLayer = {
    id: 'polygon-outline-layer',
    type: 'line',
    paint: {
      'line-color': '#3388ff',
      'line-width': 2
    }
  };


  //funcion para calcular las estadísticas
  const stats1 = useMemo(() => {

    const resumen = {
      total: visibleFeatures.length,
      plagas: {},
      estados: {},
      zonas: {},
    };

    visibleFeatures.forEach(f => {
      const { plaga_id, estado, zona } = f.properties || {};

      // Contador de plagas
      if (plaga_id) {
        resumen.plagas[plaga_id] = (resumen.plagas[plaga_id] || 0) + 1;
      }

      // Contador de estados
      if (estado) {
        resumen.estados[estado] = (resumen.estados[estado] || 0) + 1;
      }

      // Contador de zonas
      if (zona) {
        resumen.zonas[zona] = (resumen.zonas[zona] || 0) + 1;
      }
    });

    return resumen;
  }, [visibleFeatures]);
  useEffect(() => {
    async function loadData() {
      const data = await getCoordenadasFromIndexedDB();
      if (data.length > 0) {
        const geojson = data.map(d => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d.x, d.y],
          },
          properties: d
        }));
        setUploadedFeatures(geojson);
      }
    }
    loadData();
  }, []);

  const [mostrarSidebar, setMostrarSidebar] = useState(true);
  const handleCloseSidebar = () => {
    setMostrarSidebar(false);
  };

  // Guarda el viewport (zoom, lat, lng) en localStorage
  useEffect(() => {
    try {
      if (viewport) {
        localStorage.setItem("mapViewport", JSON.stringify(viewport));
      }
    } catch (error) {
      console.error("Error guardando viewport:", error);
    }
  }, [viewport]);
  return (

    <>
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
                'circle-radius': 2,
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
          <pre>{JSON.stringify(features, null, 2)}</pre>

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
                'icon-size': 0.03,
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

          {polygonData && (
            <Source
              id="polygon-source"
              type="geojson"
              data={{
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [polygonData.coordinates] // Asegúrate que coordinates es un array de [lng, lat]
                },
                properties: {}
              }}
            >
              <Layer {...polygonLayer} />
              <Layer {...polygonOutlineLayer} />
            </Source>
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
          <button onClick={handleClearMap} className="btn-limpiar-mapa">
            Limpiar Mapa
          </button>

        </div>

      </div>

      {!mostrarSidebar && (
        <button
          onClick={() => setMostrarSidebar(true)}
          className="btn-navbar"
        >
          <img className='btnEstadisticasRapidas' src={btnLlamarEstadisticas} alt="Abrir estadísticas" />
        </button>
      )}



      {mostrarSidebar && (
        <div className="sidebar-estadisticas">
          <button
            className="btn-cerrar-estadisticas"
            onClick={handleCloseSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"   // 👈 en React es camelCase
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h3>📊 Estadísticas Visibles</h3>
          <p><strong>Total de puntos:</strong> {stats1.total}</p>

          <h4>🦟 Plagas</h4>
          <ul>
            {Object.entries(stats1.plagas).map(([plaga, count]) => (
              <li key={plaga}>{plaga}: {count}</li>
            ))}
          </ul>

          <h4>🔬 Estados</h4>
          <ul>
            {Object.entries(stats1.estados).map(([estado, count]) => (
              <li key={estado}>{estado}: {count}</li>
            ))}
          </ul>

          <h4>🧭 Zonas</h4>
          <ul>
            {Object.entries(stats1.zonas).map(([zona, count]) => (
              <li key={zona}>{zona}: {count}</li>
            ))}
          </ul>
        </div>
      )}

    </>
  );
};

export default MapView;