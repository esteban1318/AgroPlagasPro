import React, { useState, useCallback, useRef, useEffect, useContext, useMemo } from 'react';
import {
  FaTree,
  FaDrawPolygon,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaSeedling,
  FaTractor,
  FaWater,
  FaSun,
  FaFire, FaEye, FaEyeSlash, FaSync, FaChevronLeft,
  FaCalendarAlt, FaChevronRight, FaMap, FaSearch, FaPlus, FaLayerGroup, FaChevronDown, FaBug, FaTimes, FaInfoCircle, FaMapMarkedAlt
} from 'react-icons/fa';
import './sidebarMapas.css';
import PestFilterContext from './PestFilterContext';
import Fincas from './Fincas.json';
import { getCoordenadasFromIndexedDB } from './indexedDB';
import { Navigate, useNavigate } from 'react-router-dom';

const SidebarMapas = ({ polygonData, setPolygonData, collapsed, setCollapsed, onFilterChange, onMarkerClick, setSelectedPlagaId, selectedPlagaId }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState('plagas');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapRadius, setHeatmapRadius] = useState(20);
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.6);
  const [expandedFinca, setExpandedFinca] = useState(null);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [showAllPolygons, setShowAllPolygons] = useState(false);

  const {
    selectedPlagas,
    setSelectedPlagas,
    selectedPest,
    setSelectedPest,
    markerStyles,
    setMarkerStyles
  } = useContext(PestFilterContext);



  const [expandedSection, setExpandedSection] = useState(null);

  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const plagas = useMemo(() => [{ id: 'ACARO_1', nombre: "Acaro" },
  { id: 'ACARO_2', nombre: "Acaro" },
  { id: 'ACARO_3', nombre: "Acaro" },
  { id: 'ACARO_4', nombre: "Acaro" },
  { id: 'ANASTREPHA_1', nombre: 'Anastrepha' },
  { id: 'ARANA_1', nombre: 'Araña' },
  { id: 'AFIDOS_1', nombre: "Pulgones" },
  { id: 'CHINCHE_1', nombre: 'Chinche comun' },
  { id: 'CHIZAS_1', nombre: 'Chizas' },
  { id: 'COCHINILLA_1', nombre: 'Cochinilla' },
  { id: 'COMEJEN_1', nombre: 'Comejen' },
  { id: 'DIAPHORINA_1', nombre: "Diaphorina" },
  { id: 'DIPTERO_1', nombre: "Diptero" },
  { id: 'ESCAMA_1', nombre: 'Escama fruto' },
  { id: 'ESCAMA_2', nombre: 'Escama ramas' },
  { id: 'FALSO_1', nombre: 'Falso medidor' },
  { id: 'GENERAL_1', nombre: 'General' },
  { id: 'GRILLOS_1', nombre: 'Grillos' },
  { id: 'GRILLOS_2', nombre: 'Grillos' },
  { id: 'HORMIGA_1', nombre: 'Hormiga' },
  { id: 'HORTZIA_1', nombre: 'Hortzia' },
  { id: 'LEPIDOPTERO_1', nombre: 'Lepidoptero' },
  { id: 'MINADOR_1', nombre: 'Minador' },
  { id: 'MOSCA_1', nombre: 'Mosca Blanca' },
  { id: 'MOSCA_2', nombre: 'Mosca Cebra' },
  { id: 'MOSCA_3', nombre: 'Mosca Comun' },
  { id: 'MOSCA_4', nombre: 'Mosca de la Fruta' },
  { id: 'MOSCA_5', nombre: 'Mosca del Mediterraneo' },
  { id: 'MOSCA_6', nombre: 'Mosca del Ovario' },
  { id: 'NEMATODOS_1', nombre: 'Nematodos' },
  { id: 'NINGUNO', nombre: 'Ninguno' },
  { id: 'OTROSGU_1', nombre: 'Otros Gusanos' },
  { id: 'PICUDO_1', nombre: 'Picudo (Compsus)' },
  { id: 'PIOJO_1', nombre: 'Piojo' },
  { id: 'POLILLA_1', nombre: 'Polilla' },
  { id: 'TRIHCHOGRAMMA_1', nombre: 'Trihchogramma' },
  { id: 'TRIPS_1', nombre: 'Trips' }
  ],
    []);

  const memoCoordinates = useMemo(() => coordinates, [coordinates]);
  const memoMarkerStyles = useMemo(() => markerStyles, [markerStyles]);
  // Datos de ejemplo - en una app real estos vendrían de una API
  useEffect(() => {
    if (!plagas || plagas.length === 0) return; // <- ✅ protección para evitar error

    const plagaColors = {
      'ACARO_1': '#e622b2',
      'ACARO_2': '#3498db',
      'ACARO_3': '#f1c40f',
      'ACARO_4': '#FF0000',
      'ANASTREPHA_1': '#9b59b6',
      'ARANA_1': '#e67e22',
      'AFIDOS_1': '#1abc9c',
      'CHINCHE_1': '#2ecc71',
      'CHIZAS_1': '#8e44ad',
      'COCHINILLA_1': '#d35400',
      'COMEJEN_1': '#34495e',
      'DIAPHORINA_1': '#e74c3c',
      'DIPTERO_1': '#f39c12',
      'ESCAMA_1': '#2980b9',
      'ESCAMA_2': '#16a085',
      'FALSO_1': '#c0392b',
      'GENERAL_1': '#7f8c8d',
      'GRILLOS_1': '#95a5a6',
      'GRILLOS_2': '#bdc3c7',
      'HORMIGA_1': '#27ae60',
      'HORTZIA_1': '#f39c9c',
      'LEPIDOPTERO_1': '#5dade2',
      'MINADOR_1': '#af7ac5',
      'MOSCA_1': '#f5b041',
      'MOSCA_2': '#dc7633',
      'MOSCA_3': '#7d3c98',
      'MOSCA_4': '#45b39d',
      'MOSCA_5': '#a569bd',
      'MOSCA_6': '#3498db',
      'NEMATODOS_1': '#d35400',
      'NINGUNO': '#cccccc',
      'OTROSGU_1': '#48c9b0',
      'PICUDO_1': '#b03a2e',
      'PIOJO_1': '#7b241c',
      'POLILLA_1': '#1f618d',
      'TRIHCHOGRAMMA_1': '#d68910',
      'TRIPS_1': '#2ecc71'
    };

    const initialStyles = plagas.reduce((styles, plaga) => {
      styles[plaga.id] = {
        color: plagaColors[plaga.id] || '#FF0000', // color por defecto si no se encuentra
        icon: 'bug',
        shape: 'circle',
        heatmapEnabled: false,
        heatmapIntensity: 0.5,
        heatmapRadius: 15,
      };
      return styles;
    }, {});


    setMarkerStyles(initialStyles);
  }, [plagas]); // <- ✅ se ejecuta solo cuando plagas está definido



  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  //funcion que se ejecuta cuando haces clic en una plaga.
  const togglePlagaSelection = (plaga) => {
    console.log("plaga selecionada", plaga.id)
    const isSelected = selectedPlagas.includes(plaga.id);

    // Ejemplo: Filtrar coordenadas para la plaga seleccionada
    const filteredCoords = coordinates.filter(coord => coord.plagaId === plaga.id);
    if (!isSelected && filteredCoords.length > 0) {
      // Enfocar el mapa en la primera coordenada de la plaga
      onMarkerClick(filteredCoords[0]);
    }
    let newSelectedPlagas;

    if (isSelected) {
      newSelectedPlagas = selectedPlagas.filter(id => id !== plaga.id);
      setSelectedPlagaId(null); // Deselecciona la plaga activa si se quita
    } else {
      newSelectedPlagas = [...selectedPlagas, plaga.id];
      setSelectedPlagaId(plaga.id); // Establece la última seleccionada como activa
    }

    setSelectedPlagas(newSelectedPlagas);
    setSelectedPest(plaga.nombre);
  };
  const togglePlagaGroup = (nombre) => {
    setExpandedGroups(prev =>
      prev.includes(nombre)
        ? prev.filter(n => n !== nombre)
        : [...prev, nombre]
    );
  };

  const groupedPlagas = useMemo(() => {
    return plagas.reduce((acc, plaga) => {
      if (!acc[plaga.nombre]) acc[plaga.nombre] = [];
      acc[plaga.nombre].push(plaga);
      return acc;
    }, {});
  }, [plagas]);
  const handleMarkerStyleChange = (plagaId, property, value) => {
    setMarkerStyles(prev => {
      const currentStyle = prev[plagaId] || {};

      // Caso especial cuando se activa/desactiva el heatmap
      if (property === 'heatmapEnabled') {
        return {
          ...prev,
          [plagaId]: {
            ...currentStyle,
            [property]: value,
            // Si activamos el heatmap, establece valores por defecto si no existen
            ...(value === true && {
              heatmapIntensity: currentStyle.heatmapIntensity || 0.5,
              heatmapRadius: currentStyle.heatmapRadius || 20,
              // Mantén otros estilos existentes
              color: currentStyle.color || '#FF0000',
              icon: currentStyle.icon || 'bug',
              shape: currentStyle.shape || 'circle'
            })
          }
        };
      }

      // Para cambios en otros parámetros
      return {
        ...prev,
        [plagaId]: {
          ...currentStyle,
          [property]: value,
          // Si estamos modificando parámetros del heatmap, asegurarnos que heatmapEnabled esté activo
          ...(property.includes('heatmap') && !currentStyle.heatmapEnabled ? {
            heatmapEnabled: true
          } : {})
        }
      };
    });
  };

  const handleCoordinateClick = (coord) => {
    setSelectedCoordinate(coord);
    if (onMarkerClick) onMarkerClick(coord);
  };

  // Filtramos las coordenadas basadas en las plagas seleccionadas
  useEffect(() => {
    if (onFilterChange) {
      const filtered = selectedPlagas.length > 0
        ? memoCoordinates.filter(coord => selectedPlagas.includes(coord.plagaId))
        : memoCoordinates;

      onFilterChange(filtered, memoMarkerStyles);
    }
  }, [selectedPlagas, memoCoordinates, memoMarkerStyles, onFilterChange]);

  const mapas = [
    { id: 1, nombre: "La Mesa", capas: 3, fecha: "01/05/2025" },
    { id: 2, nombre: "El Colegio", capas: 2, fecha: "28/04/2025" },
    { id: 3, nombre: "Apulga", capas: 1, fecha: "25/04/2025" },
    { id: 4, nombre: "Jocaima", capas: 4, fecha: "20/04/2025" },
    { id: 5, nombre: "MapBox", capas: 5, fecha: "15/04/2025" }
  ];

  const zonas = [
    { id: 1, nombre: "Tena" },
    { id: 2, nombre: "Gamaia" },
    { id: 3, nombre: "Silvania" }
  ];

  const abrirSidebar = () => {
    setCollapsed(false);
  }
  const cerrarSidebar = () => {
    setCollapsed(true);
  }
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  const handleToggle = useCallback(() => {
    setTimeout(() => {
      setCollapsed(prev => !prev);
    }, 0);
  }, [isMounted]);

  const sidebarRef = useRef(null);

  const toggleFinca = (fincaId) => {
    setExpandedFinca(expandedFinca === fincaId ? null : fincaId);
  };
  // Función para obtener colores únicos para cada finca
  const getColorForFinca = (index) => {
    const colors = ['#2E7D32', '#388E3C', '#1B5E20', '#4CAF50', '#8BC34A'];
    return colors[index % colors.length];
  };


  const mapRef = useRef(); // Esto debe estar al principio del componente
  const handleRemovePolygon = () => {
    console.log('🧽 Eliminando polígono (vía React)');
    setPolygonData(null); // ✅ esto limpia el polígono del mapa
  };

  const removePolygonFromMap = () => {
    console.log('🧽 Eliminando polígono (vía React)');
    setPolygonData(null); // ✅ esto limpia el polígono del mapa
  };


  // Estados para el filtrado por fecha
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [activeQuickDate, setActiveQuickDate] = useState(null);

  // Manejadores para el filtrado por fecha
  const handleDateChange = (type, value) => {
    setDateRange((prev) => {
      const next = { ...prev, [type]: value };

      // Si el usuario pone start > end, ajustamos el otro extremo.
      if (next.start && next.end && next.start > next.end) {
        if (type === "start") next.end = next.start;
        if (type === "end") next.start = next.end;
      }

      return next;
    });
    setActiveQuickDate(null);
  };

  // Convierte 'YYYY-MM-DD' a Date **local** (no UTC)
  const toLocalDate = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // Fin del día local (23:59:59.999) para inclusividad del "Hasta"
  const endOfDayLocal = (date) =>
    date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999) : null;

  // Formatea Date -> 'YYYY-MM-DD' **en local**
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const dateToInput = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const handleQuickDateSelect = (preset) => {
    if (preset === "clear") {
      setDateRange({ start: null, end: null });
      setActiveQuickDate(null);
      return;
    }

    const today = new Date();
    const endStr = dateToInput(today);
    const start = new Date(today);

    if (preset === "week") start.setDate(start.getDate() - 6);   // últimos 7 días incl. hoy
    if (preset === "month") start.setDate(start.getDate() - 29); // últimos 30 días
    if (preset === "year") start.setDate(start.getDate() - 364); // últimos 365 días

    setDateRange({ start: dateToInput(start), end: endStr });
    setActiveQuickDate(preset);
  };

  // Normaliza strings como "2/01/2025", "02-01-2025", "2.1.2025"
  function normalizarFechaDDMMYYYY(f) {
    if (!f) return null;
    if (f instanceof Date) return Number.isNaN(f.getTime()) ? null : f;

    const s = String(f).trim();
    const match = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (!match) return null;

    let [, d, m, y] = match;
    d = Number(d); m = Number(m); y = Number(y);

    if (y < 100) y += 2000;

    if (!(d >= 1 && d <= 31 && m >= 1 && m <= 12 && y > 0)) return null;

    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== (m - 1) || date.getDate() !== d) {
      return null;
    }
    return date;
  }

  // Devuelve timestamp (ms) a partir de cualquier formato válido
  const getPlagaTime = (f) => {
    if (!f) return NaN;

    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
      const d = toLocalDate(f);
      return d ? d.getTime() : NaN;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(f)) {
      const d = normalizarFechaDDMMYYYY(f);
      return d ? d.getTime() : NaN;
    }

    const d = new Date(f);
    return Number.isNaN(d.getTime()) ? NaN : d.getTime();
  };

  console.log("Todas las plagas con fechas normalizadas:");
  plagas.forEach(p => console.log(p.fecha, getPlagaTime(p.fecha)));

  // --- Aplica el filtro de fechas al hacer click en el botón ---
  async function aplicarFiltros() {
    const data = await getCoordenadasFromIndexedDB();

    const startDate = normalizarFechaDDMMYYYY(dateRange.start);
    const endDate = normalizarFechaDDMMYYYY(dateRange.end);

    if (!startDate || !endDate) {
      console.warn("Fechas inválidas");
      return;
    }

    const filtrados = datos.filter(item => {
      if (!item.fecha) return false;
      const fecha = normalizarFechaDDMMYYYY(item.fecha);
      return fecha >= startDate && fecha <= endDate;
    });

    console.log("✅ Plagas filtradas:", filtrados);
    setDatosFiltrados(filtrados);
  }

  // 🔍 Función para traer plagas por rango de fechas desde IndexedDB
  const getDBPlagas = async () => {
    return openDB("miDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("plagas")) {
          db.createObjectStore("plagas", { keyPath: "id", autoIncrement: true });
          console.log('Store "plagas" creada');
        }
      }
    });
  };

  const getPlagasByDateRange = async (startDate, endDate) => {
    const db = await getDBPlagas(); // ✅ Asegura que el store existe
    const tx = db.transaction("plagas", "readonly");
    const store = tx.objectStore("plagas");

    const allPlagas = [];
    let cursor = await store.openCursor();

    while (cursor) {
      const plaga = cursor.value;
      const fechaPlaga = new Date(plaga.fecha);
      if ((!startDate || fechaPlaga >= new Date(startDate)) &&
        (!endDate || fechaPlaga <= new Date(endDate))) {
        allPlagas.push(plaga);
      }
      cursor = await cursor.continue();
    }

    return allPlagas;
  };

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      getPlagasByDateRange(dateRange.start, dateRange.end)
        .then((res) => {
          console.log("✅ Plagas filtradas por rango:", res);
          setPlagasFiltradas(res);
        })
        .catch((err) => console.error("Error consultando IndexedDB:", err));
    }
  }, [dateRange]);
  //
  // Mostrar todos los polígonos


  const handleShowPolygon = (feature) => {
    console.log("📍 handleShowPolygon recibió:", feature);

    if (!feature) {
      console.error("❌ Feature es undefined");
      return;
    }

    if (!mapRef.current) return;

    const id = `finca-${feature.properties?.id}`;
    console.log("🆔 ID capa:", id);

    // Verifica coordenadas
    if (!feature.geometry?.coordinates) {
      console.error("⚠️ La geometría no tiene coordenadas:", feature.geometry);
      return;
    }

    // Aquí iría tu lógica para añadir la capa
  };


  const handleToggleAllPolygons = () => {
    console.log("🟢 Click en mostrar todas las fincas");
    setPolygonData(Fincas); // aquí mandas el JSON entero al MapView
  };

  const handleRemoveAllPolygons = () => {
    if (!mapRef.current) return;
    console.log("🔴 Ocultando todos los polígonos");

    // Eliminar capas y fuentes de Mapbox
    polygonData?.features?.forEach((feature) => {
      const id = `finca-${feature.properties.id}`;
      if (mapRef.current.getLayer(id)) mapRef.current.removeLayer(id);
      if (mapRef.current.getSource(id)) mapRef.current.removeSource(id);
    });

    // Limpiar estado de React
    setPolygonData({ type: "FeatureCollection", features: [] });
  };

  // Renderizar polígonos cuando cambie polygonData
  useEffect(() => {
    if (!mapRef.current) return;
    if (!polygonData?.features) return;

    polygonData.features.forEach((feature) => {
      const id = `finca-${feature.properties.id}`;

      // Evitar crear duplicados
      if (mapRef.current.getLayer(id)) return;

      mapRef.current.addSource(id, { type: "geojson", data: feature });
      mapRef.current.addLayer({
        id,
        type: "fill",
        source: id,
        paint: { "fill-color": "#088", "fill-opacity": 0.4 },
      });
    });
  }, [polygonData]);
  return (
    <>
      <div
        ref={sidebarRef}
        className={`sidebar-mapas1 ${collapsed ? 'collapsed' : 'expanded'}`}
        aria-hidden={collapsed}
      >

        <div className="sidebar-header">
          <h3>
            <FaMap className="sidebar-icon" />
            {!collapsed && <span>Herramientas</span>}
          </h3>
        </div>
        {/* Panel de información de coordenada seleccionada */}
        {selectedCoordinate && (
          <div className="coordinate-info-panel">
            <div className="panel-header">
              <h4>Detalle de Plaga</h4>
              <button onClick={() => setSelectedCoordinate(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="panel-content">
              <p><strong>Plaga:</strong> {plagas.find(p => p.id === selectedCoordinate.plagaId)?.nombre}</p>
              <p><strong>Fecha:</strong> {selectedCoordinate.fecha}</p>
              <p><strong>Descripción:</strong> {selectedCoordinate.descripcion}</p>
              <p><strong>Coordenadas:</strong> {selectedCoordinate.lat}, {selectedCoordinate.lng}</p>
            </div>
          </div>
        )}

        {/* Sección de Plagas con controles de estilo */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('plagas')}>
            <FaBug className="section-icon" />
            {!collapsed && (
              <>
                <span>Filtrar Plagas</span>
                <FaChevronDown className={`chevron ${expandedSection === 'plagas' ? 'expanded' : ''}`} />
              </>
            )}
          </div>
          {expandedSection === 'plagas' && !collapsed && (
            <div className="section-content">
              {Object.entries(groupedPlagas).map(([nombre, subPlagas]) => (
                <div key={nombre} className="plaga-group">
                  <div className="group-header" onClick={() => togglePlagaGroup(nombre)}>
                    <span>{nombre}</span>
                    <FaChevronDown className={`chevron ${expandedGroups.includes(nombre) ? 'expanded' : ''}`} />
                  </div>

                  {expandedGroups.includes(nombre) && (
                    <div className="subplagas">
                      {subPlagas.map(plaga => (
                        <div
                          key={plaga.id}
                          className={`box ${selectedPlagas.includes(plaga.id) ? 'selected' : ''}`}
                          onClick={() => togglePlagaSelection(plaga)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlagas.includes(plaga.id)}
                            onClick={(e) => e.stopPropagation()} // evita que se propague
                            onChange={() => togglePlagaSelection(plaga)} // gestiona la selección
                          />

                          <span>{plaga.id}</span>

                          {selectedPlagas.includes(plaga.id) && (
                            <div className="plaga-style-controls">
                              {/* Controles básicos */}
                              <div className="style-control">
                                <label>Color:</label>
                                <input
                                  type="color"
                                  value={markerStyles[plaga.id]?.color || '#FF0000'}
                                  onClick={(e) => e.stopPropagation()} // evita que se cierre el panel
                                  onChange={(e) => handleMarkerStyleChange(plaga.id, 'color', e.target.value)}
                                />
                              </div>

                              <div className="style-control">
                                <label>Icono:</label>
                                <select
                                  value={markerStyles[plaga.id]?.icon || 'bug'}
                                  onClick={(e) => e.stopPropagation()} // evita que se cierre el panel
                                  onChange={(e) => handleMarkerStyleChange(plaga.id, 'icon', e.target.value)}
                                >
                                  <option value="bug">Insecto</option>
                                  <option value="leaf">Hoja</option>
                                  <option value="warning">Advertencia</option>
                                </select>
                              </div>

                              <div className="style-control">
                                <label>Forma:</label>
                                <select
                                  value={markerStyles[plaga.id]?.shape || 'circle'}
                                  onClick={(e) => e.stopPropagation()} // evita que se cierre el panel
                                  onChange={(e) => handleMarkerStyleChange(plaga.id, 'shape', e.target.value)}
                                >
                                  <option value="circle">Círculo</option>

                                  <option value="triangle">Triángulo</option>
                                </select>
                              </div>

                              {/* Controles del heatmap */}
                              <div className="style-control heatmap-toggle">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={markerStyles[plaga.id]?.heatmapEnabled || false}
                                    onClick={(e) => e.stopPropagation()} // evita que se cierre el panel
                                    onChange={(e) => {
                                      handleMarkerStyleChange(plaga.id, 'heatmapEnabled', e.target.checked);
                                    }}
                                  />
                                  <span>Mapa de calor</span>
                                </label>
                              </div>

                              {markerStyles[plaga.id]?.heatmapEnabled && (
                                <div className="style-control">
                                  <label>
                                    Radio: {markerStyles[plaga.id]?.heatmapRadius || 20}px
                                  </label>
                                  <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={markerStyles[plaga.id]?.heatmapRadius || 20}
                                    onClick={(e) => e.stopPropagation()} // evita que se cierre el panel
                                    onChange={(e) => {
                                      handleMarkerStyleChange(plaga.id, 'heatmapRadius', parseInt(e.target.value));
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Sección de Mapas */}
        {/*<div className="sidebar-section">
        <div className="section-header" onClick={() => toggleSection('mapas')}>
          <FaMap className="section-icon" />
          <span>Mis Mapas</span>
          <FaChevronDown className={`chevron ${expandedSection === 'mapas' ? 'expanded' : ''}`} />
        </div>
        {expandedSection === 'mapas' && (
          <div className="section-content">
            {mapas.map(mapa => (
              <div key={mapa.id} className="mapa-item">
                <div className="mapa-name">{mapa.nombre}</div>
                <div className="mapa-meta">
                  <span><FaLayerGroup /> {mapa.capas}</span>
                  <span>{mapa.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>*/}

        {/* Sección de Fincas */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('fincas')}>
            <FaMap className="section-icon" />
            <span>Fincas</span>
            <FaChevronDown className={`chevron ${expandedSection === 'fincas' ? 'expanded' : ''}`} />
          </div>

          {expandedSection === 'fincas' && (
            <div className="section-content">
              {/* Aquí quitamos el .map que repetía cada finca */}

              {/* Botones globales para todos los polígonos */}
              <button
                className="show-polygon-btn"
                onClick={() => {
                  console.log("🟢 Click detectado en botón");
                  handleToggleAllPolygons();
                }}
              >
                <FaDrawPolygon /> Mostrar polígonos
              </button>
              <button onClick={handleRemoveAllPolygons}>
                Ocultar polígonos
              </button>
            </div>
          )}
        </div>



      </div>
      <div className="mobile-sidebar-container">
        {console.log('renderizando boton flotante')}
        {/* Botón flotante para abrir sidebar en móvil */}
        <button
          className="mobile-sidebar-toggle-button"
          onClick={() => setMobileCollapsed(false)}
        >
          <FaChevronLeft />
        </button>

        {/* Sidebar para móvil */}
        <div className={`mobile-sidebar ${mobileCollapsed ? 'collapsed' : ''}`}>
          <div className="mobile-sidebar-header">
            <button
              className="mobile-close-button"
              onClick={() => setMobileCollapsed(true)}
            >
              <FaTimes />
            </button>
            <h3>
              <FaMap />
              <span>Herramientas</span>
            </h3>
          </div>

          {/* Panel de información */}
          {selectedCoordinate && (
            <div className="mobile-info-panel">
              <div className="mobile-panel-header">
                <h4>Detalle de Plaga</h4>
                <button onClick={() => setSelectedCoordinate(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="mobile-panel-content">
                <p><strong>Plaga:</strong> {plagas.find(p => p.id === selectedCoordinate.plagaId)?.nombre}</p>
                <p><strong>Coords:</strong> {selectedCoordinate.lat}, {selectedCoordinate.lng}</p>
                <p className="mobile-truncate">{selectedCoordinate.descripcion}</p>
              </div>
            </div>
          )}

          {/* Contenido principal con tabs */}
          <div className="mobile-tabs">
            <button
              className={`mobile-tab ${mobileActiveTab === 'plagas' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('plagas')}
            >
              <FaBug /> Plagas
            </button>
            <button
              className={`mobile-tab ${mobileActiveTab === 'reportes' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('reportes')}
            >
              <FaMapMarkedAlt /> Reportes
            </button>
            <button
              className={`mobile-tab ${mobileActiveTab === 'fincas' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('fincas')}
            >
              <FaMap /> Fincas
            </button>
            {/* <button
              className={`mobile-tab ${mobileActiveTab === 'calor' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('calor')}
            >
              <FaFire /> Calor
            </button>*/}
          </div>

          {/* Contenido de tabs */}
          <div className="mobile-content">
            {mobileActiveTab === 'plagas' ? (
              <div className="mobile-plagas-content">
                {Object.entries(groupedPlagas).map(([nombre, subPlagas]) => (
                  <div key={nombre} className="mobile-plaga-group">
                    <div
                      className="mobile-group-header"
                      onClick={() => togglePlagaGroup(nombre)}
                    >
                      <span>{nombre}</span>
                      <FaChevronDown className={`mobile-chevron ${expandedGroups.includes(nombre) ? 'expanded' : ''}`} />
                    </div>

                    {expandedGroups.includes(nombre) && (
                      <div className="mobile-plaga-list">
                        {subPlagas.map(plaga => (
                          <div
                            key={plaga.id}
                            className={`mobile-plaga-item ${selectedPlagas.includes(plaga.id) ? 'selected' : ''}`}
                            onClick={() => togglePlagaSelection(plaga)}
                          >
                            <div
                              className="mobile-color-badge"
                              style={{ backgroundColor: markerStyles[plaga.id]?.color || '#FF0000' }}
                            />
                            <span>{plaga.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              //seccion de reportes
              <div className="mobile-reportes-content">
                {coordinates.map(coord => (
                  <div
                    key={coord.id}
                    className="mobile-reporte-item"
                    onClick={() => handleCoordinateClick(coord)}
                  >
                    <div
                      className="mobile-reporter-marker"
                      style={{ backgroundColor: markerStyles[coord.plagaId]?.color || '#FF0000' }}
                    >
                      <FaBug />
                    </div>
                    <div className="mobile-reporte-info">
                      <div className="mobile-reporte-name">
                        {plagas.find(p => p.id === coord.plagaId)?.nombre}
                      </div>
                      <div className="mobile-reporte-date">
                        <FaInfoCircle /> {coord.fecha}
                      </div>
                    </div>
                  </div>
                ))}
                {mobileActiveTab === 'fincas' && (
                  <div className="mobile-fincas-content">
                    {/* Botones globales para todos los polígonos */}
                    <button
                      className="mobile-show-polygon-btn"
                      onClick={() => {
                        console.log("🟢 Click detectado en botón móvil: mostrar polígonos");
                        handleToggleAllPolygons(); // igual que en PC
                      }}
                    >
                      <FaDrawPolygon /> Mostrar polígonos
                    </button>

                    <button
                      onClick={() => {
                        console.log("🔴 Click detectado en botón móvil: ocultar polígonos");
                        handleRemoveAllPolygons(); // igual que en PC
                      }}
                    >
                      Ocultar polígonos
                    </button>
                  </div>
                )}

                {mobileActiveTab === 'calor' && (
                  <div className="mobile-heatmap-content">
                    <div className="heatmap-controls">
                      <label className="heatmap-toggle">
                        <input
                          type="checkbox"
                          checked={showHeatmap}
                          onChange={() => setShowHeatmap(!showHeatmap)}
                        />
                        <span>Mostrar mapa de calor</span>
                      </label>

                      {showHeatmap && (
                        <>
                          <div className="heatmap-slider">
                            <label>Radio: {heatmapRadius}px</label>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={heatmapRadius}
                              onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                            />
                          </div>

                          <div className="heatmap-slider">
                            <label>Intensidad: {heatmapIntensity.toFixed(1)}</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={heatmapIntensity}
                              onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                            />
                          </div>

                          <div className="heatmap-plagas-list">
                            <h4>Plagas en mapa de calor</h4>
                            {Object.entries(markerStyles)
                              .filter(([_, style]) => style.heatmapEnabled)
                              .map(([plagaId, style]) => (
                                <div key={plagaId} className="heatmap-plaga-item">
                                  <div className="heatmap-plaga-header">
                                    <div
                                      className="color-badge"
                                      style={{ backgroundColor: style.color }}
                                    />
                                    <span>{plagas.find(p => p.id === plagaId)?.nombre || plagaId}</span>
                                    <button
                                      onClick={() => handleMarkerStyleChange(plagaId, 'heatmapEnabled', !style.heatmapEnabled)}
                                      className="heatmap-toggle-btn"
                                    >
                                      {style.heatmapEnabled ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                  </div>

                                  {style.heatmapEnabled && (
                                    <div className="heatmap-plaga-controls">
                                      <div className="heatmap-slider">
                                        <label>Opacidad:</label>
                                        <input
                                          type="range"
                                          min="0.1"
                                          max="1"
                                          step="0.1"
                                          value={style.heatmapOpacity || 0.7}
                                          onChange={(e) => handleMarkerStyleChange(
                                            plagaId,
                                            'heatmapOpacity',
                                            parseFloat(e.target.value)
                                          )}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            )}

          </div>
        </div>


      </div >
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${mobileActiveTab === 'plagas' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('plagas')}
        >
          <FaBug /> Plagas
        </button>
        <button
          className={`mobile-tab ${mobileActiveTab === 'reportes' ? 'active' : ''}`}
          onClick={() => setMobileActiveTab('reportes')}
        >
          <FaMapMarkedAlt /> Reportes
        </button>

      </div>
      <div className="mobile-content">
        {mobileActiveTab === 'plagas' ? (
          <div className="mobile-plagas-content">
            {/* ... contenido existente de plagas ... */}
          </div>
        ) : mobileActiveTab === 'reportes' ? (
          <div className="mobile-reportes-content">
            {/* ... contenido existente de reportes ... */}
          </div>
        ) : (
          <div className="mobile-heatmap-content">
            <div className="mobile-heatmap-global-controls">
              <label className="mobile-toggle-heatmap">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={() => setShowHeatmap(!showHeatmap)}
                />
                <span>Activar Mapa de Calor</span>
              </label>

              {showHeatmap && (
                <>
                  <div className="mobile-heatmap-slider">
                    <label>Radio base: {heatmapRadius}px</label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={heatmapRadius}
                      onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="mobile-heatmap-slider">
                    <label>Intensidad: {heatmapIntensity.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={heatmapIntensity}
                      onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="mobile-heatmap-plagas-list">
                    <h4>Plagas en mapa de calor</h4>
                    {Object.entries(markerStyles)
                      .filter(([_, style]) => style.heatmapEnabled)
                      .map(([plagaId, style]) => (
                        <div key={plagaId} className="mobile-heatmap-plaga-item">
                          <div className="mobile-heatmap-plaga-header">
                            <div
                              className="mobile-color-badge"
                              style={{ backgroundColor: style.color }}
                            />
                            <span>{plagas.find(p => p.id === plagaId)?.nombre || plagaId}</span>
                            <button
                              onClick={() => handleMarkerStyleChange(plagaId, 'heatmapEnabled', !style.heatmapEnabled)}
                              className="mobile-heatmap-toggle"
                            >
                              {style.heatmapEnabled ? <FaEye /> : <FaEyeSlash />}
                            </button>
                          </div>

                          {style.heatmapEnabled && (
                            <div className="mobile-heatmap-plaga-controls">
                              <div className="mobile-heatmap-slider">
                                <label>Opacidad:</label>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.1"
                                  value={style.heatmapOpacity || 0.7}
                                  onChange={(e) => handleMarkerStyleChange(
                                    plagaId,
                                    'heatmapOpacity',
                                    parseFloat(e.target.value)
                                  )}
                                />
                              </div>

                              <div className="mobile-heatmap-slider">
                                <label>Radio:</label>
                                <input
                                  type="range"
                                  min="5"
                                  max="30"
                                  value={style.heatmapRadius || 20}
                                  onChange={(e) => handleMarkerStyleChange(
                                    plagaId,
                                    'heatmapRadius',
                                    parseInt(e.target.value)
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <button
                    className="mobile-heatmap-button"
                    onClick={updateAllHeatmaps}
                  >
                    <FaSync /> Actualizar todos los mapas
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarMapas;