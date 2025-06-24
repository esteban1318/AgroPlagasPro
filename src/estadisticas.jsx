import React from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaLeaf,
  FaBug
} from 'react-icons/fa';
import './estadisticas.css';

const Estadisticas = () => {
  // Datos de ejemplo - deberías reemplazarlos con datos reales de tu backend
  const estadisticasPlagas = [
    { plaga: 'Fumza', casos: 45, tendencia: '↑ 12%' },
    { plaga: 'Cubado, vespo', casos: 28, tendencia: '↓ 5%' },
    { plaga: 'Sodana', casos: 63, tendencia: '↑ 23%' },
    { plaga: 'Colarazajé de jóvar', casos: 17, tendencia: '→' },
    { plaga: 'Monterau del truya', casos: 32, tendencia: '↑ 8%' }
  ];

  const zonasMasAfectadas = [
    { zona: 'Tena', nivel: 'Alto', plagas: 5 },
    { zona: 'Gamaia', nivel: 'Medio', plagas: 3 },
    { zona: 'Silvania', nivel: 'Bajo', plagas: 1 }
  ];

  const historicoPlagas = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      {
        label: 'Fumza',
        data: [12, 19, 15, 27, 45],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)'
      },
      {
        label: 'Sodana',
        data: [8, 12, 23, 41, 63],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)'
      }
    ]
  };

  return (
    <div className="estadisticas-container">
      <h1 className="estadisticas-title">
        <FaChartLine /> Estadísticas de Plagas
      </h1>

      {/* Resumen rápido */}
      <div className="resumen-rapido">
        <div className="resumen-card">
          <div className="resumen-icon"><FaBug /></div>
          <div className="resumen-content">
            <h3>Total Plagas Activas</h3>
            <p>7 tipos</p>
          </div>
        </div>

        <div className="resumen-card">
          <div className="resumen-icon"><FaMapMarkedAlt /></div>
          <div className="resumen-content">
            <h3>Zonas Afectadas</h3>
            <p>3 de 5</p>
          </div>
        </div>

        <div className="resumen-card">
          <div className="resumen-icon"><FaCalendarAlt /></div>
          <div className="resumen-content">
            <h3>Incidencia este mes</h3>
            <p>+18%</p>
          </div>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="grafico-principal">
        <h2><FaChartBar /> Tendencia de Plagas (últimos 5 meses)</h2>
        <div className="grafico-placeholder">
          {/* Aquí iría tu gráfico de Chart.js, Highcharts, etc. */}
          <p>Gráfico interactivo mostrando {JSON.stringify(historicoPlagas)}</p>
        </div>
      </div>

      {/* Tablas de datos */}
      <div className="tablas-estadisticas">
        <div className="tabla-plagas">
          <h2><FaBug /> Plagas más frecuentes</h2>
          <table>
            <thead>
              <tr>
                <th>Plaga</th>
                <th>Casos registrados</th>
                <th>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {estadisticasPlagas.map((item, index) => (
                <tr key={index}>
                  <td>{item.plaga}</td>
                  <td>{item.casos}</td>
                  <td className={`tendencia ${item.tendencia.includes('↑') ? 'alta' : item.tendencia.includes('↓') ? 'baja' : ''}`}>
                    {item.tendencia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tabla-zonas">
          <h2><FaMapMarkedAlt /> Zonas más afectadas</h2>
          <table>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Nivel de infestación</th>
                <th>Plagas presentes</th>
              </tr>
            </thead>
            <tbody>
              {zonasMasAfectadas.map((zona, index) => (
                <tr key={index}>
                  <td>{zona.zona}</td>
                  <td>
                    <span className={`nivel ${zona.nivel.toLowerCase()}`}>
                      {zona.nivel}
                    </span>
                  </td>
                  <td>{zona.plagas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="seccion-estadisticas">
        <h2 class="titulo-seccion">Estadísticas de Muestra</h2>

        <div class="contenedor-estadisticas">
         
          <div class="tarjeta-estadistica principal">
            <div class="encabezado-tarjeta">
              <h3>Muestra #9878</h3>
              <span class="fecha">14/09/2024</span>
            </div>
            <div class="cuerpo-tarjeta">
              <div class="campo">
                <span class="etiqueta">Lote:</span>
                <span class="valor">5-1_A-35</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Submuestra:</span>
                <span class="valor">5-1_A-35-14</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Tipo:</span>
                <span class="valor">Frutos</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Ubicación:</span>
                <span class="valor">Medio - Externa</span>
              </div>
            </div>
          </div>

        
          <div class="tarjeta-estadistica secundaria">
            <div class="encabezado-tarjeta">
              <h3>Detalles Técnicos</h3>
            </div>
            <div class="cuerpo-tarjeta">
              <div class="campo">
                <span class="etiqueta">Etapa:</span>
                <span class="valor">Adulto</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Variedad:</span>
                <span class="valor">5</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Técnico:</span>
                <span class="valor">DARWINJ</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Plaga:</span>
                <span class="valor">ACARO_4</span>
              </div>
            </div>
          </div>

       
          <div class="tarjeta-estadistica ubicacion">
            <div class="encabezado-tarjeta">
              <h3>Ubicación Geográfica</h3>
            </div>
            <div class="cuerpo-tarjeta">
              <div class="campo">
                <span class="etiqueta">Finca:</span>
                <span class="valor">VILLAS_2</span>
              </div>
              <div class="campo coordenadas">
                <span class="etiqueta">Coordenadas:</span>
                <span class="valor">4.2273° N, 74.9073° W</span>
              </div>
              <div class="mapa-miniatura">
              
                <div class="icono-mapa">🌍</div>
              </div>
            </div>
          </div>
        </div>

        <div class="resumen-estadistico">
          <h3>Resumen Estadístico</h3>
          <div class="graficos">
           
            <div class="grafico grafico-barras">[Gráfico de barras]</div>
            <div class="grafico grafico-torta">[Gráfico circular]</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Estadisticas;