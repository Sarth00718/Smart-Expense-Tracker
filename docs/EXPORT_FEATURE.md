# Common Export Feature Documentation

## Overview

The Smart Expense Tracker now features a centralized **Common Export Component** that provides unified access to all export functionalities across the application. This component is globally accessible from the application header, positioned to the left of the profile icon.

## Features

### 1. Global Accessibility
- **Location**: Application header (left of profile icon)
- **Availability**: Accessible from all pages within the dashboard
- **Consistent UI**: Single, unified interface for all export operations

### 2. Export Types

#### Data Type Selection
- **All Data**: Complete financial data including expenses, income, budgets, and goals
- **Expenses Only**: Export only expense records
- **Income Only**: Export only income records

#### Export Formats

##### CSV Format
- Compatible with Excel, Google Sheets, and most spreadsheet applications
- Includes all transaction details
- Lightweight and easy to share

##### Excel Format
- Native Excel format (.xlsx)
- Multiple sheets for different data types
- Formatted with proper headers and styling
- Summary sheet with key statistics

##### JSON Format
- Raw data format for developers
- Complete data structure preservation
- Ideal for data analysis and migration

##### Comprehensive PDF Report (All Data Only)
- **Full financial report with visual analytics**
- Includes:
  - Executive summary with key metrics
  - Income vs Expense overview chart
  - Category breakdown pie chart
  - Spending trend line chart
  - Monthly comparison bar chart
  - Detailed category breakdown
  - Budget status and utilization
  - Savings goals progress
  - Recent transactions list
  - Professional formatting with page numbers

### 3. Date Range Filtering
- Optional date range selection
- Filter exports by start and end dates
- Leave empty to export all historical data

## Technical Implementation

### Frontend Components

#### CommonExport Component
**Location**: `client/src/components/common/CommonExport.jsx`

**Features**:
- Modal-based interface
- Date range picker
- Export type selector
- Format selection buttons
- Loading states and error handling
- Toast notifications for user feedback

#### Integration
The component is integrated into the Header component:
```jsx
import CommonExport from '../common/CommonExport'

// In Header component
<CommonExport />
```

### Backend API Endpoints

#### 1. Export Expenses
```
GET /api/export/expenses?format={csv|json}&startDate={date}&endDate={date}
```

#### 2. Export Income
```
GET /api/export/income?format={csv|json}&startDate={date}&endDate={date}
```

#### 3. Export All Data (JSON)
```
GET /api/export/all?format=json&startDate={date}&endDate={date}
```

#### 4. Export All Data (CSV)
```
GET /api/export/all-csv?startDate={date}&endDate={date}
```

#### 5. Comprehensive PDF Report
```
GET /api/export/comprehensive-pdf?startDate={date}&endDate={date}
```

### Chart Generation

**Library**: `chartjs-node-canvas`

**Charts Generated**:
1. **Category Pie Chart**: Expense distribution by category
2. **Spending Trend Chart**: Daily spending over time
3. **Income vs Expense Chart**: Financial overview comparison
4. **Monthly Comparison Chart**: Month-by-month income and expense trends

**Implementation**: `server/utils/chartGenerator.js`

### PDF Generation

**Library**: `pdfkit`

**Features**:
- Professional cover page
- Executive summary with key metrics
- Embedded chart images
- Detailed breakdowns
- Budget status tracking
- Goals progress monitoring
- Recent transactions
- Page numbers and footers

## Usage Guide

### For End Users

1. **Access Export**:
   - Click the "Export" button in the application header
   - Available on all dashboard pages

2. **Select Data Type**:
   - Choose "All Data" for complete export
   - Choose "Expenses Only" for expense records
   - Choose "Income Only" for income records

3. **Set Date Range** (Optional):
   - Enter start date and end date
   - Leave empty for all-time data

4. **Choose Format**:
   - Click CSV for spreadsheet compatibility
   - Click Excel for formatted multi-sheet workbook
   - Click JSON for raw data
   - Click Comprehensive PDF for visual report (All Data only)

5. **Download**:
   - File downloads automatically
   - Check your browser's download folder

### For Developers

#### Adding New Export Formats

1. **Update Export Service** (`client/src/services/exportService.js`):
```javascript
exportNewFormat: async (startDate, endDate) => {
  // Implementation
}
```

2. **Add Backend Route** (`server/routes/export.js`):
```javascript
router.get('/new-format', auth, async (req, res) => {
  // Implementation
});
```

3. **Update CommonExport Component**:
```jsx
<button onClick={() => handleExport('newFormat')}>
  New Format
</button>
```

#### Customizing PDF Report

Edit `server/routes/export.js` in the `/comprehensive-pdf` route:
- Modify chart configurations
- Add new sections
- Customize styling
- Change layout

#### Adding New Charts

1. Create chart generator in `server/utils/chartGenerator.js`:
```javascript
async function generateNewChart(data) {
  const configuration = {
    type: 'bar', // or 'line', 'pie', etc.
    data: { /* chart data */ },
    options: { /* chart options */ }
  };
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
```

2. Use in PDF generation route:
```javascript
const newChart = await generateNewChart(data);
doc.image(newChart, x, y, { width, height });
```

## Migration Notes

### Removed Components
- `DataExport` component from Settings page
- Export buttons from individual feature pages (Expenses, Analytics)

### Preserved Functionality
- All export capabilities maintained
- Enhanced with new PDF report feature
- Improved user experience with centralized access

## Performance Considerations

1. **Chart Generation**: Server-side rendering ensures consistent quality
2. **Large Datasets**: Pagination recommended for exports >10,000 records
3. **PDF Generation**: May take 5-10 seconds for comprehensive reports
4. **Memory Usage**: Chart generation requires adequate server memory

## Security

- All exports require authentication
- User can only export their own data
- Rate limiting applied to prevent abuse
- No sensitive data exposed in URLs

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Download functionality uses Blob API
- PDF viewing requires PDF reader

## Troubleshooting

### Export Not Working
- Check authentication status
- Verify date range format
- Ensure data exists for selected period

### PDF Generation Fails
- Check server logs for errors
- Verify chartjs-node-canvas installation
- Ensure sufficient server memory

### Charts Not Appearing
- Verify chart data is not empty
- Check chart generator configuration
- Review server console for errors

## Future Enhancements

- [ ] Scheduled exports (email reports)
- [ ] Custom report templates
- [ ] Export history tracking
- [ ] Batch export operations
- [ ] Cloud storage integration
- [ ] Export presets/favorites

## Support

For issues or questions:
1. Check server logs: `server/logs/`
2. Review browser console
3. Verify API responses
4. Contact development team

---

**Last Updated**: February 2026
**Version**: 2.0.0
