import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    FiMap, FiSearch, FiPlus, FiChevronDown, FiX, FiInfo,
    FiMapPin, FiFilter, FiMinimize2, FiMaximize2
} from 'react-icons/fi';
import { FaBug } from 'react-icons/fa';
import './menuLateral.css';
import PestFilterContext from './PestFilterContext';

const menuLateral = ({ collapsed, setCollapsed, onFilterChange, onMarkerClick, setSelectedPlagaId, selectedPlagaId }) => {
    // [Mantén todos tus hooks de estado y efectos iguales...]

    // Cambia solo la parte del return:
    return (
        <div className={`modern-sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Botón de toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <FiMaximize2 /> : <FiMinimize2 />}
            </button>

            {!collapsed && (
                <div className="sidebar-content">
                    {/* Header */}
                    <div className="sidebar-header">
                        <FiMap className="sidebar-icon" />
                        <h3>Herramientas de Mapa</h3>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="search-container">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar plaga..."
                            className="search-input"
                        />
                    </div>

                    {/* Panel de información (solo visible cuando hay selección) */}
                    {selectedCoordinate && (
                        <div className="info-panel">
                            <div className="info-header">
                                <h4>
                                    <FaBug style={{ color: markerStyles[selectedCoordinate.plagaId]?.color || '#FF0000' }} />
                                    Detalles
                                </h4>
                                <button onClick={() => setSelectedCoordinate(null)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="info-content">
                                <p><strong>Plaga:</strong> {plagas.find(p => p.id === selectedCoordinate.plagaId)?.nombre}</p>
                                <p><FiMapPin /> {selectedCoordinate.lat}, {selectedCoordinate.lng}</p>
                                <p><FiInfo /> {selectedCoordinate.descripcion}</p>
                            </div>
                        </div>
                    )}

                    {/* Sección de Filtros */}
                    <div className="filter-section">
                        <div
                            className="section-header"
                            onClick={() => toggleSection('plagas')}
                        >
                            <FiFilter />
                            <span>Filtrar Plagas</span>
                            <FiChevronDown className={`chevron ${expandedSection === 'plagas' ? 'expanded' : ''}`} />
                        </div>

                        {expandedSection === 'plagas' && (
                            <div className="filter-options">
                                {Object.entries(groupedPlagas).map(([nombre, subPlagas]) => (
                                    <div key={nombre} className="plaga-group">
                                        <div
                                            className="group-header"
                                            onClick={() => togglePlagaGroup(nombre)}
                                        >
                                            <span>{nombre}</span>
                                            <FiChevronDown className={`chevron ${expandedGroups.includes(nombre) ? 'expanded' : ''}`} />
                                        </div>

                                        {expandedGroups.includes(nombre) && (
                                            <div className="plaga-list">
                                                {subPlagas.map(plaga => (
                                                    <div
                                                        key={plaga.id}
                                                        className={`plaga-item ${selectedPlagas.includes(plaga.id) ? 'selected' : ''}`}
                                                        onClick={() => togglePlagaSelection(plaga)}
                                                    >
                                                        <div className="plaga-color"
                                                            style={{ backgroundColor: markerStyles[plaga.id]?.color || '#FF0000' }} />
                                                        <span className="plaga-name">{plaga.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reportes recientes */}
                    <div className="reports-section">
                        <div
                            className="section-header"
                            onClick={() => toggleSection('coordenadas')}
                        >
                            <FiMapPin />
                            <span>Reportes Recientes</span>
                            <FiChevronDown className={`chevron ${expandedSection === 'coordenadas' ? 'expanded' : ''}`} />
                        </div>

                        {expandedSection === 'coordenadas' && (
                            <div className="reports-list">
                                {coordinates.map(coord => (
                                    <div
                                        key={coord.id}
                                        className="report-item"
                                        onClick={() => handleCoordinateClick(coord)}
                                    >
                                        <div
                                            className="report-marker"
                                            style={{ backgroundColor: markerStyles[coord.plagaId]?.color || '#FF0000' }}
                                        />
                                        <div className="report-details">
                                            <div className="report-title">
                                                {plagas.find(p => p.id === coord.plagaId)?.nombre}
                                            </div>
                                            <div className="report-date">{coord.fecha}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default menuLateral;