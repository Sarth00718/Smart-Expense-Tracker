const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Chart configuration
const width = 800;
const height = 400;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width, 
  height, 
  chartCallback,
  backgroundColour: 'white'
});

/**
 * Generate category pie chart
 */
async function generateCategoryPieChart(categoryData) {
  const labels = categoryData.map(item => item.category);
  const data = categoryData.map(item => item.total);
  
  const colors = [
    '#4361ee', '#7209b7', '#f72585', '#4cc9f0', 
    '#f8961e', '#38b000', '#ff006e', '#8338ec'
  ];

  const configuration = {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Expense Category Breakdown',
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          position: 'right',
          labels: { font: { size: 12 } }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Generate spending trend line chart
 */
async function generateSpendingTrendChart(trendData) {
  const labels = trendData.map(item => item.date);
  const data = trendData.map(item => item.amount);

  const configuration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Spending',
        data: data,
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#4361ee'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Spending Trend Over Time',
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount (₹)',
            font: { size: 14 }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            font: { size: 14 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Generate income vs expense bar chart
 */
async function generateIncomeVsExpenseChart(incomeTotal, expenseTotal) {
  const configuration = {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Savings'],
      datasets: [{
        label: 'Amount (₹)',
        data: [incomeTotal, expenseTotal, Math.max(0, incomeTotal - expenseTotal)],
        backgroundColor: ['#10b981', '#ef4444', '#4361ee'],
        borderWidth: 2,
        borderColor: ['#059669', '#dc2626', '#3730a3']
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Income vs Expenses Overview',
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount (₹)',
            font: { size: 14 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Generate monthly comparison chart
 */
async function generateMonthlyComparisonChart(monthlyData) {
  const labels = monthlyData.map(item => item.month);
  const incomeData = monthlyData.map(item => item.income);
  const expenseData = monthlyData.map(item => item.expense);

  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#10b981',
          borderWidth: 2,
          borderColor: '#059669'
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#ef4444',
          borderWidth: 2,
          borderColor: '#dc2626'
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Monthly Income vs Expenses',
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount (₹)',
            font: { size: 14 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

module.exports = {
  generateCategoryPieChart,
  generateSpendingTrendChart,
  generateIncomeVsExpenseChart,
  generateMonthlyComparisonChart
};
