import api from './api'
import { EXPENSES } from '../config/apiEndpoints'
import { throttleRequest } from '../utils/requestDebounce'

const throttledGetExpenses = throttleRequest((params) => api.get(EXPENSES.BASE, { params }), 2000)
const throttledGetSummary  = throttleRequest(() => api.get(EXPENSES.SUMMARY), 5000)

export const expenseService = {
  getExpenses:       (params) => throttledGetExpenses(params),
  getAll:            ()       => api.get(EXPENSES.BASE),
  add:               (expense)         => api.post(EXPENSES.BASE, expense),
  update:            (id, expense)     => api.put(EXPENSES.BY_ID(id), expense),
  delete:            (id)              => api.delete(EXPENSES.BY_ID(id)),
  deleteAll:         ()                => api.delete(EXPENSES.BASE),
  filter:            (params)          => api.get(EXPENSES.FILTER, { params }),
  search:            (query)           => api.post(EXPENSES.SEARCH, { query }),
  getCategories:     ()                => api.get(EXPENSES.CATEGORIES),
  getSummary:        ()                => throttledGetSummary(),
  getRecent:         (limit)           => api.get(EXPENSES.RECENT(limit)),
}
