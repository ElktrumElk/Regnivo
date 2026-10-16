import { createContext, useContext } from 'react'
import type { AuthInput, User } from '../types/api.ts'

export interface AuthValue {
  user: User | null
  loading: boolean
  login: (input: AuthInput) => Promise<void>
  register: (input: AuthInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
