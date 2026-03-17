import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../../../../hooks/useChartTheme'

const WeeklySpendingChart = memo(({ data }) => {
  const { gridColor, axisColor, tooltipStyle } = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="amount" fill="#7209b7" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})

WeeklySpendingChart.displayName = 'WeeklySpendingChart'

export default WeeklySpendingChart
