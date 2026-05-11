import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Flag, Search, Users, MessageSquare, Mail, Smartphone } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { mockCommunityReports, trendingScamTopics } from '../data/mockData'
import type { CommunityReport } from '../data/mockData'

type PlatformFilter = 'All' | CommunityReport['platform']

const platforms: PlatformFilter[] = ['All', 'WhatsApp', 'SMS', 'Email', 'Instagram', 'Telegram']

const platformIcons: Record<string, typeof MessageSquare> = {
  WhatsApp: MessageSquare,
  SMS: Smartphone,
  Email: Mail,
  Instagram: Users,
  Telegram: MessageSquare,
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

export function CommunityPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<PlatformFilter>('All')
  const [search, setSearch] = useState('')

  const filtered = mockCommunityReports.filter(r => {
    const matchPlatform = filter === 'All' || r.platform === filter
    const matchSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    return matchPlatform && matchSearch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Komunitas Laporan Penipuan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Laporan dari sesama pengguna — bantu cegah orang lain menjadi korban.
          </p>
        </div>
        <Button
          icon={<Flag className="w-4 h-4" />}
          onClick={() => navigate('/analyze')}
        >
          Laporkan Penipuan Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Input
            placeholder="Cari laporan penipuan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Platform filter */}
          <div className="flex gap-2 flex-wrap">
            {platforms.map(p => {
              const Icon = p !== 'All' ? platformIcons[p] : null
              return (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    filter === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300',
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {p}
                </button>
              )
            })}
          </div>

          {/* Report list */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((report, i) => {
                const PIcon = platformIcons[report.platform] || MessageSquare
                return (
                  <Card key={report.id} hover className={clsx('animate-fade-in', `delay-${i * 100}`)}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                          <PIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {report.platform}
                        </span>
                      </div>
                      <Badge variant={badgeVariant[report.riskLevel]}>
                        {badgeLabel[report.riskLevel]}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                      {report.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {report.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {report.reportCount.toLocaleString('id-ID')} laporan
                      </span>
                      <span>{timeAgo(report.reportedAt)}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
                Tidak ada hasil
              </p>
              <p className="text-sm text-slate-400">
                Coba ubah filter atau kata kunci pencarian.
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending */}
          <Card>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Trending Minggu Ini
            </h3>
            <div className="space-y-3">
              {trendingScamTopics.map((topic, i) => (
                <div key={topic.label} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-bold text-slate-400">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-0.5">
                      {topic.label}
                    </p>
                    <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${(topic.count / trendingScamTopics[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{topic.count > 999 ? `${(topic.count / 1000).toFixed(1)}k` : topic.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2">Lindungi Orang Tersayang</h3>
            <p className="text-sm text-blue-100 leading-relaxed mb-4">
              Bagikan halaman ini ke keluarga dan teman agar mereka bisa mengenali penipuan online.
            </p>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'WaspadaSiber AI', url: window.location.origin })
                }
              }}
              className="w-full bg-white text-blue-700 font-semibold text-sm py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Bagikan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
