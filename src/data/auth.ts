import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

const ERROR_MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/popup-blocked': 'O popup foi bloqueado. Permita popups e tente novamente.',
  'auth/popup-closed-by-user': 'Login cancelado. Tente novamente.',
  'auth/cancelled-popup-request': 'Login cancelado. Tente novamente.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  'auth/network-request-failed': 'Falha de rede. Verifique sua conexão.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/requires-recent-login': 'Faça login novamente para continuar.',
  'auth/missing-email': 'Informe um e-mail.',
  'auth/missing-password': 'Informe uma senha.',
  'auth/operation-not-allowed': 'Este método de login não está habilitado.',
}

export function mapAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code]
  }
  return 'Não foi possível autenticar. Tente novamente.'
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}
