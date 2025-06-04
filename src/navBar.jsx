import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaBug,
  FaChartLine,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaLeaf
} from 'react-icons/fa';
import { IoIosNotificationsOutline } from 'react-icons/io';
import './navBar.css';
import CerrarSesion from './iconos/cerrar-sesion.png';



const NavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  // logout.js o dentro de un useContext
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <header className="navbar-moderno">
      <div className="navbar-container">
        {/* Logo y marca */}
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <FaLeaf className="logo-icon" />
            <span className="logo-text">Agro<span>Plagas</span>Pro</span>
          </Link>
        </div>

        {/* Menú principal */}
        <nav className="navbar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/mapa" className="nav-link">
                <FaMapMarkedAlt className="nav-icon" />
                <span className="link-text">Mapa</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/plagas" className="nav-link">
                <FaBug className="nav-icon" />
                <span className="link-text">Plagas</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reportes" className="nav-link">
                <FaChartLine className="nav-icon" />
                <span className="link-text">Analíticos</span>
              </NavLink>
            </li>
          </ul>
        </nav>



        {/* Menú móvil */}
        <button className="mobile-menu-btn">
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>
      </div>
      <div>
        <button className='btnCerrarSesion' onClick={cerrarSesion}>
          <img className='icono-cerrar-sesion' src={CerrarSesion} alt='cerrar sesion'></img>
        </button>
      </div>
    </header>
  );
};

export default NavBar;