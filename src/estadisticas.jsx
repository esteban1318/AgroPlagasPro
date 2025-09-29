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
  Legend,
  Filler
} from 'chart.js';
import './estadisticas.css';
import { getFilteredRecords, getCoordenadasFromIndexedDB } from './indexedDB';
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
  Legend,
  Filler
);

const LemonStatsDashboard = () => {
  // Datos de plagas específicas para cultivo de limón
  const plagas = useMemo(() => [
    { id: 'ACARO_1', nombre: "Ácaro" },
    { id: 'ACARO_2', nombre: "Ácaro de la roya" },
    { id: 'ACARO_3', nombre: "Ácaro blanco" },
    { id: 'ACARO_4', nombre: "Ácaro tostador" },
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
  //
  const [searchTerm, setSearchTerm] = useState(""); // para el input de búsqueda
  const [codigo1, setCodigo1] = useState(""); // select código 1
  const [codigo2, setCodigo2] = useState(""); // select código 2
  const [search, setSearch] = useState("");


  // 2. Lista de monitorings
  const monitorings = [

  ];

  // 3. Filtro
  const filteredMonitorings = monitorings.filter((m) =>
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Imágenes de fincas (simuladas)
  const fincasImagenes = useMemo(() => [
    { id: 1, nombre: 'Finca Principal - Vista Aérea', url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 2, nombre: 'Lote A - Zona Norte', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 3, nombre: 'Lote B - Zona Sur', url: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { id: 4, nombre: 'Invernadero - Cultivo Protegido', url: 'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }
  ], []);

  // Generar datos de ejemplo para el cultivo de limón


  const [pestData, setPestData] = useState([]);           // para la UI si quieres
  const [filteredData, setFilteredData] = useState([]);   // para heatmap / lista
  const [records, setRecords] = useState([]);             // datos reales (IndexedDB / backend)

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedPestType, setSelectedPestType] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [selectedFinca, setSelectedFinca] = useState(fincasImagenes[0]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef(null);

  const [monitoreos, setMonitoreos] = useState([]);
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

  // --- Calcular la última fecha real de tus datos ---


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


  // Chart.js data
  const [agrupacion, setAgrupacion] = useState("mes"); // "dia" | "mes" | "anio"

  const parseDateStr = (s) => {

    if (!s && s !== 0) return null;
    let str = String(s).trim();

    // Si ya es ISO yyyy-mm-dd o yyyy/mm/dd
    let m = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if (m) {
      const y = Number(m[1]), mo = Number(m[2]), da = Number(m[3]);
      return new Date(y, mo - 1, da);
    }

    // Formatos D/M/YYYY o M/D/YYYY (ambos con / o -)
    m = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (m) {
      let a = Number(m[1]), b = Number(m[2]), y = Number(m[3]);
      if (y < 100) y += (y > 50 ? 1900 : 2000);

      // heurística: si el primero > 12 entonces es día (DD/MM)
      if (a > 12 && b <= 12) {
        return new Date(y, b - 1, a);
      }
      // si el segundo > 12 entonces el segundo es día (MM/DD inusual, convert)
      if (b > 12 && a <= 12) {
        return new Date(y, a - 1, b);
      }
      // ambiguo (ambos <=12): asume formato DD/MM (común en ES)
      return new Date(y, b - 1, a);
    }

    // Si es número (posible serial de Excel) - opcionalmente intentamos convertir
    const maybeNum = Number(str.replace(',', '.'));
    if (!Number.isNaN(maybeNum) && maybeNum > 1000) {
      // heurística simple: tratar como fecha serial Excel (corrige bug 1900)
      const serial = Math.floor(maybeNum);
      // Excel serial: day 1 = 1899-12-31, Excel bug: 1900 is considered leap year so offset
      const offset = serial > 59 ? serial - 1 : serial - 0; // simple ajuste
      return new Date(1899, 11, 31 + offset);
    }

    // fallback: intentar new Date() (último recurso)
    const d = new Date(str);
    return isNaN(d) ? null : d;
  };
  const dateInRange = (d, start, end) => {
    if (!d) return false;
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    const ds = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const de = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const dd = new Date(y, m, day);
    return dd >= ds && dd <= de;
  };

  // helper para generar clave YYYY-MM-DD sin usar toISOString (evita shift TZ)
  const toKeyDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const toKeyMonth = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  // --- calcular ULTIMA FECHA solo de los records reales con parse robusto ---
  const ultimaFecha = useMemo(() => {
    if (!records || records.length === 0) return null;
    const parsed = records
      .map(r => parseDateStr(r.fecha ?? r.date ?? ""))
      .filter(d => d && !isNaN(d.getTime()));
    if (!parsed.length) return null;
    const maxMs = Math.max(...parsed.map(d => d.getTime()));
    return new Date(maxMs);
  }, [records]);


  // 2) generar mocks limitados por ultimaFecha (si no hay ultimaFecha devuelve [])
  const initialPestData = useMemo(() => {
    if (!ultimaFecha) return [];
    const data = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(ultimaFecha);
      d.setDate(ultimaFecha.getDate() - i);
      const iso = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      data.push({
        id: `mock-${i + 1}`,
        fecha: iso,                               // <-- usar 'fecha' para ser consistente
        marcado: Math.floor(Math.random() * 10) + 1,
        plaga_id: plagas[Math.floor(Math.random() * plagas.length)].id,
        location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)].nombre,
        severity: ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)]
      });
    }
    return data;
  }, [ultimaFecha, plagas, ubicaciones]);

  // 3) combinar reales + simulados
  const combinedData = useMemo(() => {
    // ambos arrays deben tener la misma propiedad de fecha: 'fecha'
    return [...records, ...initialPestData];
  }, [records, initialPestData]);

  // 4) Agrupar según agrupación (usar combinedData)
  const agrupados = useMemo(() => {
    const acc = {};
    combinedData.forEach(item => {
      if (!item) return;

      // ❌ Excluir registros sin plaga
      if (!item.plaga_id || String(item.plaga_id).toUpperCase() === "NINGUNO") return;

      const fechaStr = item.fecha ?? item.date ?? "";
      const d = parseDateStr(fechaStr);
      if (!d || isNaN(d.getTime())) return;

      let clave = "";
      if (agrupacion === "dia") clave = toKeyDay(d);
      else if (agrupacion === "mes") clave = toKeyMonth(d);
      else clave = `${d.getFullYear()}`;

      const marcado =
        Number(
          String(item.marcado ?? item.count ?? 0)
            .replace(/[, ]+/g, "")
            .trim()
        ) || 0;

      acc[clave] = (acc[clave] || 0) + marcado;
    });
    return acc;
  }, [combinedData, agrupacion]);


  // 5) ordenar claves y recortar hasta ultimaFecha (si existe)
  let clavesOrdenadas = Object.keys(agrupados).sort();
  if (ultimaFecha) {
    if (agrupacion === "dia") {
      const ultimaClave = ultimaFecha.toISOString().slice(0, 10);
      clavesOrdenadas = clavesOrdenadas.filter(k => k <= ultimaClave);
    } else if (agrupacion === "mes") {
      const ultimaClave = `${ultimaFecha.getFullYear()}-${String(ultimaFecha.getMonth() + 1).padStart(2, '0')}`;
      clavesOrdenadas = clavesOrdenadas.filter(k => k <= ultimaClave);
    } else {
      const ultimaClave = `${ultimaFecha.getFullYear()}`;
      clavesOrdenadas = clavesOrdenadas.filter(k => k <= ultimaClave);
    }
  }

  // 6) etiquetas (igual que antes)
  const etiquetas = clavesOrdenadas.map((k) => {
    if (agrupacion === "dia") {
      const d = new Date(k);
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    } else if (agrupacion === "mes") {
      const [y, m] = k.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    } else {
      return k;
    }
  });

  // 7) lineChartData (usa clavesOrdenadas/agrupados)
 // Data
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
      data: clavesOrdenadas.map((k) => agrupados[k] || 0),

      // 🎨 estilo línea
      borderColor: "rgba(34, 197, 94, 1)", // verde moderno
      borderWidth: 3,
      tension: 0.4, // curva suave

      // 🔴 estilo puntos
      pointBackgroundColor: "#fff",
      pointBorderColor: "rgba(34, 197, 94, 1)",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: "rgba(34,197,94,1)",
      pointHoverBorderColor: "#fff",

      // 🌈 área degradada debajo
      fill: 'origin',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(34, 197, 94, 0.2)";
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, "rgba(34,197,94,0.25)");
        gradient.addColorStop(1, "rgba(34,197,94,0)");
        return gradient;
      },
    },
  ],
};

