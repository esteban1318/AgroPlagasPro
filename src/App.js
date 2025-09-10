import React, { useState, useCallback} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import NavBar from './navBar';
import SidebarMapas from './sideBarMapas';
import MapView from './mapView';
import Estadisticas from './estadisticas';
import PlagasView from './plagasView';
import { PestFilterProvider } from './PestFilterContext';
import Login from './login.jsx';


const AppContent = () => {
  const [user, setUser] = useState(null);
  const onLogout = () => setUser(null);
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [polygonData, setPolygonData] = useState(null);

  const handleMarkerClick = (data) => {
    if (data?.type === 'polygon') {
      setPolygonData(data);
    }
  };

  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [selectedPlagas, setSelectedPlagas] = useState([]);
  const [selectedPlagaId, setSelectedPlagaId] = useState(null);

  // ✅ Aquí agregamos el estado de rango de fechas
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const [markerStyles, setMarkerStyles] = useState(() => {
    const defaultStyles = {};
    const plagas = ['ACARO_1', 'AFIDOS_1', 'DIPTERO_1'];
    plagas.forEach(plagaId => {
      defaultStyles[plagaId] = {
        color: '#00FF00',
        icon: 'bug',
        shape: 'circle'
      };
    });
    return defaultStyles;
  });

  const updateMarkerStyles = (plagaId, newStyles) => {
    setMarkerStyles(prev => ({
      ...prev,
      [plagaId]: {
        ...(prev[plagaId] || { color: '#00FF00' }),
        ...newStyles
      }
    }));
  };

  const handleFilterChange = useCallback((coords, styles) => {
    setFilteredFeatures(coords);
    setMarkerStyles(styles);
  }, []);

  const isAuthPath = ['/login'].includes(location.pathname);

  return (
    <PestFilterProvider>
      {!isAuthPath && <NavBar user={user} onLogout={onLogout} />}

      {!isAuthPath && location.pathname === '/mapa' && (
        <SidebarMapas
          onFilterChange={handleFilterChange}
          setSelectedPlagaId={setSelectedPlagaId}
          selectedPlagaId={selectedPlagaId}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onMarkerClick={handleMarkerClick}
          setPolygonData={setPolygonData}
          dateRange={dateRange}       // ✅ ahora existe
          setDateRange={setDateRange} // ✅ ahora existe
          polygonData={polygonData}
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
       <Route
  path="/mapa"
  element={
    <MapView
      filteredFeatures={filteredFeatures}
      markerStyles={markerStyles}
      selectedPlagaId={selectedPlagaId}
      selectedPlagas={selectedPlagas}
      collapsed={sidebarCollapsed}
      setCollapsed={setSidebarCollapsed}
      polygonData={polygonData}
      dateRange={dateRange}       // ✅ agregar
      setDateRange={setDateRange} // ✅ agregar
    />
  }
/>

        <Route path="/plagas" element={<PlagasView />} />
        <Route path="/reportes" element={<Estadisticas />} />
      </Routes>
    </PestFilterProvider>
  );
};


const App = () => (
  <Router basename='/'>
    <AppContent />
  </Router>
);

export default App;
