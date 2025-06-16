import React, { useState, useCallback, useRef, useEffect, useContext, useMemo } from 'react';
import { FaMap, FaSearch, FaPlus, FaLayerGroup, FaChevronDown, FaBug, FaTimes, FaInfoCircle, FaMapMarkedAlt } from 'react-icons/fa';
import './sidebarMapas.css';
import PestFilterContext from './PestFilterContext';
import { Navigate, useNavigate } from 'react-router-dom';

const SidebarMapas = ({ collapsed, setCollapsed, onFilterChange, onMarkerClick, setSelectedPlagaId, selectedPlagaId }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

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
    if (!isMounted) return;
    setCollapsed(prev => !prev);
  }, [isMounted, setCollapsed]);

  const sidebarRef = useRef(null);
  return (
    <>
      {collapsed && (
        <button
          className="sidebar-toggle-collapsed"
          onClick={handleToggle}
        >
          ➡️
        </button>
      )}
      {isMounted && (
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
            <button onClick={handleToggle}>
              {collapsed ? '➡️' : '⬅️'}
            </button>
          </div>


          <div className="search-bar">
            <FaSearch className="search-icon" />
            {!collapsed && (
              <input type="text" placeholder="Buscar plaga o ubicación..." />
            )}
          </div>

          <button className="new-map-btn">
            <FaPlus className="btn-icon" />
            {!collapsed && "Nuevo Reporte"}
          </button>


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

          {/* Sección de Coordenadas */}
          <div className="sidebar-section">
            <div className="section-header" onClick={() => toggleSection('coordenadas')}>
              <FaMapMarkedAlt className="section-icon" />
              <span>Reportes Recientes</span>
              <FaChevronDown className={`chevron ${expandedSection === 'coordenadas' ? 'expanded' : ''}`} />
            </div>
            {expandedSection === 'coordenadas' && (
              <div className="section-content">
                {coordinates.map(coord => (
                  <div
                    key={coord.id}
                    className="coordinate-item"
                    onClick={() => handleCoordinateClick(coord)}
                  >
                    <div className="coordinate-marker" style={{
                      backgroundColor: markerStyles[coord.plagaId]?.color || '#FF0000'
                    }}>
                      <FaBug />
                    </div>
                    <div className="coordinate-info">
                      <div className="coordinate-plaga">
                        {plagas.find(p => p.id === coord.plagaId)?.nombre}
                      </div>
                      <div className="coordinate-desc">
                        {coord.descripcion.substring(0, 30)}...
                      </div>
                      <div className="coordinate-date">
                        <FaInfoCircle /> {coord.fecha}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div >
      )}
    </>
  );
};

export default SidebarMapas;