// Options
const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      titleFont: { size: 14, weight: "bold" },
      bodyFont: { size: 13 },
      padding: 10,
      displayColors: false,
      callbacks: {
        label: function (context) {
          return `${Math.round(context.parsed.y)} detecciones`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#999",
        font: { size: 12 },
      },
    },
    y: {
      grid: {
        color: "rgba(200,200,200,0.1)",
      },
      ticks: {
        color: "#999",
        font: { size: 12 },
        callback: function (value) {
          return Math.round(value);
        },
      },
    },
  },
};



  // Preparar datos para el gráfico de plagas más comunes (top 7)
  // 1. Contar todas las plagas
  const pestCounts = Object.values(
    records.reduce((acc, r) => {
      if (!r.plaga_id || String(r.plaga_id).toUpperCase() === "NINGUNO") return acc; // opcional: excluir "NINGUNO"
      if (!acc[r.plaga_id]) acc[r.plaga_id] = { id: r.plaga_id, count: 0 };
      acc[r.plaga_id].count += 1; // si quieres sumar cantidad marcada: acc[r.plaga_id].count += r.marcado
      return acc;
    }, {})
  );

  // 2. Ordenar de mayor a menor
  pestCounts.sort((a, b) => b.count - a.count);

  // 3. Colores base (se repiten si hay más plagas)
  const colors = [
    'rgba(241, 196, 15, 0.8)',
    'rgba(52, 152, 219, 0.8)',
    'rgba(46, 204, 113, 0.8)',
    'rgba(155, 89, 182, 0.8)',
    'rgba(230, 126, 34, 0.8)',
    'rgba(231, 76, 60, 0.8)',
    'rgba(149, 165, 166, 0.8)'
  ];

  const getColor = (i) => colors[i % colors.length];

  // 4. Preparar datos para Chart.js
  const barChartData = {
    labels: pestCounts.map(p => p.id),
    datasets: [
      {
        label: 'Total por tipo de plaga',
        data: pestCounts.map(p => p.count),
        backgroundColor: pestCounts.map((_, i) => getColor(i)),
        borderColor: pestCounts.map((_, i) => getColor(i).replace('0.8', '1')),
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
  // 🔹 Agrupamos los datos por plaga y código
  const plagasComparacion = [...new Set(records
    .filter(r => r.plaga_id !== "NINGUNO" && (r.cod_moni_id === codigo1 || r.cod_moni_id === codigo2))
    .map(r => r.plaga_id)
  )];

  const sumByPlaga = (codigo, plagaId) => {
    return records
      .filter(m => m.cod_moni_id === codigo && m.plaga_id === plagaId)
      .reduce((sum, m) => sum + (Number(m.marcado) || 0), 0);
  };


  // 🔹 Preparamos los datasets
  const locationChartData = {
    labels: [selectedPestType], // la plaga seleccionada como etiqueta
    datasets: [
      {
        label: `Marcados en ${codigo1}`,
        data: [sumByPlaga(codigo1, selectedPestType)],
        backgroundColor: "rgba(52, 152, 219, 0.6)",
        borderColor: "rgb(52, 152, 219)",
        borderWidth: 1
      },
      {
        label: `Marcados en ${codigo2}`,
        data: [sumByPlaga(codigo2, selectedPestType)],
        backgroundColor: "rgba(231, 76, 60, 0.6)",
        borderColor: "rgb(231, 76, 60)",
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

    // Mapeo de linea a finca
    const fincaMap = {
      '1': 'San Martin',
      '3': 'Yulima',
      '4': 'Santa Barbara',
      '5': 'Las Villas',
      '6': 'La Esperanza'
    };

    const linea = r.linea?.toString() || '';
    const finca = fincaMap[linea[0]] || 'Sin finca'; // toma el primer dígito

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
  // Cargar coordenadas únicas de IndexedDB para el filtro de monitoreos  
  useEffect(() => {
    async function fetchData() {
      const datos = await getCoordenadasFromIndexedDB();

      // Sacar cod_moni_id únicos
      const unicos = [...new Set(datos.map((d) => d.cod_moni_id))];

      setMonitoreos(unicos);
    }
    fetchData();
  }, []);
  //
  // Dentro de tu componente
  const [trendPercentage, setTrendPercentage] = useState(0);
  const [trendUp, setTrendUp] = useState(true);

  useEffect(() => {
    const calculateTrend = async () => {
      const currentStart = new Date("2025-09-01");
      const currentEnd = new Date("2025-09-30");
      const prevStart = new Date("2025-08-01");
      const prevEnd = new Date("2025-08-31");

      // Llama a tu función que ya filtra con parseDateStr internamente
      const currentRecords = await getFilteredRecords({ startDate: currentStart, endDate: currentEnd });
      const prevRecords = await getFilteredRecords({ startDate: prevStart, endDate: prevEnd });

      const countValid = (records) =>
        records.filter(r => r.plaga_id && r.plaga_id.toLowerCase() !== "ninguno").length;

      const totalCurrent = countValid(currentRecords);
      const totalPrev = countValid(prevRecords);

      let trendPercentage = 0;
      let trendUp = true;

      if (totalPrev > 0) {
        trendPercentage = ((totalCurrent - totalPrev) / totalPrev) * 100;
        trendUp = trendPercentage >= 0;
      }

      setTrendPercentage(trendPercentage);
      setTrendUp(trendUp);
    };

    calculateTrend();
  }, []);


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
              <p className="stat-trend">
                <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`}></i> {trendPercentage}% vs período anterior
              </p>
            </div>

          </div>

          <div className="stat-card card">
            <div className="stat-icon severity">
              <i className="fas fa-tractor"></i>
            </div>
            <div className="stat-content">
              <h3>Finca Más Afectada</h3>
              <p className="stat-text">{mostAffectedFinca || "N/A"}</p>
              <p className="stat-subtext">
                {mostAffectedLoteCount} detecciones
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

        <Line data={lineChartData} options={lineChartOptions} />


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
        </div>
      </div>
      <div className="moni-container">
        <div className="form-moni">
          {/* 🔍 Input de búsqueda */}
          <select
            className="select-moni_plagas"
            value={selectedPestType}
            onChange={e => setSelectedPestType(e.target.value)}
          >
            <option value="Todos">--seleccione plaga--</option>
            {plagas.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          {/* 📌 Select Código 1 */}
          <h3>Código 1:</h3>
          <select
            id="codigo1"
            value={codigo1}
            onChange={(e) => setCodigo1(e.target.value)}
            className="select-moni"
          >
            <option value="">-- Seleccione --</option>
            {monitoreos.map((m, idx) => (
              <option key={idx} value={m.toString()}>
                {m}
              </option>

            ))}
          </select>

          {/* 📌 Select Código 2 */}
          <h3>Código 2:</h3>
          <select
            id="codigo2"
            value={codigo2}
            onChange={(e) => setCodigo2(e.target.value)}
            className="select-moni"
          >
            <option value="">-- Seleccione --</option>
            {monitoreos.map((m, idx) => (
              <option key={idx} value={m.toString()}>
                {m}
              </option>

            ))}
          </select>
          {/* 🔄 Botón Reset */}
          <button
            type="button"
            className="btn-reset"
            onClick={() => {
              setSelectedPestType("Todos");
              setCodigo1("");
              setCodigo2("");
            }}
          >
            Reset
          </button>
        </div>


        <div className="card_codi_moni">
          <Bar data={locationChartData} />
          {/* 📌 Mostrar diferencia */}
          {codigo1 && codigo2 && selectedPestType && (
            <p style={{ marginTop: "1rem", fontWeight: "bold", textAlign: "center" }}>
              Diferencia de marcado para la plaga seleccionada:{" "}
              {sumByPlaga(codigo1, selectedPestType) -
                sumByPlaga(codigo2, selectedPestType)}
            </p>
          )}
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