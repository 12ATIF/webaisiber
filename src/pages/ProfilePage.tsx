import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Clock, Trash2, Filter, Link2, Image,
  TrendingUp, CheckCircle, AlertTriangle, XCircle,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { ScanCard } from '../components/ScanCard'
import { useApp } from '../context/AppContext'
import { securityTips } from '../data/mockData'
import type { RiskLevel } from '../utils/types'

type FilterLevel = 'all' | RiskLevel

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const history = state.scanHistory.filter(s =>
    filterLevel === 'all' ? true : s.riskLevel === filterLevel,
  )

  const stats = {
    total: state.scanHistory.length,
    danger: state.scanHistory.filter(s => s.riskLevel === 'danger').length,
    suspicious: state.scanHistory.filter(s => s.riskLevel === 'suspicious').length,
    safe: state.scanHistory.filter(s => s.riskLevel === 'safe').length,
  }

  const filters: { value: FilterLevel; label: string; color: string }[] = [
    { value: 'all', label: 'Semua', color: 'text-slate-600' },
    { value: 'danger', label: 'Berbahaya', color: 'text-red-600' },
    { value: 'suspicious', label: 'Mencurigakan', color: 'text-yellow-600' },
    { value: 'safe', label: 'Aman', color: 'text-green-600' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Riwayat & Profil
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Semua aktivitas scan dan hasil analisis kamu.
          </p>
        </div>
        <Button
          onClick={() => navigate('/analyze')}
          icon={<Shield className="w-4 h-4" />}
        >
          Scan Baru
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Scan', value: stats.total, icon: TrendingUp, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
          { label: 'Berbahaya', value: stats.danger, icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
          { label: 'Mencurigakan', value: stats.suspicious, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400' },
          { label: 'Aman', value: stats.safe, icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
        ].map(stat => (
          <Card key={stat.label} className="text-center">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Scan History */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Timeline Scan
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilterLevel(f.value)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    filterLevel === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((scan, i) => (
              <div key={scan.id} className={clsx('animate-fade-in', `delay-${i * 100}`)}>
                {/* Date separator */}
                {(i === 0 || formatDate(scan.timestamp).split(',')[0] !== formatDate(history[i - 1].timestamp).split(',')[0]) && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-xs text-slate-400 font-medium px-2">
                      {formatDate(scan.timestamp).split(',')[0]}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                )}
                <ScanCard
                  result={scan}
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_RESULT', payload: scan })
                    navigate('/result')
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
              {filterLevel === 'all' ? 'Riwayat scan kosong' : `Tidak ada scan dengan status "${filterLevel}"`}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Mulai analisis untuk membangun riwayat scan kamu.
            </p>
            <Button size="sm" onClick={() => navigate('/analyze')}>
              Analisis Sekarang
            </Button>
          </Card>
        )}

        {/* Clear history */}
        {state.scanHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {showClearConfirm ? (
              <Alert variant="warning" title="Hapus semua riwayat?" className="mb-3">
                Tindakan ini tidak dapat dibatalkan.{' '}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'CLEAR_HISTORY' })
                      setShowClearConfirm(false)
                    }}
                  >
                    Ya, Hapus
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Batal
                  </Button>
                </div>
              </Alert>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus semua riwayat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Educational tips */}
      <section>
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">
          Tips Edukasi Keamanan Digital
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {securityTips.map(tip => (
            <Card key={tip.id} className="border-l-4 border-l-blue-500">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">
                {tip.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {tip.body}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
