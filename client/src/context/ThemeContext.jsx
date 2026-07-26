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
            const savedTheme = localStorage.getItem('theme')
            return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'
        } catch {
            return 'light'
        }
    })

    // Apply / remove 'dark' class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement
        
        // Remove both classes first to ensure clean state
        root.classList.remove('dark', 'light')
        
        // Add the current theme class
        if (theme === 'dark') {
            root.classList.add('dark')
        }
        
        // Persist to localStorage
        try {
            localStorage.setItem('theme', theme)
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error)
        }
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#5B5FED')
        }
    }, [theme])

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light'
            return newTheme
        })
    }, [])

    const setLightMode = useCallback(() => {
        setTheme('light')
    }, [])
    
    const setDarkMode = useCallback(() => {
        setTheme('dark')
    }, [])

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightMode,
        setDarkMode,
    }), [theme, toggleTheme, setLightMode, setDarkMode])

    // Debug logging (can be removed in production)
    useEffect(() => {
        console.log('[ThemeProvider] Current theme:', theme, '| isDark:', theme === 'dark')
    }, [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
