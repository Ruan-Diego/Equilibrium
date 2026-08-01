import { AuthProvider } from '@/app/providers'

function App() {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-background text-foreground p-8">
        <h1 className="text-3xl font-semibold text-healthy">Equilibrium</h1>
        <p className="mt-2 text-muted-foreground">Dark minimal theme ready</p>
      </main>
    </AuthProvider>
  )
}

export default App
