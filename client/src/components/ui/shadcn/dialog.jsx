import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../../lib/utils'

function Dialog({ open, onClose, children, className, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const sizes = {
    sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[95vw]'
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
            ref={overlayRef}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full bg-background border rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto',
              sizes[size],
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function DialogHeader({ className, children, onClose, ...props }) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b', className)} {...props}>
      <div>{children}</div>
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function DialogTitle({ className, children, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>{children}</h2>
}

function DialogDescription({ className, children, ...props }) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>{children}</p>
}

function DialogContent({ className, children, ...props }) {
  return <div className={cn('px-6 py-4', className)} {...props}>{children}</div>
}

function DialogFooter({ className, children, ...props }) {
  return <div className={cn('flex items-center justify-end gap-3 px-6 py-4 border-t', className)} {...props}>{children}</div>
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter }
