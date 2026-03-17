import { memo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../../../../hooks/useChartTheme'

const SpendingTrendChart = memo(({ data }) => {
  const { gridColor, axisColor, tooltipStyle } = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="amount" stroke="#4361ee" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
      </AreaChart>
    </ResponsiveContainer>
  )
})

SpendingTrendChart.displayName = 'SpendingTrendChart'

export default SpendingTrendChart
