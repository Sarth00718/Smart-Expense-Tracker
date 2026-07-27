import { memo } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../../../../hooks/useChartTheme'

const MonthlyComparisonChart = memo(({ data }) => {
  const { gridColor, axisColor, tooltipStyle } = useChartTheme()

  return (
    <ResponsiveContainer width="99%" height="100%" minWidth={200} minHeight={256}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="income" fill="#38b000" name="Income" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expenses" fill="#f72585" name="Expenses" radius={[8, 8, 0, 0]} />
        <Line type="monotone" dataKey="savings" stroke="#4361ee" strokeWidth={3} name="Savings" />
      </ComposedChart>
    </ResponsiveContainer>
  )
})

MonthlyComparisonChart.displayName = 'MonthlyComparisonChart'

export default MonthlyComparisonChart
