import { memo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../../../../hooks/useChartTheme'

const CategoryRadarChart = memo(({ data }) => {
  const { gridColor, axisColor, tooltipStyle } = useChartTheme()

  return (
    <ResponsiveContainer width="99%" height="100%" minWidth={200} minHeight={256}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: axisColor }} />
        <PolarRadiusAxis tick={{ fontSize: 11, fill: axisColor }} />
        <Radar name="Spending" dataKey="value" stroke="#4361ee" fill="#4361ee" fillOpacity={0.6} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  )
})

CategoryRadarChart.displayName = 'CategoryRadarChart'

export default CategoryRadarChart
