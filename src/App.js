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
    // Manejar otros tipos de marcadores si es necesario
  };
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [selectedPlagas, setSelectedPlagas] = useState([]);
    const [markerStyles, setMarkerStyles] = useState(() => {
  const defaultStyles = {};
  // Ejemplo: Asigna colores iniciales a todas las plagas conocidas
  const plagas = ['ACARO_1', 'AFIDOS_1', 'DIPTERO_1']; // Añade todas las plagas aquí
  plagas.forEach(plagaId => {
    defaultStyles[plagaId] = {
      color: '#00FF00', // Verde por defecto
      icon: 'bug',
      shape: 'circle'
    };
  });
  return defaultStyles;
});
  
  // Función para actualizar estilos segura
const updateMarkerStyles = (plagaId, newStyles) => {
  setMarkerStyles(prev => ({
    ...prev,
    [plagaId]: {
      ...(prev[plagaId] || { color: '#00FF00' }), // Fuerza verde si no existe
      ...newStyles
    }
  }));
};
  const [selectedPlagaId, setSelectedPlagaId] = useState(null);

 const handleFilterChange = useCallback((coords, styles) => {
  setFilteredFeatures(coords);
  setMarkerStyles(styles);
}, []);

  const isAuthPath = ['/login'].includes(location.pathname);

  return (
    <PestFilterProvider>
      {/* Navbar visible en todas las rutas excepto login */}
      {!isAuthPath && <NavBar user={user} onLogout={onLogout} />}
      {/* SidebarMapas visible en mapa, plagas, reportes */}
      {!isAuthPath && location.pathname === '/mapa' && (
        /*<SidebarMapas
          onFilterChange={handleFilterChange}
          setSelectedPlagaId={setSelectedPlagaId}
          selectedPlagaId={selectedPlagaId}
        />*/
        <SidebarMapas
  onFilterChange={handleFilterChange}
  setSelectedPlagaId={setSelectedPlagaId}
  selectedPlagaId={selectedPlagaId}
   collapsed={sidebarCollapsed}
  setCollapsed={setSidebarCollapsed}
  onMarkerClick={handleMarkerClick}
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
