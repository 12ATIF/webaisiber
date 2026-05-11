import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className, hover = false, onClick, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm',
        hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('mb-3', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('font-semibold text-slate-800 dark:text-slate-100', className)}>
      {children}
    </h3>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx(className)}>{children}</div>
}
