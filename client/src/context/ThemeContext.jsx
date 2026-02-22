import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Read persisted theme from localStorage, default to 'light'
        try {
            return localStorage.getItem('theme') || 'light'
        } catch {
            return 'light'
        }
    })

    // Apply / remove 'dark' class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        try {
            localStorage.setItem('theme', theme)
        } catch {
            // ignore storage errors
        }
    }, [theme])

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }, [])

    const setLightMode = useCallback(() => setTheme('light'), [])
    const setDarkMode = useCallback(() => setTheme('dark'), [])

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightMode,
        setDarkMode,
    }), [theme, toggleTheme, setLightMode, setDarkMode])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
