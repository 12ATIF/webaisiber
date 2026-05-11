import { useCountUp } from '../hooks/useCountUp'
import { clsx } from 'clsx'
import type { RiskLevel } from '../utils/types'

interface RiskScoreProps {
  score: number
  level: RiskLevel
  size?: 'sm' | 'lg'
}

const levelConfig = {
  safe: {
    label: 'AMAN',
    color: 'text-green-600 dark:text-green-400',
    ring: 'stroke-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    pulse: 'bg-green-400',
  },
  suspicious: {
    label: 'MENCURIGAKAN',
    color: 'text-yellow-600 dark:text-yellow-400',
    ring: 'stroke-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    pulse: 'bg-yellow-400',
  },
  danger: {
    label: 'BAHAYA',
    color: 'text-red-600 dark:text-red-400',
    ring: 'stroke-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    pulse: 'bg-red-400',
  },
}

export function RiskScore({ score, level, size = 'lg' }: RiskScoreProps) {
  const displayed = useCountUp(score)
  const cfg = levelConfig[level]

  const r = size === 'lg' ? 54 : 36
  const cx = size === 'lg' ? 64 : 44
  const circumference = 2 * Math.PI * r
  const progress = (displayed / 100) * circumference

  return (
    <div className={clsx('flex flex-col items-center gap-4 animate-count-up')}>
      <div className="relative inline-flex">
        {/* Pulse ring for danger */}
        {level === 'danger' && (
          <span
            className={clsx(
              'absolute inset-0 rounded-full opacity-30 animate-pulse-ring',
              cfg.pulse,
            )}
          />
        )}

        <svg
          width={cx * 2}
          height={cx * 2}
          viewBox={`0 0 ${cx * 2} ${cx * 2}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            strokeWidth={size === 'lg' ? 8 : 6}
            className="stroke-slate-100 dark:stroke-slate-700"
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            strokeWidth={size === 'lg' ? 8 : 6}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={clsx(cfg.ring, 'transition-all duration-300')}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={clsx(
              'font-extrabold leading-none',
              size === 'lg' ? 'text-4xl' : 'text-2xl',
              cfg.color,
            )}
          >
            {displayed}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Label badge */}
      <div
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-full border',
          cfg.bg,
          cfg.border,
        )}
      >
        <span className={clsx('w-2 h-2 rounded-full', cfg.pulse)} />
        <span className={clsx('text-sm font-bold tracking-wide', cfg.color)}>
          {cfg.label}
        </span>
      </div>
    </div>
  )
}
