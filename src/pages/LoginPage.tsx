import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../layouts/AuthShell.tsx'
import { useAuth } from '../services/AuthState.ts'
import { authStyles } from '../styles/authStyles.ts'

interface LocationState { from?: string }

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const values = new FormData(event.currentTarget)
    try {
      await login({ email: String(values.get('email')), password: String(values.get('password')) })
      const state = location.state as LocationState | null
      navigate(state?.from ?? '/app', { replace: true })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.') }
    finally { setSubmitting(false) }
  }

  if (user) return <Navigate to="/app" replace />
  return (
    <AuthShell eyebrow="Secure workspace" title="Welcome back" description="Sign in to view projects, endpoint health, and request history.">
      <form className={authStyles.classes.form} onSubmit={handleSubmit}>
        <div className={authStyles.classes.field}><label className={authStyles.classes.label} htmlFor="login-email">Email address</label><input className={authStyles.classes.input} id="login-email" name="email" type="email" autoComplete="email" required /></div>
        <div className={authStyles.classes.field}><label className={authStyles.classes.label} htmlFor="login-password">Password</label><input className={authStyles.classes.input} id="login-password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div>
        {error ? <p className={authStyles.classes.error} role="alert">{error}</p> : null}
        <button className={authStyles.classes.button} type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className={authStyles.classes.switchText}>New to Regnivo? <Link className={authStyles.classes.link} to="/register">Create an account</Link></p>
    </AuthShell>
  )
}
