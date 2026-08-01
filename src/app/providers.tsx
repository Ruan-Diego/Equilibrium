import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/data/firebase'
import {
  mapAuthError,
  resetPassword as resetPasswordFn,
  signInEmail as signInEmailFn,
  signInWithGoogle,
  signOut as signOutFn,
  signUpEmail as signUpEmailFn,
} from '@/data/auth'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signInGoogle: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const wrap = useCallback(async (fn: () => Promise<unknown>) => {
    try {
      await fn()
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }, [])

  const signInGoogle = useCallback(
    () => wrap(() => signInWithGoogle()),
    [wrap],
  )

  const signInEmail = useCallback(
    (email: string, password: string) =>
      wrap(() => signInEmailFn(email, password)),
    [wrap],
  )

  const signUpEmail = useCallback(
    (email: string, password: string) =>
      wrap(() => signUpEmailFn(email, password)),
    [wrap],
  )

  const signOut = useCallback(() => wrap(() => signOutFn()), [wrap])

  const resetPassword = useCallback(
    (email: string) => wrap(() => resetPasswordFn(email)),
    [wrap],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInGoogle,
      signInEmail,
      signUpEmail,
      signOut,
      resetPassword,
    }),
    [
      user,
      loading,
      signInGoogle,
      signInEmail,
      signUpEmail,
      signOut,
      resetPassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
