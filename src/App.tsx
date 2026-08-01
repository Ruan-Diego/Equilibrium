import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/app/providers'
import { AppRoutes } from '@/app/routes'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
