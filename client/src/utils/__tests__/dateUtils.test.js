/**
 * Tests for date utilities
 * Run with: npm test dateUtils.test.js
 */

import { toLocalISOString, toLocalDateInputValue, getTodayInputValue, formatLocalDate } from '../dateUtils'

describe('Date Utilities', () => {
  describe('toLocalISOString', () => {
    it('should convert YYYY-MM-DD to local ISO string', () => {
      const result = toLocalISOString('2026-08-04')
      const date = new Date(result)
      
      // Should be August 4th in local timezone
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(7) // 0-indexed, so 7 = August
      expect(date.getDate()).toBe(4)
    })

    it('should handle edge case: year boundary', () => {
      const result = toLocalISOString('2026-01-01')
      const date = new Date(result)
      
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(1)
    })

    it('should return today if no date provided', () => {
      const result = toLocalISOString('')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  describe('toLocalDateInputValue', () => {
    it('should convert ISO string to YYYY-MM-DD', () => {
      const isoString = '2026-08-04T10:30:00.000Z'
      const result = toLocalDateInputValue(isoString)
      
      // Should extract local date components
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.length).toBe(10)
    })

    it('should handle empty string', () => {
      const result = toLocalDateInputValue('')
      expect(result).toBe('')
    })

    it('should handle null', () => {
      const result = toLocalDateInputValue(null)
      expect(result).toBe('')
    })
  })

  describe('getTodayInputValue', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const result = getTodayInputValue()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      
      expect(result).toBe(`${year}-${month}-${day}`)
    })
  })

  describe('formatLocalDate', () => {
    it('should format date with default format', () => {
      const isoString = '2026-08-04T10:30:00.000Z'
      const result = formatLocalDate(isoString)
      
      // Default format is 'MMM dd, yyyy'
      expect(result).toMatch(/[A-Z][a-z]{2} \d{2}, \d{4}/)
    })

    it('should handle custom format', () => {
      const isoString = '2026-08-04T10:30:00.000Z'
      const result = formatLocalDate(isoString, 'yyyy-MM-dd')
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return empty string for invalid input', () => {
      const result = formatLocalDate('')
      expect(result).toBe('')
    })
  })

  describe('Timezone consistency', () => {
    it('should maintain date across timezone boundaries', () => {
      const inputDate = '2026-08-04'
      
      // Convert to ISO and back
      const iso = toLocalISOString(inputDate)
      const parsed = new Date(iso)
      const back = toLocalDateInputValue(iso)
      
      // Should be the same date
      expect(back).toBe(inputDate)
    })

    it('should work correctly for EST timezone edge case', () => {
      // Simulate the bug scenario
      const inputDate = '2026-08-04'
      const iso = toLocalISOString(inputDate)
      
      // Parse and verify it's still Aug 4, not Aug 3
      const parsed = new Date(iso)
      expect(parsed.getDate()).toBe(4)
    })
  })
})
