import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PestFilterContext from './PestFilterContext.jsx';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io'; // Añade IoIosArrowBack
import { FaBug, FaSearch, FaFilter, FaPlus, FaChartPie, FaTable, FaMapMarkerAlt, FaBook } from 'react-icons/fa';
import './plagasView.css';
import gusanoCogollero from './iconos/acaro.jpg';
import Diptero from './iconos/Diptero.jpg';
import Trips from './iconos/trips.jpg';
import Cochinilla from './iconos/cochinilla.jpg';
import Pulgones from './iconos/plagaPulgones.png';
import Anastrepha from './iconos/Anastrepha.jpg';
import ArañaRoja from './iconos/Araña-roja.jpg';
import Chinche from './iconos/chinche.jpg';
import Chiza from './iconos/chiza.jpg';
import Comejen from './iconos/comejen.jpg';


const PlagasView = ({ pest }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [activeFilter, setActiveFilter] = useState('all');
    const [plagaSeleccionada, setPlagaSeleccionada] = useState(null);
    const { setSelectedPest } = useContext(PestFilterContext);
    const [descripcionWikipedia, setDescripcionWikipedia] = useState("");
    const [loadingWiki, setLoadingWiki] = useState(false);
    const [errorWiki, setErrorWiki] = useState(null);
    const [datosWikidata, setDatosWikidata] = useState(null);



    const navigate = useNavigate();

    const handleMostrarDetalles = async (pest) => {
        setPlagaSeleccionada(pest);
        setLoadingWiki(true);
        setErrorWiki(null);

        await obtenerDescripcion(pest.scientificName.trim());

        setLoadingWiki(false);
    };
    const handleVolver = () => {
        setPlagaSeleccionada(null);
    };
    // Si recibes todo el objeto plaga (pest)
    const handleViewOnMap = (pestId) => {
        navigate('/mapa', {
            state: {
                pestId
            }
        });

    };
    // Datos de ejemplo para plagas
    const pests = [
        {
            id: 1,
            name: "Acaro",
            scientificName: "Acari",
            threatLevel: "Alto",
            affectedCrops: ["Limon"],
            image: gusanoCogollero,
            lastDetection: "Hace 3 días",
            colorName: "Rojo",
            status: "activa"
        },
        {
            id: 2,
            name: "Diptero",
            scientificName: "Diptera",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Diptero,
            lastDetection: "Hace 1 semana",
            colorName: "Amarillo",
            status: "activa"
        },
        {
            id: 3,
            name: "Trips",
            scientificName: "Thysanoptera",
            threatLevel: "Bajo",
            affectedCrops: ["Limon"],
            image: Trips,
            lastDetection: "Hace 2 semanas",
            colorName: "Azul",
            status: "controlada"
        },
        {
            id: 4,
            name: "Cochinilla",
            scientificName: "Dactylopius coccus",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Cochinilla,
            lastDetection: "Hace 5 días",
            status: "activa"
        },
        {
            id: 5,
            name: "Afido (Pulgones)",
            scientificName: "Aphidoidea",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Pulgones,
            lastDetection: "Hace 5 días",
            status: "activa"
        },
        {
            id: 6,
            name: "Mosca de la fruta",
            scientificName: "Anastrepha",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Anastrepha,
            lastDetection: "Hace 5 días",
            status: "activa"
        },
        {
            id: 8,
            name: "Chinche",
            scientificName: "Tetranychus urticae",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Chinche,
            lastDetection: "Hace 5 días",
            status: "activa"
        },
        {
            id: 9,
            name: "Chiza",
            scientificName: " Phyllophaga",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Chiza,
            lastDetection: "Hace 5 días",
            status: "controlada"
        },
        {
            id: 10,
            name: "Comejen",
            scientificName: " Isoptera",
            threatLevel: "Medio",
            affectedCrops: ["Limon"],
            image: Comejen,
            lastDetection: "Hace 5 días",
            status: "controlada"
        },

    ];

    const filteredPests = activeFilter === 'all'
        ? pests
        : pests.filter(pest => pest.status === activeFilter);
    //
    async function obtenerDescripcion(nombre) {
        try {
            const res = await fetch(`http://localhost:8080/api/wikipedia-descripcion?nombre=${encodeURIComponent(nombre)}`);
            if (!res.ok) throw new Error("Error al obtener descripción");
            const descripcion = await res.text(); // si devuelves texto plano
            console.log("Descripción:", descripcion);
            // Usa la descripción en el estado o en UI
        } catch (error) {
            console.error(error);
        }
    }
    // dentro de un useEffect o función async
    useEffect(() => {
        const fetchTaxonomia = async () => {
            if (!pest?.scientificName) return;

            const nombreLimpio = pest.scientificName.trim();

            setLoadingWiki(true);
            setErrorWiki(null);

            try {
                const response = await fetch(`http://localhost:8080/api/wikipedia-descripcion?nombre=${encodeURIComponent(nombreLimpio)}`);
                if (!response.ok) throw new Error("Error al obtener taxonomía");

                const data = await response.text(); // <--- aquí
                setDescripcionWikipedia(data);
            } catch (error) {
                setErrorWiki(error.message);
            } finally {
                setLoadingWiki(false);
            }
        };

        fetchTaxonomia();
    }, [pest?.scientificName]);





    return (
        <>
            {/* Contenedor principal */}
            <div className="plagas-container">
                {/* Header de la sección */}
                <div className="plagas-header">
                    <h1 className="plagas-title">
                        <FaBug className="title-icon" />
                        Gestión de Plagas
                    </h1>

                    <div className="plagas-actions">
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar plaga, cultivo..."
                                className="search-input"
                            />
                        </div>

                        <button className="btn-primary">
                            <FaPlus className="btn-icon" />
                            Nueva detección
                        </button>
                    </div>
                </div>

                {/* Filtros y controles de vista */}
                <div className="plagas-controls">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            Todas
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'activa' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('activa')}
                        >
                            Activas
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'controlada' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('controlada')}
                        >
                            Controladas
                        </button>
                    </div>

                    <div className="view-options">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="Vista de cuadrícula"
                        >
                            <FaTable />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="Vista de lista"
                        >
                            <FaChartPie />
                        </button>
                    </div>
                </div>

                {/* Contenido principal */}
                {viewMode === 'grid' ? (
                    <div className="plagas-grid">
                        {filteredPests.map(pest => (
                            <div key={pest.id} className="pest-card">
                                <div className="pest-image-container">
                                    <img
                                        src={pest.image}
                                        alt={pest.name}
                                        className={`pest-image ${pest.name === 'Chiza' ? 'chiza-image' : ''}`}
                                    />
                                    <span className={`threat-level ${pest.threatLevel.toLowerCase()}`}>
                                        {pest.threatLevel}
                                    </span>
                                </div>

                                <div className="pest-info">
                                    <h3 className="pest-name">{pest.name}</h3>
                                    <p className="pest-scientific">{pest.scientificName}</p>

                                    <div className="pest-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Cultivos:</span>
                                            <span className="detail-value">{pest.affectedCrops.join(', ')}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Última detección:</span>
                                            <span className="detail-value">{pest.lastDetection}</span>
                                        </div>
                                    </div>
                                    <div className='detail-item'>
                                        <span className="detail-label">color en mapa:</span>
                                        <span className="detail-value">{pest.colorName}</span>
                                    </div>
                                    <div className="pest-actions">
                                        <button className="btn-outline" onClick={() => handleViewOnMap(pest.id)}>
                                            <FaMapMarkerAlt className="btn-icon" />
                                            Ver en mapa
                                        </button>
                                        <button
                                            className="btn-text"
                                            onClick={() => handleMostrarDetalles(pest)}
                                        >
                                            Más detalles <IoIosArrowForward />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="plagas-list">
                        <div className="list-header">
                            <span className="header-item">Plaga</span>
                            <span className="header-item">Nivel de amenaza</span>
                            <span className="header-item">Cultivos afectados</span>
                            <span className="header-item">Última detección</span>
                            <span className="header-item">Acciones</span>
                        </div>

                        {filteredPests.map(pest => (
                            <div key={pest.id} className="list-row">
                                <div className="list-cell pest-name-cell">
                                    <img
                                        src={pest.image}
                                        alt={pest.name}
                                        className="list-pest-image"
                                    />
                                    <div>
                                        <h4>{pest.name}</h4>
                                        <p className="scientific-name">{pest.scientificName}</p>
                                    </div>
                                </div>

                                <div className="list-cell">
                                    <span className={`threat-badge ${pest.threatLevel.toLowerCase()}`}>
                                        {pest.threatLevel}
                                    </span>
                                </div>

                                <div className="list-cell affected-crops">
                                    {pest.affectedCrops.join(', ')}
                                </div>

                                <div className="list-cell last-detection">
                                    {pest.lastDetection}
                                </div>

                                <div className="list-cell actions-cell">
                                    <button
                                        className="icon-btn"
                                        title="Ver en mapa"
                                        onClick={() => handleViewOnMap(pest.id)}
                                    >
                                        <FaMapMarkerAlt />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        title="Más detalles"
                                        onClick={() => handleMostrarDetalles(pest)}
                                    >
                                        <IoIosArrowForward />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Estadísticas rápidas */}
                <div className="quick-stats">
                    <div className="stat-card">
                        <h4>Plagas activas</h4>
                        <p className="stat-value">12</p>
                        <p className="stat-change positive">+2 esta semana</p>
                    </div>

                    <div className="stat-card">
                        <h4>Detecciones recientes</h4>
                        <p className="stat-value">5</p>
                        <p className="stat-change negative">-3 vs semana pasada</p>
                    </div>

                    <div className="stat-card">
                        <h4>Cultivos afectados</h4>
                        <p className="stat-value">8</p>
                        <p className="stat-change neutral">Sin cambios</p>
                    </div>
                </div>
            </div>

            {/* Overlay de detalles (fuera del contenedor principal) */}
            {plagaSeleccionada && (
                <div className="detalles-overlay">
                    <div className="detalles-contenido">
                        <button onClick={handleVolver} className="back-button">
                            <IoIosArrowBack /> Volver
                        </button>

                        {/* Encabezado científico */}
                        <div className="detalles-header">
                            <img
                                src={plagaSeleccionada.image}
                                alt={plagaSeleccionada.name}
                                className="detalles-imagen"
                            />
                            <div>
                                <h1>{plagaSeleccionada.name}</h1>

                                {datosWikidata && datosWikidata.taxonomia ? (
                                    <p className="taxonomia">
                                        <span className="taxonomia-item"><strong>Reino:</strong> {datosWikidata.taxonomia.reino || "N/A"}</span>
                                        <span className="taxonomia-item"><strong>Filo:</strong> {datosWikidata.taxonomia.filo || "N/A"}</span>
                                        <span className="taxonomia-item"><strong>Clase:</strong> {datosWikidata.taxonomia.clase || "N/A"}</span>
                                        <span className="taxonomia-item"><strong>Orden:</strong> {datosWikidata.taxonomia.orden || "N/A"}</span>
                                        <span className="taxonomia-item"><strong>Familia:</strong> {datosWikidata.taxonomia.familia || "N/A"}</span>
                                        <span className="taxonomia-item"><strong>Género:</strong> <i>{plagaSeleccionada.scientificName || "N/A"}</i></span>
                                    </p>
                                ) : (
                                    <p className="taxonomia">Cargando información taxonómica...</p>
                                )}

                                <div className="meta-tags">
                                    <span className={`threat-badge ${plagaSeleccionada.threatLevel.toLowerCase()}`}>
                                        Nivel de amenaza: {plagaSeleccionada.threatLevel}
                                    </span>
                                    <span className={`status ${plagaSeleccionada.status}`}>
                                        Estado actual: {plagaSeleccionada.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Descripción científica */}
                        <div className="seccion">
                            <h2>📋 Descripción biológica</h2>
                            <div className="descripcion-cientifica">
                                {loadingWiki ? (
                                    <p>Cargando descripción desde Wikipedia...</p>
                                ) : errorWiki ? (
                                    <p className="error">{errorWiki}</p>
                                ) : (
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>{descripcionWikipedia}</pre>
                                )}
                            </div>
                        </div>

                        {/* Ciclo biológico */}
                        <div className="seccion">
                            <h2>🔄 Ciclo biológico</h2>
                            <div className="ciclo-biologico">
                                <ul>
                                    <li><strong>Huevo:</strong> 8-10 días de incubación</li>
                                    <li><strong>Larva:</strong> 3 estadios larvales (20-30 días cada uno)</li>
                                    <li><strong>Pupa:</strong> 7-10 días en suelo húmedo</li>
                                    <li><strong>Adulto:</strong> Vive 2-3 meses, con alta capacidad reproductiva</li>
                                </ul>
                                <p className="nota">Ciclo completo: 3-4 generaciones anuales en climas tropicales</p>
                            </div>
                        </div>

                        {/* Síntomas y daños */}
                        <div className="seccion">
                            <h2>⚠️ Síntomas y daños</h2>
                            <div className="sintomas-grid">
                                <div className="sintoma-card">
                                    <div className="sintoma-icono">🍂</div>
                                    <h4>Amarillamiento foliar</h4>
                                    <p>Clorosis progresiva debido al daño radical</p>
                                </div>
                                <div className="sintoma-card">
                                    <div className="sintoma-icono">🪴</div>
                                    <h4>Daño radical</h4>
                                    <p>Raíces secundarias cortadas, principal con heridas</p>
                                </div>
                                <div className="sintoma-card">
                                    <div className="sintoma-icono">📉</div>
                                    <h4>Retraso crecimiento</h4>
                                    <p>Reducción del 40-60% en desarrollo vegetativo</p>
                                </div>
                            </div>
                        </div>

                        {/* Manejo integrado */}
                        <div className="seccion">
                            <h2>🛡️ Manejo integrado</h2>

                            <h3>Control biológico</h3>
                            <ul className="control-lista">
                                <li>
                                    <strong>Nematodos entomopatógenos:</strong> <i>Heterorhabditis bacteriophora</i> (250-500 nematodos/cm²)
                                </li>
                                <li>
                                    <strong>Hongos:</strong> <i>Beauveria bassiana</i> cepa GHA (2×10⁸ conidias/ml)
                                </li>
                                <li>
                                    <strong>Depredadores naturales:</strong> Avispas <i>Tiphia spp.</i> y pájaros insectívoros
                                </li>
                            </ul>

                            <h3>Control químico</h3>
                            <table className="quimicos-table">
                                <thead>
                                    <tr>
                                        <th>Principio activo</th>
                                        <th>Dosis</th>
                                        <th>Periodo carencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Imidacloprid 35%</td>
                                        <td>0.3-0.5 ml/L</td>
                                        <td>21 días</td>
                                    </tr>
                                    <tr>
                                        <td>Clorpirifos 48%</td>
                                        <td>2.5-3 L/ha</td>
                                        <td>30 días</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3>Prácticas culturales</h3>
                            <ul className="practicas-lista">
                                <li>Solarización del suelo (cubierta plástica 6 semanas)</li>
                                <li>Rotación con cultivos no hospederos (maíz, sorgo)</li>
                                <li>Monitoreo con trampas de luz (20 trampas/ha)</li>
                            </ul>
                        </div>

                        {/* Datos técnicos */}
                        <div className="seccion datos-tecnicos">
                            <h2>📊 Datos técnicos</h2>
                            <table className="tabla-datos">
                                <tbody>
                                    <tr>
                                        <td><strong>🌡️ Temperatura óptima</strong></td>
                                        <td>22-28°C (desarrollo larval)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>💧 Humedad suelo</strong></td>
                                        <td>60-80% capacidad campo</td>
                                    </tr>
                                    <tr>
                                        <td><strong>📅 Época crítica</strong></td>
                                        <td>Mayo-Septiembre (lluvias)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>🔬 Umbral económico</strong></td>
                                        <td>5 larvas/m² en cultivos jóvenes</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Referencias */}
                        <div className="seccion referencias">
                            <h2>📚 Referencias</h2>
                            <ol className="referencias-lista">
                                <li>ICA, 2022. Manual de plagas agrícolas de Colombia</li>
                                <li>Journal of Economic Entomology, 115(2): 432-441</li>
                            </ol>
                        </div>

                        {/* Acciones */}
                        <div className="acciones">
                            <button
                                onClick={() => handleViewOnMap(plagaSeleccionada.id)}
                                className="btn-primary"
                            >
                                <FaMapMarkerAlt /> Ver en mapa
                            </button>
                            <button className="btn-outline">
                                <FaBook /> Descargar ficha técnica
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default PlagasView;