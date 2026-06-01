import api from './api'
import { INCOME } from '../config/apiEndpoints'

export const incomeService = {
  getAll: (params = {}) => {
    const { page = 1, limit = 50, startDate, endDate, source } = params
    return api.get(INCOME.BASE, { params: { page, limit, startDate, endDate, source } })
  },
  add:        (income)        => api.post(INCOME.BASE, income),
  update:     (id, income)    => api.put(INCOME.BY_ID(id), income),
  delete:     (id)            => api.delete(INCOME.BY_ID(id)),
  getSummary: ()              => api.get(INCOME.SUMMARY),
  getSources: ()              => api.get(INCOME.SOURCES),
}
