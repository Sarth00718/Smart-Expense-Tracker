import { memo } from 'react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { CHART_COLORS } from '../../../../constants/categories'

const CategoryPieChart = memo(({ data }) => {
  const { tooltipStyle } = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={window.innerWidth < 640 ? 60 : 90}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </RechartsPie>
    </ResponsiveContainer>
  )
})

CategoryPieChart.displayName = 'CategoryPieChart'

export default CategoryPieChart
