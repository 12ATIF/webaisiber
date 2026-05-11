import { Link2, Image, Clock, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import type { ScanRecord } from '../utils/types'

interface ScanCardProps {
  result: ScanRecord
  onClick?: () => void
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

const badgeVariant = {
  safe: 'success' as const,
  suspicious: 'warning' as const,
  danger: 'danger' as const,
}

const badgeLabel = {
  safe: 'Aman',
  suspicious: 'Mencurigakan',
  danger: 'Berbahaya',
}

const scoreColor = {
  safe: 'text-green-600 dark:text-green-400',
  suspicious: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
}

export function ScanCard({ result, onClick }: ScanCardProps) {
  return (
    <Card hover onClick={onClick} className="animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div
          className={clsx(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            result.type === 'link'
              ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
          )}
        >
          {result.type === 'link' ? (
            <Link2 className="w-5 h-5" />
          ) : (
            <Image className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
              {result.input}
            </p>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={badgeVariant[result.riskLevel]}>
              {badgeLabel[result.riskLevel]}
            </Badge>
            <span className={clsx('text-sm font-bold', scoreColor[result.riskLevel])}>
              {result.riskScore}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(result.timestamp)}
            </span>
            {result.platform && (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {result.platform}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
