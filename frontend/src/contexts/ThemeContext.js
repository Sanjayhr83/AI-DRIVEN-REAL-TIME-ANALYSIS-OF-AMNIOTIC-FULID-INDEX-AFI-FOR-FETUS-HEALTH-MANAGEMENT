import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get saved theme from localStorage or default to 'light'
    const savedMode = localStorage.getItem('theme');
    return savedMode || 'light';
  });

  useEffect(() => {
    // Save theme preference to localStorage whenever it changes
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode: mode,
      ...(mode === 'light'
        ? {
            // Light mode colors - Modern Indigo & Purple
            primary: {
              main: '#6366f1',
              light: '#818cf8',
              dark: '#4f46e5',
            },
            secondary: {
              main: '#8b5cf6',
              light: '#a78bfa',
              dark: '#7c3aed',
            },
            success: {
              main: '#10b981',
              light: '#6ee7b7',
              dark: '#059669',
            },
            warning: {
              main: '#f59e0b',
              light: '#fcd34d',
              dark: '#d97706',
            },
            error: {
              main: '#ef4444',
              light: '#fca5a5',
              dark: '#dc2626',
            },
            background: {
              default: '#f9fafb',
              paper: '#ffffff',
            },
            text: {
              primary: '#111827',
              secondary: '#6b7280',
            },
          }
        : {
            // Dark mode colors
            primary: {
              main: '#818cf8',
              light: '#a5b4fc',
              dark: '#6366f1',
            },
            secondary: {
              main: '#a78bfa',
              light: '#d8b4fe',
              dark: '#8b5cf6',
            },
            success: {
              main: '#6ee7b7',
              light: '#a7f3d0',
              dark: '#10b981',
            },
            warning: {
              main: '#fcd34d',
              light: '#fef08a',
              dark: '#f59e0b',
            },
            error: {
              main: '#fca5a5',
              light: '#fecaca',
              dark: '#ef4444',
            },
            background: {
              default: '#0f172a',
              paper: '#1e293b',
            },
            text: {
              primary: '#f1f5f9',
              secondary: '#cbd5e1',
            },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundImage: 'none',
            }),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
          },
          contained: {
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' ? '1px solid #f0f4ff' : '1px solid #334155',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light' 
                ? '0 20px 25px -5px rgba(99, 102, 241, 0.12)'
                : '0 20px 25px -5px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

