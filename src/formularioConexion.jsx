import React, { useState } from 'react';

export default function DbConnectionForm({ onConnect }) {
    // Estado para cada campo del formulario
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [host, setHost] = useState('localhost');
    const [database, setDatabase] = useState('');
    const [port, setPort] = useState(5432);

    // Al enviar el formulario, llamamos a la función onConnect con los datos
    const handleSubmit = (e) => {
        e.preventDefault();
        onConnect({ user, password, host, database, port });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: 'auto' }}>
            <div>
                <label>Usuario:</label><br />
                <input type="text" value={user} onChange={e => setUser(e.target.value)} required />
            </div>
            <div>
                <label>Contraseña:</label><br />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
                <label>Host:</label><br />
                <input type="text" value={host} onChange={e => setHost(e.target.value)} required />
            </div>
            <div>
                <label>Base de datos:</label><br />
                <input type="text" value={database} onChange={e => setDatabase(e.target.value)} required />
            </div>
            <div>
                <label>Puerto:</label><br />
                <input type="number" value={port} onChange={e => setPort(Number(e.target.value))} required />
            </div>
            <button type="submit" style={{ marginTop: 10 }}>Conectar</button>
        </form>
    );
}
