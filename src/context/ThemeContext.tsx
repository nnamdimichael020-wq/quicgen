import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';
type ThemeContextValue = { theme: Theme; toggleTheme: () => void; setTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('quicgen-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* The app still works when browser storage is disabled. */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
    try { localStorage.setItem('quicgen-theme', theme); } catch { /* storage is optional */ }
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key === 'quicgen-theme' && (event.newValue === 'dark' || event.newValue === 'light'))) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => setTheme((current) => current === 'dark' ? 'light' : 'dark'), []);
  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
