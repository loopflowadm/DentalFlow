import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const defaultTheme = {
  name: 'DentalFlow',
  primary_color: '#03269A',    // Deep Navy Blue
  secondary_color: '#196BFB',  // Electric Blue
  accent_color: '#D9E2FF',     // Ice Blue
  logo_url: '',
};

// Função para converter hexadecimal em formato RGB para o Tailwind CSS (r g b)
function hexToRgb(hex) {
  if (!hex) return null;
  const cleanHex = hex.replace(/^#/, '');
  let r, g, b;
  
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

// Função para escurecer ou clarear uma cor hexadecimal
function adjustColorBrightness(hex, percent) {
  if (!hex) return hex;
  const cleanHex = hex.replace(/^#/, '');
  let R = parseInt(cleanHex.substring(0, 2), 16);
  let G = parseInt(cleanHex.substring(2, 4), 16);
  let B = parseInt(cleanHex.substring(4, 6), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;  
  G = (G < 255) ? G : 255;  
  B = (B < 255) ? B : 255;  

  R = (R > 0) ? R : 0;  
  G = (G > 0) ? G : 0;  
  B = (B > 0) ? B : 0;  

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export function ThemeProvider({ children }) {
  const [clinicTheme, setClinicTheme] = useState(defaultTheme);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme-mode-three') || 'clinic';
  });

  const applyTheme = useCallback((theme) => {
    if (!theme) return;
    setClinicTheme(prev => {
      if (
        prev.name === theme.name &&
        prev.primary_color === theme.primary_color &&
        prev.secondary_color === theme.secondary_color &&
        prev.logo_url === theme.logo_url &&
        prev.accent_color === theme.accent_color &&
        prev.theme_base === theme.theme_base
      ) {
        return prev;
      }
      return { ...defaultTheme, ...prev, ...theme };
    });
  }, []);

  const resetTheme = useCallback(() => {
    setClinicTheme(prev => {
      if (
        prev.name === defaultTheme.name &&
        prev.primary_color === defaultTheme.primary_color &&
        prev.secondary_color === defaultTheme.secondary_color &&
        prev.logo_url === defaultTheme.logo_url
      ) {
        return prev;
      }
      return defaultTheme;
    });
  }, []);

  // Recalcular o tema atual quando mudar o modo do tema ou o tema da clínica
  const currentTheme = useMemo(() => {
    let activeTheme;

    if (themeMode === 'light') {
      activeTheme = {
        ...clinicTheme,
        primary_color: '#03269A',
        secondary_color: '#196BFB',
        accent_color: '#D9E2FF',
        sidebar_bg_1: '#ffffff',
        sidebar_bg_2: '#f8fafc',
        body_bg: '#f8fafc'
      };
    } else if (themeMode === 'dark') {
      activeTheme = {
        ...clinicTheme,
        primary_color: '#000000',
        secondary_color: '#196BFB',
        accent_color: '#18181B',
        sidebar_bg_1: '#0A0A0A',
        sidebar_bg_2: '#121212',
        body_bg: '#000000'
      };
    } else {
      // 'clinic'
      const isClinicDark = clinicTheme.theme_base === 'dark';
      
      let finalBodyBg;
      let finalSidebar1;
      let finalSidebar2;
      
      if (isClinicDark) {
        finalBodyBg = '#000000';
        finalSidebar1 = adjustColorBrightness(clinicTheme.primary_color, -70);
        finalSidebar2 = adjustColorBrightness(clinicTheme.primary_color, -85);
      } else {
        finalBodyBg = '#f8fafc';
        finalSidebar1 = '#ffffff';
        finalSidebar2 = '#f8fafc';
      }

      activeTheme = {
        ...clinicTheme,
        sidebar_bg_1: finalSidebar1,
        sidebar_bg_2: finalSidebar2,
        body_bg: finalBodyBg
      };
    }

    return activeTheme;
  }, [themeMode, clinicTheme]);

  // Efeito reativo para aplicar modificações de DOM baseadas no tema
  useEffect(() => {
    // Injetar variáveis no document Element
    const primaryRGB = hexToRgb(currentTheme.primary_color);
    const secondaryRGB = hexToRgb(currentTheme.secondary_color);
    const accentRGB = hexToRgb(currentTheme.accent_color || '#D9E2FF');
    const sidebarBg1RGB = hexToRgb(currentTheme.sidebar_bg_1);
    const sidebarBg2RGB = hexToRgb(currentTheme.sidebar_bg_2);
    const backgroundRGB = hexToRgb(currentTheme.body_bg);

    if (primaryRGB) {
      document.documentElement.style.setProperty('--color-primary', primaryRGB);
    }
    if (secondaryRGB) {
      document.documentElement.style.setProperty('--color-secondary', secondaryRGB);
    }
    if (accentRGB) {
      document.documentElement.style.setProperty('--color-accent', accentRGB);
    }

    // Injetar variáveis de fundo e sidebar
    document.documentElement.style.setProperty('--sidebar-bg-1', sidebarBg1RGB || '10 10 10');
    document.documentElement.style.setProperty('--sidebar-bg-2', sidebarBg2RGB || '18 18 18');
    document.documentElement.style.setProperty('--color-background', backgroundRGB || '248 250 252');

    // Injetar fonte do Google Fonts dinamicamente
    if (currentTheme.font_family) {
      const fontId = 'whitelabel-google-font';
      let fontLink = document.getElementById(fontId);
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = fontId;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      const formattedFont = currentTheme.font_family.replace(/ /g, '+');
      fontLink.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700;800;900&display=swap`;
      document.documentElement.style.fontFamily = `"${currentTheme.font_family}", sans-serif`;
    }

    // Sincronizar Favicon dinamicamente
    if (currentTheme.favicon_url) {
      let faviconLink = document.querySelector("link[rel~='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = currentTheme.favicon_url;
    }

    // Atualizar o título do documento para a marca do cliente
    if (currentTheme.name) {
      document.title = currentTheme.name;
    }

    // Toggle da classe dark
    const isDark = themeMode === 'dark' || (themeMode === 'clinic' && clinicTheme.theme_base === 'dark');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme-mode-three', themeMode);
  }, [currentTheme, themeMode, clinicTheme.theme_base]);

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, resetTheme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
