/**
 * Centralized error handling utilities
 * Provides consistent error responses across the application
 */

/**
 * Standard error response format
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyPattern)[0]
  const value = error.keyValue[field]
  return new AppError(
    `${field} '${value}' already exists`,
    400,
    { field, value }
  )
}

/**
 * Handle MongoDB validation errors
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message
  }))
  return new AppError(
    'Validation failed',
    400,
    { errors }
  )
}

/**
 * Handle MongoDB cast errors
 */
const handleCastError = (error) => {
  return new AppError(
    `Invalid ${error.path}: ${error.value}`,
    400,
    { field: error.path, value: error.value }
  )
}

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401)
}

const handleJWTExpiredError = () => {
  return new AppError('Token expired. Please log in again', 401)
}

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: err,
    message: err.message,
    details: err.details,
    stack: err.stack
  })
}

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details && { details: err.details })
    })
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
  }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message
  error.statusCode = err.statusCode || 500

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err)
  }

  // Handle specific error types
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err)
  }
  
  if (err.name === 'ValidationError') {
    error = handleValidationError(err)
  }
  
  if (err.name === 'CastError') {
    error = handleCastError(err)
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError()
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError()
  }

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res)
  } else {
    sendErrorProd(error, res)
  }
}

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

/**
 * Success response helper
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  })
}

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
  sendSuccess
}
