import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const config: Record<AlertVariant, { bg: string; border: string; title: string; icon: ReactNode }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    title: 'text-blue-800 dark:text-blue-300',
    icon: <Info className="w-5 h-5 text-blue-500" />,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    title: 'text-green-800 dark:text-green-300',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-800',
    title: 'text-yellow-800 dark:text-yellow-300',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    title: 'text-red-800 dark:text-red-300',
    icon: <XCircle className="w-5 h-5 text-red-500" />,
  },
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const c = config[variant]
  return (
    <div
      className={clsx(
        'flex gap-3 rounded-xl border p-4',
        c.bg,
        c.border,
        className,
      )}
    >
      <div className="shrink-0 mt-0.5">{c.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className={clsx('font-semibold text-sm mb-1', c.title)}>{title}</p>}
        <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
