import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../../lib/utils'

function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      {children({ open, setOpen })}
    </div>
  )
}

function DropdownMenuTrigger({ children, open, setOpen, className, asChild }) {
  if (asChild) {
    return <div onClick={() => setOpen(!open)}>{children}</div>
  }
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn('inline-flex items-center justify-center', className)}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({ open, className, children, align = 'end', ...props }) {
  const alignments = {
    start: 'left-0', end: 'right-0', center: 'left-1/2 -translate-x-1/2'
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 mt-1 min-w-[12rem] rounded-xl border bg-popover text-popover-foreground shadow-lg overflow-hidden',
            alignments[align],
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DropdownMenuItem({ className, children, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('mx-1 my-1 h-px bg-border', className)} {...props} />
}

function DropdownMenuLabel({ className, children, ...props }) {
  return <div className={cn('px-3 py-2 text-sm font-semibold text-foreground', className)} {...props}>{children}</div>
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel }
