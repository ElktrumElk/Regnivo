import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from './api.ts'
import type { AuthInput, User } from '../types/api.ts'
import { AuthContext } from './AuthState.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  function finishLoading() { setLoading(false) }
  function ignoreMissingSession() { setUser(null) }
  function loadSession() { getCurrentUser().then(setUser).catch(ignoreMissingSession).finally(finishLoading) }
  async function login(input: AuthInput) { setUser(await loginRequest(input)) }
  async function register(input: AuthInput) { setUser(await registerRequest(input)) }
  async function logout() { await logoutRequest(); setUser(null) }

  // Session state is restored from the secure cookie when the application starts.
  useEffect(loadSession, [])
  return <AuthContext value={{ user, loading, login, register, logout }}>{children}</AuthContext>
}
