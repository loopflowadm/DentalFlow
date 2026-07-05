import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const defaultTheme = {
  name: 'ODONTO CRM',
  primary_color: '#03269A',    // Deep Navy Blue
  secondary_color: '#196BFB',  // Electric Blue
  accent_color: '#D9E2FF',     // Ice Blue
  logo_url: '',
};

// Função para converter hexadecimal em formato RGB para o Tailwind CSS (r g b)
function hexToRgb(hex) {
  if (!hex) return null;
  const cleanHex = hex.replace(/^#/, '');
  let r = 0, g = 0, b = 0;
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return null;
  }
  
  return `${r} ${g} ${b}`;
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved ? saved === 'dark' : true; // Default to dark theme as active
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const applyTheme = (theme) => {
    const updatedTheme = { ...defaultTheme, ...theme };
    setCurrentTheme(updatedTheme);

    // Injetar variáveis no document Element
    const primaryRGB = hexToRgb(updatedTheme.primary_color);
    const secondaryRGB = hexToRgb(updatedTheme.secondary_color);
    const accentRGB = hexToRgb(updatedTheme.accent_color || '#6366f1');

    if (primaryRGB) {
      document.documentElement.style.setProperty('--color-primary', primaryRGB);
    }
    if (secondaryRGB) {
      document.documentElement.style.setProperty('--color-secondary', secondaryRGB);
    }
    if (accentRGB) {
      document.documentElement.style.setProperty('--color-accent', accentRGB);
    }

    // Atualizar o título do documento para a marca do cliente
    if (updatedTheme.name) {
      document.title = updatedTheme.name;
    }
  };

  const resetTheme = () => {
    applyTheme(defaultTheme);
  };

  // Carregar tema inicial e sincronizar com o estado darkMode
  useEffect(() => {
    applyTheme(defaultTheme);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, resetTheme, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
