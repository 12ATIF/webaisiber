import { useNavigate } from 'react-router-dom'
import { Upload, Link2, Shield, Users, TrendingUp, ChevronRight, Lightbulb } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ScanCard } from '../components/ScanCard'
import { Badge } from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { securityTips, trendingScamTopics } from '../data/mockData'
import { clsx } from 'clsx'

const stats = [
  { label: 'Penipuan Terdeteksi', value: '12,450+', icon: Shield, color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400' },
  { label: 'Pengguna Aktif', value: '34,200+', icon: Users, color: 'text-green-600 bg-green-100 dark:bg-green-950/50 dark:text-green-400' },
  { label: 'Laporan Bulan Ini', value: '1,890', icon: TrendingUp, color: 'text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400' },
]

export function HomePage() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const recentScans = state.scanHistory.slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">

      {/* Hero */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-950 px-6 py-12 sm:px-12 sm:py-16 overflow-hidden text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">AI Siap Melindungi Anda</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Cek Penipuan dalam<br />
            <span className="text-blue-200">Hitungan Detik</span>
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed">
            Upload chat atau link mencurigakan dan dapatkan analisis AI berbasis deteksi rekayasa sosial.
            Gratis, cepat, dan mudah digunakan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/analyze?tab=screenshot')}
              className="bg-white! text-blue-700! hover:bg-blue-50! shadow-lg"
              icon={<Upload className="w-5 h-5" />}
            >
              Upload Screenshot
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/analyze?tab=link')}
              className="border-white/50 text-white hover:bg-white/10!"
              icon={<Link2 className="w-5 h-5" />}
            >
              Cek Link
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(stat => (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Cara Kerja — 3 Langkah Mudah
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Upload atau Masukkan Link', desc: 'Ambil screenshot chat/SMS atau salin URL yang mencurigakan.' },
            { step: '02', title: 'AI Menganalisis Konten', desc: 'Sistem mendeteksi pola bahasa manipulatif dan potensi rekayasa sosial.' },
            { step: '03', title: 'Dapatkan Hasil & Rekomendasi', desc: 'Skor risiko dan panduan tindakan yang jelas dan mudah dipahami.' },
          ].map(item => (
            <div key={item.step} className="relative">
              <Card className="h-full">
                <span className="text-5xl font-extrabold text-blue-100 dark:text-blue-950 select-none">
                  {item.step}
                </span>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mt-2 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Scans */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Riwayat Scan Terakhir</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            Lihat semua
          </Button>
        </div>

        {recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map(scan => (
              <ScanCard
                key={scan.id}
                result={scan}
                onClick={() => {
                  dispatch({ type: 'SET_CURRENT_RESULT', payload: scan })
                  navigate('/result')
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Belum ada riwayat scan.</p>
            <Button className="mt-4" size="sm" onClick={() => navigate('/analyze')}>
              Mulai Analisis Pertama
            </Button>
          </Card>
        )}
      </section>

      {/* Security Tips Banner */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tips Keamanan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {securityTips.map((tip, i) => (
            <Card key={tip.id} className={clsx('border-l-4 animate-fade-in', `delay-${i * 100}`)}>
              <div className="border-l-4 border-blue-500 -ml-5 -mr-5 -mt-5 mb-4 rounded-tl-xl rounded-tr-xl" style={{height: 4}} />
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

      {/* Trending Scams */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Topik Penipuan Trending
        </h2>
        <div className="space-y-3">
          {trendingScamTopics.map((topic, i) => (
            <div key={topic.label} className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {topic.label}
                  </span>
                  <span className="text-xs text-slate-400">{topic.count.toLocaleString('id-ID')} laporan</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${(topic.count / trendingScamTopics[0].count) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
