import api from './api';

export const reportService = {
  // Download PDF report
  downloadPDF: async (params = {}) => {
    const { startDate, endDate } = params;
    const response = await api.get('/reports/pdf', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial-report-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  }
};
