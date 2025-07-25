import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";
type ResolvedTheme = "light" | "dark";

type ThemeAccent = "neon" | "purple" | "electric" | "sunset" | "ocean";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: ThemeAccent;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  accent: ThemeAccent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: ThemeAccent) => void;
  toggleTheme: () => void;
  isAutoMode: boolean;
};

const initialState: ThemeProviderState = {
  theme: "light",
  resolvedTheme: "light",
  accent: "neon",
  setTheme: () => null,
  setAccent: () => null,
  toggleTheme: () => null,
  isAutoMode: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// GenZ-inspired accent color palettes
const accentColors = {
  neon: {
    primary: '#00ff88',
    secondary: '#00cc6a',
    gradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  },
  electric: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    gradient: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)',
  },
  sunset: {
    primary: '#f59e0b',
    secondary: '#d97706',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  ocean: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  },
};

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  defaultAccent = "neon",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );
  
  const [accent, setAccentState] = useState<ThemeAccent>(
    () => (localStorage.getItem("theme-accent") as ThemeAccent) || defaultAccent
  );

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Auto theme detection based on time or system preference
  const getAutoTheme = (): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    
    // Check system preference first
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    
    // Time-based auto switching (GenZ likes this)
    const now = new Date();
    const hour = now.getHours();
    
    // Dark mode from 8 PM to 7 AM
    if (hour >= 20 || hour < 7) {
      return "dark";
    }
    
    return "light";
  };

  // Apply theme and accent colors to CSS variables
  const applyTheme = (resolvedTheme: ResolvedTheme, accent: ThemeAccent) => {
    const root = window.document.documentElement;
    const accentConfig = accentColors[accent];
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    
    // Apply accent colors as CSS custom properties
    root.style.setProperty('--accent-primary', accentConfig.primary);
    root.style.setProperty('--accent-secondary', accentConfig.secondary);
    root.style.setProperty('--accent-gradient', accentConfig.gradient);
    
    // GenZ Dark Mode - True black for OLED screens
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--background-primary', '#0a0a0a');
      root.style.setProperty('--background-secondary', '#1a1a1a');
      root.style.setProperty('--background-tertiary', '#2a2a2a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0a0');
      root.style.setProperty('--border-color', '#333333');
    } else {
      // Light mode with high contrast
      root.style.setProperty('--background-primary', '#ffffff');
      root.style.setProperty('--background-secondary', '#f8fafc');
      root.style.setProperty('--background-tertiary', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--border-color', '#e2e8f0');
    }
  };

  // Handle theme changes
  useEffect(() => {
    const resolved = theme === "auto" ? getAutoTheme() : theme as ResolvedTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved, accent);
    
    // Listen for system theme changes in auto mode
    if (theme === "auto") {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newResolved = getAutoTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved, accent);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, accent]);

  // Auto theme timer for time-based switching
  useEffect(() => {
    if (theme !== "auto") return;
    
    const checkTime = () => {
      const newResolved = getAutoTheme();
      if (newResolved !== resolvedTheme) {
        setResolvedTheme(newResolved);
        applyTheme(newResolved, accent);
      }
    };
    
    // Check every minute for time-based changes
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [theme, resolvedTheme, accent]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  const setAccent = (newAccent: ThemeAccent) => {
    localStorage.setItem("theme-accent", newAccent);
    setAccentState(newAccent);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("auto");
    } else {
      setTheme("light");
    }
  };

  const value = {
    theme,
    resolvedTheme,
    accent,
    setTheme,
    setAccent,
    toggleTheme,
    isAutoMode: theme === "auto",
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

// Export accent colors for use in components
export { accentColors };
export type { ThemeAccent };
