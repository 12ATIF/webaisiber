import { type ReactNode } from 'react'
import { Navbar } from '../components/Navbar'
import { Shield, ExternalLink } from 'lucide-react'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                WaspadaSiber AI
              </span>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Melindungi masyarakat Indonesia dari penipuan digital.{' '}
              <a
                href="https://aduankonten.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
              >
                Laporkan konten <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-xs text-slate-400">© 2026 WaspadaSiber AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
