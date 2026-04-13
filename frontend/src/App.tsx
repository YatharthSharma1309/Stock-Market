import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import MarketsPage from '@/pages/MarketsPage'
import PortfolioPage from '@/pages/PortfolioPage'
import TradesPage from '@/pages/TradesPage'
import StockDetailPage from '@/pages/StockDetailPage'
import LearningPage from '@/pages/LearningPage'
import LessonViewerPage from '@/pages/LessonViewerPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
          <Route path="/learn" element={<LearningPage />} />
          <Route path="/learn/:moduleId" element={<LessonViewerPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
