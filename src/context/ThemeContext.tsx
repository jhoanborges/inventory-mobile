import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import {useColorScheme} from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const {setColorScheme} = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      const mode = stored === 'dark' ? 'dark' : 'light';
      setTheme(mode);
      setColorScheme(mode);
    });
  }, [setColorScheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      setColorScheme(next);
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, [setColorScheme]);

  return (
    <ThemeContext.Provider value={{theme, toggleTheme, isDark: theme === 'dark'}}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
