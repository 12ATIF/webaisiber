import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { AnalyzePage } from './pages/AnalyzePage'
import { ResultPage } from './pages/ResultPage'
import { CommunityPage } from './pages/CommunityPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AppProvider>
  )
}
