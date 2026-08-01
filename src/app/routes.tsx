import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from '@/components/layout/AuthGate'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { AreasManagePage } from '@/pages/AreasManagePage'
import { HistoryPage } from '@/pages/HistoryPage'

export function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthGate guestOnly>
              <LoginPage />
            </AuthGate>
          }
        />
        <Route
          element={
            <AuthGate>
              <AppShell />
            </AuthGate>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="areas" element={<AreasManagePage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
