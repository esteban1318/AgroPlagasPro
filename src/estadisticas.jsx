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
import { getFilteredRecords } from './indexedDB';
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
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedPestType, setSelectedPestType] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [selectedFinca, setSelectedFinca] = useState(fincasImagenes[0]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef(null);
  const [records, setRecords] = useState([]);
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
  // Función para formatear según agrupación


  // Agrupar por mes (clave YYYY-MM) convirtiendo marcado a número de forma segura
  const deteccionesPorMesObj = useMemo(() => {
    const acc = {};

    records.forEach(item => {
      if (!item || !item.fecha) return;

      // 1) convertir marcado a número seguro (quita comas, trim, etc.)
      const marcadoRaw = item.marcado ?? item.count ?? 0; // intenta varias propiedades si existen
      const marcado = Number(String(marcadoRaw).replace(/[, ]+/g, "").trim()) || 0;

      // 2) obtener clave YYYY-MM de manera robusta (soporta "YYYY-MM-DD" y fechas parseables)
      let yearMonth;
      const parts = String(item.fecha).split("-");
      if (parts.length >= 2 && /^\d{4}$/.test(parts[0])) {
        // formato esperado YYYY-MM(-DD)
        const year = parts[0];
        const month = parts[1].padStart(2, "0");
        yearMonth = `${year}-${month}`;
      } else {
        // fallback: intentar con Date
        const d = new Date(item.fecha);
        if (isNaN(d)) return; // no se puede parsear, lo ignoramos
        yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }

      acc[yearMonth] = (acc[yearMonth] || 0) + marcado;
    });

    return acc;
  }, [records]);

  // Ordenar claves (YYYY-MM) y crear etiquetas legibles en español
  const monthKeys = Object.keys(deteccionesPorMesObj).sort(); // "2024-09", "2025-02", ...
  const monthLabels = monthKeys.map(k => {
    const [y, m] = k.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    // "Febrero 2025" (primera letra mayúscula)
    const label = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
  const monthData = monthKeys.map(k => deteccionesPorMesObj[k]);

  // Chart.js data
  const [agrupacion, setAgrupacion] = useState("mes"); // "dia" | "mes" | "anio"

  // --- Agrupar detecciones según agrupación seleccionada ---
  const agrupados = useMemo(() => {
    const acc = {};

    records.forEach((item) => {
      if (!item || !item.fecha) return;

      // Normalizar marcado a número
      const marcadoRaw = item.marcado ?? item.count ?? 0;
      const marcado = Number(String(marcadoRaw).replace(/[, ]+/g, "").trim()) || 0;

      const d = new Date(item.fecha);
      if (isNaN(d)) return;

      let clave = "";
      if (agrupacion === "dia") {
        clave = d.toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (agrupacion === "mes") {
        clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
      } else if (agrupacion === "anio") {
        clave = `${d.getFullYear()}`; // YYYY
      }

      acc[clave] = (acc[clave] || 0) + marcado;
    });

    return acc;
  }, [records, agrupacion]);

  // --- Ordenar claves ---
  const clavesOrdenadas = Object.keys(agrupados).sort();

  // --- Crear etiquetas legibles ---
  const etiquetas = clavesOrdenadas.map((k) => {
    if (agrupacion === "dia") {
      const d = new Date(k);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else if (agrupacion === "mes") {
      const [y, m] = k.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } else {
      return k; // año simple
    }
  });

  // --- Datos para Chart.js ---
  const lineChartData = {
    labels: etiquetas,
    datasets: [
      {
        label:
          agrupacion === "dia"
            ? "Detecciones por día"
            : agrupacion === "mes"
              ? "Detecciones por mes"
              : "Detecciones por año",
        data: clavesOrdenadas.map((k) => agrupados[k]),
        borderColor: "rgb(46, 204, 113)",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };



  // Preparar datos para el gráfico de plagas más comunes (top 7)
  const pestCounts = Object.values(
    records.reduce((acc, r) => {
      if (!acc[r.plaga_id]) acc[r.plaga_id] = { id: r.plaga_id, count: 0 };
      acc[r.plaga_id].count += 1; // o acc[r.plaga_id].count += r.marcado si quieres sumar cantidad
      return acc;
    }, {})
  );
  // Ordenar de mayor a menor
  pestCounts.sort((a, b) => b.count - a.count);

  const barChartData = {
    labels: pestCounts.map(p => p.id),
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
  // Cuando cambien los filtros, recargar los datos
  useEffect(() => {
    getFilteredRecords({
      startDate: dateRange.start,
      endDate: dateRange.end,
      pestType: selectedPestType,
      location: selectedLocation
    })
      .then(setRecords)
      .catch(console.error);
  }, [dateRange, selectedPestType, selectedLocation]);
  // Resumen
  const total = records.length;
  const byPlaga = records.reduce((acc, r) => {
    acc[r.plaga_id] = (acc[r.plaga_id] || 0) + 1;
    return acc;
  }, {});
  const byZona = records.reduce((acc, r) => {
    acc[r.zona] = (acc[r.zona] || 0) + 1;
    return acc;
  }, {});


  // Número de detecciones de la plaga más común

  // Severidad alta
  const highSeverityCount = records.filter(r => r.severity === "Alta").length;
  const averageSeverity = total > 0 ? ((highSeverityCount / total) * 100).toFixed(2) : 0;

  // Ubicaciones afectadas
  const affectedLocations = [...new Set(records.map(r => r.zona))].length;
  const { mostCommonPest, mostCommonCount, mostCommonPestId } = useMemo(() => {
    if (!records || records.length === 0) {
      return { mostCommonPest: "Ninguno", mostCommonCount: 0, mostCommonPestId: null };
    }

    // Filtrar registros con plaga_id real
    const realRecords = records.filter(r => r.plaga_id && r.plaga_id !== "NINGUNO");

    if (realRecords.length === 0) {
      return { mostCommonPest: "Ninguno", mostCommonCount: 0, mostCommonPestId: null };
    }

    // Contar cantidad de cada plaga
    const pestCounts = Object.values(
      realRecords.reduce((acc, r) => {
        if (!acc[r.plaga_id]) acc[r.plaga_id] = { id: r.plaga_id, count: 0 };
        acc[r.plaga_id].count += 1;
        return acc;
      }, {})
    );

    // Ordenar de mayor a menor
    pestCounts.sort((a, b) => b.count - a.count);

    const mostCommonPestId = pestCounts[0]?.id ?? null;

    const mostCommonPest = mostCommonPestId
      ? plagas.find(p => p.id === mostCommonPestId)?.nombre ?? mostCommonPestId
      : "Ninguno";

    const mostCommonCount = pestCounts[0]?.count ?? 0;

    return { mostCommonPest, mostCommonCount, mostCommonPestId };
  }, [records, plagas]);
  //
  // Filtrar datos según plaga seleccionada
  const filteredRecords = useMemo(() => {
    if (selectedPestType === "Todos") return records;
    return records.filter(r => r.plaga_id === selectedPestType);
  }, [selectedPestType, records]);

  // Calcular métricas
  const totalDetecciones = filteredRecords.length;
  const plagaMasComun = (() => {
    const counts = {};
    filteredRecords.forEach(r => {
      if (r.plaga_id !== "NINGUNO") {
        counts[r.plaga_id] = (counts[r.plaga_id] || 0) + 1;
      }
    });
    const [plaga, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ["-", 0];
    return { plaga, count };
  })();
  const ubicacionesAfectadas = new Set(filteredRecords.map(r => r.lote_id)).size;
  // Finca más afectada
  // Agrupamos por finca (ej: lote_id)
  // Agrupamos por finca (cod_moni_id)
  const farmCounts = {};
  filteredRecords.forEach(r => {
    const farm = r.cod_moni_id || "Desconocido"; // usamos el nombre real de la finca
    farmCounts[farm] = (farmCounts[farm] || 0) + 1;
  });

  // Encontrar la finca con más detecciones
  let mostAffectedFarm = null;
  let mostAffectedCount = 0;
  for (const farm in farmCounts) {
    if (farmCounts[farm] > mostAffectedCount) {
      mostAffectedFarm = farm;
      mostAffectedCount = farmCounts[farm];
    }
  }
  // agrupamos por lote y finca
  const lotesCounts = {};
  filteredRecords.forEach(r => {
    const lote = r.lote_id || "Sin lote";
    const finca = r.cod_moni_id || "Sin finca";
    const key = `${lote}|${finca}`;
    lotesCounts[key] = (lotesCounts[key] || 0) + 1;
  });

  // inicializamos valores seguros
  let mostAffectedKey = null;
  let mostAffectedLoteCount = 0;

  for (const key in lotesCounts) {
    if (lotesCounts[key] > mostAffectedLoteCount) {
      mostAffectedKey = key;
      mostAffectedLoteCount = lotesCounts[key];
    }
  }

  let mostAffectedLote = "N/A";
  let mostAffectedFinca = "N/A";

  if (mostAffectedKey) {
    [mostAffectedLote, mostAffectedFinca] = mostAffectedKey.split("|");
  }


  return (
    <div className="lemon-stats-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1><i className="fas fa-lemon"></i> Panel de estadísticas - Cultivo de Limón</h1>

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
              className="select-plagas"
              value={selectedPestType}
              onChange={e => setSelectedPestType(e.target.value)}
            >
              <option value="Todos">Todas las plagas</option>
              {plagas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
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
              <h3>Total de detecciones geográficas</h3>
              <p className="stat-number">{total}</p>
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
                {mostCommonCount} detecciones
              </p>
            </div>

          </div>

          <div className="stat-card card">
            <div className="stat-icon severity">
              <i className="fas fa-tractor"></i>
            </div>
            <div className="stat-content">
              <h3>Finca Más Afectada</h3>
              <p className="stat-text">{mostAffectedFarm || "N/A"}</p>
              <p className="stat-subtext">
                {mostAffectedCount} detecciones
              </p>
            </div>
          </div>


          <div className="stat-card card">
            <div className="stat-icon location">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="stat-content">
              <h3>Lote Más Afectado</h3>
              <p className="stat-text">
                {mostAffectedLote} ({mostAffectedFinca})
              </p>
              <p className="stat-subtext">
                {mostAffectedLoteCount} de {total} detecciones totales
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Gráficos */}
      <div className="chart-wrapper card">
        <h3>Evolución Temporal de Detecciones</h3>

        {/* Selector de agrupación */}

        <div className="selector-container">
          <label htmlFor="agrupacion">Ver por:</label>
          <select
            id="agrupacion"
            value={agrupacion}
            onChange={(e) => setAgrupacion(e.target.value)}
          >
            <option value="dia">Día</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>
        </div>

        <Line data={lineChartData} />
      </div>
      <div className="charts-section">
        <h2><i className="fas fa-chart-area"></i> Visualización de Datos</h2>
        <div className="charts-container">

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
    </div >
  );
};

export default LemonStatsDashboard;