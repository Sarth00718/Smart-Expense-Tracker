/**
 * Tests for event bus
 * Run with: npm test eventBus.test.js
 */

import { eventBus, Events } from '../eventBus'

describe('Event Bus', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    eventBus.clear()
  })

  describe('on/emit', () => {
    it('should emit and receive events', () => {
      const mockCallback = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_CREATED, { id: '123', amount: 500 })
      
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith({ id: '123', amount: 500 })
    })

    it('should support multiple listeners for same event', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback1)
      eventBus.on(Events.EXPENSE_CREATED, mockCallback2)
      eventBus.emit(Events.EXPENSE_CREATED, { id: '123' })
      
      expect(mockCallback1).toHaveBeenCalledTimes(1)
      expect(mockCallback2).toHaveBeenCalledTimes(1)
    })

    it('should not trigger wrong event listeners', () => {
      const mockCallback = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_DELETED, { id: '123' })
      
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('off', () => {
    it('should unsubscribe from events', () => {
      const mockCallback = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_CREATED, {})
      expect(mockCallback).toHaveBeenCalledTimes(1)
      
      eventBus.off(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_CREATED, {})
      
      expect(mockCallback).toHaveBeenCalledTimes(1) // Still 1, not 2
    })

    it('should return unsubscribe function', () => {
      const mockCallback = jest.fn()
      
      const unsubscribe = eventBus.on(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_CREATED, {})
      expect(mockCallback).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      eventBus.emit(Events.EXPENSE_CREATED, {})
      
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('once', () => {
    it('should only trigger once', () => {
      const mockCallback = jest.fn()
      
      eventBus.once(Events.EXPENSE_CREATED, mockCallback)
      eventBus.emit(Events.EXPENSE_CREATED, {})
      eventBus.emit(Events.EXPENSE_CREATED, {})
      eventBus.emit(Events.EXPENSE_CREATED, {})
      
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('clear', () => {
    it('should clear all listeners for specific event', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback1)
      eventBus.on(Events.EXPENSE_UPDATED, mockCallback2)
      
      eventBus.clear(Events.EXPENSE_CREATED)
      
      eventBus.emit(Events.EXPENSE_CREATED, {})
      eventBus.emit(Events.EXPENSE_UPDATED, {})
      
      expect(mockCallback1).not.toHaveBeenCalled()
      expect(mockCallback2).toHaveBeenCalledTimes(1)
    })

    it('should clear all listeners when no event specified', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback1)
      eventBus.on(Events.EXPENSE_UPDATED, mockCallback2)
      
      eventBus.clear()
      
      eventBus.emit(Events.EXPENSE_CREATED, {})
      eventBus.emit(Events.EXPENSE_UPDATED, {})
      
      expect(mockCallback1).not.toHaveBeenCalled()
      expect(mockCallback2).not.toHaveBeenCalled()
    })
  })

  describe('listenerCount', () => {
    it('should return correct listener count', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      expect(eventBus.listenerCount(Events.EXPENSE_CREATED)).toBe(0)
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback1)
      expect(eventBus.listenerCount(Events.EXPENSE_CREATED)).toBe(1)
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback2)
      expect(eventBus.listenerCount(Events.EXPENSE_CREATED)).toBe(2)
      
      eventBus.off(Events.EXPENSE_CREATED, mockCallback1)
      expect(eventBus.listenerCount(Events.EXPENSE_CREATED)).toBe(1)
    })
  })

  describe('Error handling', () => {
    it('should handle errors in listeners without crashing', () => {
      const mockCallback1 = jest.fn(() => {
        throw new Error('Test error')
      })
      const mockCallback2 = jest.fn()
      
      eventBus.on(Events.EXPENSE_CREATED, mockCallback1)
      eventBus.on(Events.EXPENSE_CREATED, mockCallback2)
      
      // Should not throw
      expect(() => {
        eventBus.emit(Events.EXPENSE_CREATED, {})
      }).not.toThrow()
      
      // Second callback should still execute
      expect(mockCallback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle AI expense categorization flow', () => {
      const expenseContextRefresh = jest.fn()
      const analyticsUpdate = jest.fn()
      
      // Multiple components listening
      eventBus.on(Events.AI_EXPENSE_CATEGORIZED, expenseContextRefresh)
      eventBus.on(Events.AI_EXPENSE_CATEGORIZED, analyticsUpdate)
      
      // AI categorizes an expense
      eventBus.emit(Events.AI_EXPENSE_CATEGORIZED, {
        conversationId: 'abc123',
        timestamp: new Date()
      })
      
      // Both should be notified
      expect(expenseContextRefresh).toHaveBeenCalledTimes(1)
      expect(analyticsUpdate).toHaveBeenCalledTimes(1)
    })

    it('should prevent memory leaks with proper cleanup', () => {
      const mockCallback = jest.fn()
      
      const unsubscribe = eventBus.on(Events.EXPENSE_CREATED, mockCallback)
      
      // Simulate component mount/unmount cycle
      eventBus.emit(Events.EXPENSE_CREATED, {})
      expect(mockCallback).toHaveBeenCalledTimes(1)
      
      // Component unmounts - cleanup
      unsubscribe()
      
      // New events should not trigger old listener
      eventBus.emit(Events.EXPENSE_CREATED, {})
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event constants', () => {
    it('should have all required event types defined', () => {
      expect(Events.EXPENSE_CREATED).toBeDefined()
      expect(Events.EXPENSE_UPDATED).toBeDefined()
      expect(Events.EXPENSE_DELETED).toBeDefined()
      expect(Events.EXPENSES_BULK_UPDATE).toBeDefined()
      expect(Events.AI_EXPENSE_CATEGORIZED).toBeDefined()
      expect(Events.INCOME_CREATED).toBeDefined()
    })

    it('should use consistent naming pattern', () => {
      Object.values(Events).forEach(eventName => {
        expect(eventName).toMatch(/^[a-z]+:[a-z-]+$/)
      })
    })
  })
})
