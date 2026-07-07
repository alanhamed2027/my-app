import React, { createContext, useContext, useState, useEffect } from 'react';

const SystemContext = createContext();

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
  const [systemType, setSystemType] = useState(() => {
    // Default to INTERNAL if not found
    return localStorage.getItem('systemType') || 'INTERNAL';
  });

  useEffect(() => {
    localStorage.setItem('systemType', systemType);
    
    // Apply theming to body
    if (systemType === 'EXTERNAL') {
      document.body.classList.add('theme-external');
    } else {
      document.body.classList.remove('theme-external');
    }
  }, [systemType]);

  const switchSystem = (type) => {
    setSystemType(type);
  };

  return (
    <SystemContext.Provider value={{ systemType, switchSystem }}>
      {children}
    </SystemContext.Provider>
  );
};
