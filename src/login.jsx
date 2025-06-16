import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiAward } from 'react-icons/fi';
import logo_1 from './iconos/control-de-plagas.png';
import drone from './iconos/drone.png';
import hombre from './iconos/hombreLogo.png';
import style from './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('guest');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim() || userType === 'guest') {
            setMessage('Por favor, completa todos los campos.');
            setMessageType('error');
            return;
        }

        try {
            const response = await fetch('https://agroplagaspro-backend-1.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    role: userType
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Login exitoso');
                setMessageType('success');

                // 💾 Guarda el nombre de usuario en localStorage
                localStorage.setItem('username', username);

                setTimeout(() => {
                    navigate('/mapa');
                }, 1000);
            } else {
                setMessage(data.error || 'Ocurrió un error inesperado');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error en la conexión o servidor: ' + error.message);
            setMessageType('error');
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <>
            {/* Versión para Desktop - Oculta en móviles */}
            <div className="desktop-login">
                <div className="agro-login-container">
                    <div className="login-form-wrapper">
                        <div className="login-form">
                            <div className="logo-container">
                                <img src={logo_1} alt="Logo Agro" className="logo-image" />
                                <h1 className="logo-title">
                                    <span className="logo-main">Agro</span>
                                    <span className="logo-accent">Plagas</span>
                                    <span className="logo-sub">Pro</span>
                                </h1>
                                <p className="logo-subtitle">Gestión Inteligente de Cultivos</p>
                            </div>

                            <form onSubmit={handleSubmit} className="modern-form">
                                <div className="input-field">
                                    <div className="input-icon-wrapper">
                                        <FiUser className="input-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="modern-input"
                                    />
                                    <label className="input-label">Usuario</label>
                                </div>

                                <div className="input-field">
                                    <div className="input-icon-wrapper">
                                        <FiLock className="input-icon" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder=" "
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="modern-input"
                                    />
                                    <label className="input-label">Contraseña</label>
                                </div>

                                <div className="input-field">
                                    <div className="input-icon-wrapper">
                                        <FiAward className="input-icon" />
                                    </div>
                                    <select
                                        value={userType}
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="modern-select"
                                    >
                                        <option value="guest">Usuario</option>
                                        <option value="tech">Técnico</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                </div>

                                <button type="submit" className="modern-login-btn">
                                    <span>Ingresar</span>
                                    <div className="hover-effect"></div>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="agro-visual">
                        <div className="animated-drone">
                            <img src={drone} alt="Dron agrícola" />
                            <div className="signal"></div>
                        </div>

                        <div className="crop-circle">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="hombre-logo"><img src={hombre} /></div>
                        </div>

                        <div className="tech-text">
                            <h3>Monitoreo Inteligente</h3>
                            <p>Tecnología para el campo del futuro</p>
                        </div>
                    </div>
                    {message && (
                        <div className={`custom-alert ${messageType}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>

            {/* Versión para Móvil - Oculta en desktop */}
            <div className="mobile-login">
                <div className="mobile-login-container">
                    <div className="mobile-logo-container">
                        <img src={logo_1} alt="Logo Agro" className="mobile-logo-image" />
                        <h1 className="mobile-logo-title">
                            <span className="mobile-logo-main">Agro</span>
                            <span className="mobile-logo-accent">Plagas</span>
                            <span className="mobile-logo-sub">Pro</span>
                        </h1>
                        <p className="mobile-logo-subtitle">Gestión Inteligente de Cultivos</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mobile-form">
                        <div className="mobile-input-field">
                            <div className="mobile-input-icon-wrapper">
                                <FiUser className="mobile-input-icon" />
                            </div>
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mobile-input"
                            />
                        </div>

                        <div className="mobile-input-field">
                            <div className="mobile-input-icon-wrapper">
                                <FiLock className="mobile-input-icon" />
                            </div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mobile-input"
                            />
                        </div>

                        <div className="mobile-input-field">
                            <div className="mobile-input-icon-wrapper">
                                <FiAward className="mobile-input-icon" />
                            </div>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="mobile-select"
                            >
                                <option value="guest">Usuario</option>
                                <option value="tech">Técnico</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </div>

                        <button type="submit" className="mobile-login-btn">
                            Ingresar
                        </button>
                    </form>

                    {message && (
                        <div className={`mobile-custom-alert ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <div className="mobile-tech-text">
                        <h3>Monitoreo Inteligente</h3>
                        <p>Tecnología para el campo del futuro</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;