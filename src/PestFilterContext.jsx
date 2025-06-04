// src/PestFilterContext.jsx

import React, { createContext, useState } from 'react';

const PestFilterContext = createContext();

export function PestFilterProvider({ children }) {
    const [selectedPest, setSelectedPest] = useState(null);
    const [selectedPlagas, setSelectedPlagas] = useState([]);
    const [markerStyles, setMarkerStyles] = useState({}); // <- Nombre corregido

    return (
        <PestFilterContext.Provider value={{
            selectedPest,
            setSelectedPest,
            selectedPlagas,
            setSelectedPlagas,
            markerStyles,  // <- Asegúrate de que coincida
            setMarkerStyles
        }}>
            {children}
        </PestFilterContext.Provider>
    );
}

export default PestFilterContext;
