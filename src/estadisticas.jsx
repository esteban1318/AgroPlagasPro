import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './estadisticas.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LemonStatsDashboard = () => {
  // Datos de plagas específicas para cultivo de limón
  const plagas = useMemo(() => [
    { id: 'ACARO_1', nombre: "Ácaro" },
    { id: 'ACARO_2', nombre: "Ácaro de la roya" },
    { id: 'ACARO_3', nombre: "Ácaro blanco" },
    { id: 'ACARO_4', nombre: "Ácaro rojo" },
    { id: 'ANASTREPHA_1', nombre: 'Anastrepha' },
    { id: 'ARANA_1', nombre: 'Araña roja' },
    { id: 'AFIDOS_1', nombre: "Pulgones" },
    { id: 'CHINCHE_1', nombre: 'Chinche común' },
    { id: 'CHIZAS_1', nombre: 'Chizas' },
    { id: 'COCHINILLA_1', nombre: 'Cochinilla' },
    { id: 'COMEJEN_1', nombre: 'Comején' },
    { id: 'DIAPHORINA_1', nombre: "Diaphorina" },
    { id: 'DIPTERO_1', nombre: "Díptero" },
    { id: 'ESCAMA_1', nombre: 'Escama de fruto' },
    { id: 'ESCAMA_2', nombre: 'Escama de ramas' },
    { id: 'FALSO_1', nombre: 'Falso medidor' },
    { id: 'GENERAL_1', nombre: 'General' },
    { id: 'GRILLOS_1', nombre: 'Grillos' },
    { id: 'GRILLOS_2', nombre: 'Grillos topo' },
    { id: 'HORMIGA_1', nombre: 'Hormiga arriera' },
    { id: 'HORTZIA_1', nombre: 'Hortzia' },
    { id: 'LEPIDOPTERO_1', nombre: 'Lepidóptero' },
    { id: 'MINADOR_1', nombre: 'Minador de hojas' },
    { id: 'MOSCA_1', nombre: 'Mosca Blanca' },
    { id: 'MOSCA_2', nombre: 'Mosca Cebra' },
    { id: 'MOSCA_3', nombre: 'Mosca Común' },
    { id: 'MOSCA_4', nombre: 'Mosca de la Fruta' },
    { id: 'MOSCA_5', nombre: 'Mosca del Mediterráneo' },
    { id: 'MOSCA_6', nombre: 'Mosca del Ovario' },
    { id: 'NEMATODOS_1', nombre: 'Nematodos' },
    { id: 'NINGUNO', nombre: 'Ninguno' },
    { id: 'OTROSGU_1', nombre: 'Otros Gusanos' },
    { id: 'PICUDO_1', nombre: 'Picudo (Compsus)' },
    { id: 'PIOJO_1', nombre: 'Piojo harinoso' },
    { id: 'POLILLA_1', nombre: 'Polilla' },
    { id: 'TRIHCHOGRAMMA_1', nombre: 'Trichogramma' },
    { id: 'TRIPS_1', nombre: 'Trips' }
  ], []);

  // Ubicaciones relacionadas con cultivo de limón
  const ubicaciones = useMemo(() => [
    { id: 'LOTE_A', nombre: 'Lote A (Norte)' },
    { id: 'LOTE_B', nombre: 'Lote B (Sur)' },
    { id: 'LOTE_C', nombre: 'Lote C (Este)' },
    { id: 'LOTE_D', nombre: 'Lote D (Oeste)' },
    { id: 'SURCO_1', nombre: 'Surco 1' },
    { id: 'SURCO_2', nombre: 'Surco 2' },
    { id: 'SURCO_3', nombre: 'Surco 3' },
    { id: 'SURCO_4', nombre: 'Surco 4' },
    { id: 'FINCA_1', nombre: 'Finca Principal' },
    { id: 'FINCA_2', nombre: 'Finca Secundaria' },
    { id: 'ZONA_ALTA', nombre: 'Zona Alta' },
    { id: 'ZONA_BAJA', nombre: 'Zona Baja' },
    { id: 'INVERNADERO', nombre: 'Invernadero' },
    { id: 'VIVERO', nombre: 'Vivero' }
  ], []);

  // Imágenes de fincas (simuladas)
  const fincasImagenes = useMemo(() => [
    { id: 1, nombre: 'Finca Principal - Vista Aérea', url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 2, nombre: 'Lote A - Zona Norte', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 3, nombre: 'Lote B - Zona Sur', url: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 4, nombre: 'Invernadero - Cultivo Protegido', url: 'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }
  ], []);

  // Generar datos de ejemplo para el cultivo de limón
  const initialPestData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const randomPlaga = plagas[Math.floor(Math.random() * plagas.length)];
      const randomUbicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];

      // Hacer más probables algunas plagas comunes en cítricos
      const commonPests = ['MINADOR_1', 'MOSCA_4', 'ACARO_1', 'AFIDOS_1', 'TRIPS_1'];
      const isCommon = Math.random() > 0.7;
      const plagaId = isCommon ? commonPests[Math.floor(Math.random() * commonPests.length)] : randomPlaga.id;
      const plagaNombre = plagas.find(p => p.id === plagaId)?.nombre || randomPlaga.nombre;

      data.push({
        id: i + 1,
        type: plagaNombre,
        typeId: plagaId,
        date: dateString,
        count: Math.floor(Math.random() * 50) + 1,
        severity: ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
        location: randomUbicacion.nombre,
        locationId: randomUbicacion.id,
        coordinates: {
          x: Math.random() * 80 + 10, // Para posicionamiento en imagen
          y: Math.random() * 80 + 10  // Para posicionamiento en imagen
        }
      });
    }

    return data;
  }, [plagas, ubicaciones]);

  const [pestData, setPestData] = useState(initialPestData);
  const [filteredData, setFilteredData] = useState(initialPestData);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedPestType, setSelectedPestType] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [selectedFinca, setSelectedFinca] = useState(fincasImagenes[0]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef(null);

  // Efecto para aplicar filtros
  useEffect(() => {
    let result = [...pestData];

    // Filtrar por rango de fechas
    result = result.filter(item =>
      item.date >= dateRange.start && item.date <= dateRange.end
    );

    // Filtrar por tipo de plaga
    if (selectedPestType !== "Todos") {
      result = result.filter(item => item.type === selectedPestType);
    }

    // Filtrar por ubicación
    if (selectedLocation !== "Todos") {
      result = result.filter(item => item.location === selectedLocation);
    }

    setFilteredData(result);
  }, [dateRange, selectedPestType, selectedLocation, pestData]);

  // Efecto para dibujar en el canvas cuando cambian los datos o la finca seleccionada
  useEffect(() => {
    if (canvasRef.current && showHeatmap) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = function () {
        // Ajustar el tamaño del canvas al de la imagen
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibujar la imagen de fondo
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Dibujar puntos de infestación
        filteredData.forEach(item => {
          const intensity = item.severity === 'Alta' ? 1 : item.severity === 'Media' ? 0.6 : 0.3;
          const radius = Math.max(5, Math.min(20, item.count / 2));

          // Coordenadas basadas en datos o aleatorias si no existen
          const x = item.coordinates ? (item.coordinates.x / 100) * img.width : Math.random() * img.width;
          const y = item.coordinates ? (item.coordinates.y / 100) * img.height : Math.random() * img.height;

          // Dibujar círculo de calor
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Dibujar borde
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Etiqueta con cantidad
          if (radius > 12) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.count.toString(), x, y);
          }
        });
      };

      img.src = selectedFinca.url;
    }
  }, [filteredData, selectedFinca, showHeatmap]);

  // Obtener tipos de plagas únicos
  const pestTypes = [...new Set(pestData.map(item => item.type))];

  // Calcular estadísticas
  const totalPests = filteredData.reduce((sum, item) => sum + item.count, 0);
  const mostCommonPest = filteredData.length > 0
    ? [...filteredData].sort((a, b) => b.count - a.count)[0].type
    : "N/A";

  const averageSeverity = filteredData.length > 0
    ? (filteredData.filter(item => item.severity === "Alta").length / filteredData.length * 100).toFixed(2)
    : "0";

  const affectedLocations = [...new Set(filteredData.map(item => item.location))].length;

  // Preparar datos para gráficos
  const dates = [...new Set(filteredData.map(item => item.date))].sort();

  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Detecciones por día',
        data: dates.map(date =>
          filteredData
            .filter(item => item.date === date)
            .reduce((sum, item) => sum + item.count, 0)
        ),
        borderColor: 'rgb(46, 204, 113)',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  // Preparar datos para el gráfico de plagas más comunes (top 7)
  const pestCounts = pestTypes.map(type => ({
    type,
    count: filteredData
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.count, 0)
  })).sort((a, b) => b.count - a.count).slice(0, 7);

  const barChartData = {
    labels: pestCounts.map(p => p.type),
    datasets: [
      {
        label: 'Total por tipo de plaga',
        data: pestCounts.map(p => p.count),
        backgroundColor: [
          'rgba(241, 196, 15, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(230, 126, 34, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(149, 165, 166, 0.8)'
        ],
        borderColor: [
          'rgb(241, 196, 15)',
          'rgb(52, 152, 219)',
          'rgb(46, 204, 113)',
          'rgb(155, 89, 182)',
          'rgb(230, 126, 34)',
          'rgb(231, 76, 60)',
          'rgb(149, 165, 166)'
        ],
        borderWidth: 1
      }
    ]
  };

  const severityData = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [
      {
        label: 'Detecciones por severidad',
        data: [
          filteredData.filter(item => item.severity === "Alta").length,
          filteredData.filter(item => item.severity === "Media").length,
          filteredData.filter(item => item.severity === "Baja").length
        ],
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(46, 204, 113, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Datos para gráfico de ubicaciones
  const locationCounts = ubicaciones.map(loc => ({
    location: loc.nombre,
    count: filteredData
      .filter(item => item.location === loc.nombre)
      .reduce((sum, item) => sum + item.count, 0)
  })).filter(loc => loc.count > 0);

  const locationChartData = {
    labels: locationCounts.map(l => l.location),
    datasets: [
      {
        label: 'Detecciones por ubicación',
        data: locationCounts.map(l => l.count),
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgb(52, 152, 219)',
        borderWidth: 1
      }
    ]
  };

  // Opciones para los gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estadísticas de Plagas en Limonero'
      }
    }
  };

  return (
    <div className="lemon-stats-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1><i className="fas fa-lemon"></i> Panel de Control de Plagas - Cultivo de Limón</h1>
          <p>Monitoreo y análisis de plagas en tiempo real</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <i className="fas fa-download"></i> Exportar Reporte
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="filters-section card">
        <h2><i className="fas fa-filter"></i> Filtros</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label>Rango de Fechas:</label>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span>a</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Tipo de Plaga:</label>
            <select
              value={selectedPestType}
              onChange={e => setSelectedPestType(e.target.value)}
            >
              <option value="Todos">Todas las plagas</option>
              {pestTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ubicación:</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="Todos">Todas las ubicaciones</option>
              {ubicaciones.map(location => (
                <option key={location.id} value={location.nombre}>{location.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Acciones rápidas:</label>
            <div className="quick-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  const end = new Date().toISOString().split('T')[0];
                  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setDateRange({ start, end });
                }}
              >
                Última semana
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  const end = new Date().toISOString().split('T')[0];
                  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setDateRange({ start, end });
                }}
              >
                Último mes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="stats-summary">
        <h2><i className="fas fa-chart-line"></i> Resumen Estadístico</h2>
        <div className="stats-cards">
          <div className="stat-card card">
            <div className="stat-icon total">
              <i className="fas fa-bug"></i>
            </div>
            <div className="stat-content">
              <h3>Total de Plagas Detectadas</h3>
              <p className="stat-number">{totalPests}</p>
              <p className="stat-trend">
                <i className="fas fa-arrow-up"></i> 12% vs período anterior
              </p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon common">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <h3>Plaga Más Común</h3>
              <p className="stat-text">{mostCommonPest}</p>
              <p className="stat-subtext">
                {filteredData.filter(item => item.type === mostCommonPest).length} detecciones
              </p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon severity">
              <i className="fas fa-skull-crossbones"></i>
            </div>
            <div className="stat-content">
              <h3>Severidad Alta</h3>
              <p className="stat-number">{averageSeverity}%</p>
              <p className="stat-subtext">de las detecciones</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon trend">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <div className="stat-content">
              <h3>Ubicaciones Afectadas</h3>
              <p className="stat-number">{affectedLocations}</p>
              <p className="stat-subtext">de {ubicaciones.length} totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualización de Fincas con Drone */}
      <div className="fincas-section card">
        <h2><i className="fas fa-drone"></i> Visualización de Fincas con Drone</h2>
        <div className="fincas-controls">
          <div className="finca-selector">
            <label>Seleccionar Finca:</label>
            <select
              value={selectedFinca.id}
              onChange={e => setSelectedFinca(fincasImagenes.find(f => f.id === parseInt(e.target.value)))}
            >
              {fincasImagenes.map(finca => (
                <option key={finca.id} value={finca.id}>{finca.nombre}</option>
              ))}
            </select>
          </div>
          <div className="visualization-controls">
            <button
              className={`btn ${showHeatmap ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <i className="fas fa-fire"></i> {showHeatmap ? 'Ocultar' : 'Mostrar'} Mapa de Calor
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setDrawingMode(!drawingMode)}
            >
              <i className="fas fa-pencil-alt"></i> {drawingMode ? 'Desactivar' : 'Activar'} Dibujo
            </button>
          </div>
        </div>
        <div className="finca-visualization">
          <div className="image-container">
            <img src={selectedFinca.url} alt={selectedFinca.nombre} className="finca-image" />
            <canvas
              ref={canvasRef}
              className="heatmap-canvas"
              style={{ display: showHeatmap ? 'block' : 'none' }}
            />
            {drawingMode && (
              <div className="drawing-tools">
                <button className="btn btn-sm">
                  <i className="fas fa-dot-circle"></i> Marcar Zona
                </button>
                <button className="btn btn-sm">
                  <i className="fas fa-vector-square"></i> Delimitar Área
                </button>
                <button className="btn btn-sm">
                  <i className="fas fa-sticky-note"></i> Agregar Nota
                </button>
              </div>
            )}
          </div>
          <div className="finca-info">
            <h3>{selectedFinca.nombre}</h3>
            <div className="finca-stats">
              <div className="finca-stat">
                <span className="stat-label">Plagas Detectadas:</span>
                <span className="stat-value">
                  {filteredData.filter(d => d.locationId === selectedFinca.id.toString().slice(-1)).length}
                </span>
              </div>
              <div className="finca-stat">
                <span className="stat-label">Nivel de Infestación:</span>
                <span className="stat-value">Moderado</span>
              </div>
              <div className="finca-stat">
                <span className="stat-label">Última Inspección:</span>
                <span className="stat-value">2023-10-15</span>
              </div>
            </div>
            <div className="finca-actions">
              <button className="btn btn-outline">
                <i className="fas fa-camera"></i> Nueva Imagen
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-share-alt"></i> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-section">
        <h2><i className="fas fa-chart-area"></i> Visualización de Datos</h2>
        <div className="charts-container">
          <div className="chart-wrapper card">
            <h3>Evolución Temporal de Detecciones</h3>
            <Line data={lineChartData} options={chartOptions} />
          </div>

          <div className="chart-wrapper card">
            <h3>Plagas Más Comunes (Top 7)</h3>
            <Bar data={barChartData} options={chartOptions} />
          </div>

          <div className="chart-wrapper card">
            <h3>Distribución por Severidad</h3>
            <Doughnut data={severityData} options={chartOptions} />
          </div>

          <div className="chart-wrapper card">
            <h3>Detecciones por Ubicación</h3>
            <Bar
              data={locationChartData}
              options={{
                ...chartOptions,
                indexAxis: 'y'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="data-table-section card">
        <h2><i className="fas fa-table"></i> Datos Detallados</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo de Plaga</th>
                <th>Cantidad</th>
                <th>Severidad</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>{item.count}</td>
                  <td>
                    <span className={`severity-badge ${item.severity.toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LemonStatsDashboard;