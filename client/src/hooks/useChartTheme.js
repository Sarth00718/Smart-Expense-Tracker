import { useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

export const useChartTheme = () => {
  const { isDark } = useTheme()

  return useMemo(() => ({
    gridColor: isDark ? '#334155' : '#e5e7eb',
    axisColor: isDark ? '#94a3b8' : '#6b7280',
    tooltipStyle: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
      borderRadius: '8px',
      color: isDark ? '#f1f5f9' : '#111827'
    }
  }), [isDark])
}
