import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../layouts/AuthShell.tsx'
import { useAuth } from '../services/AuthState.ts'
import { authStyles } from '../styles/authStyles.ts'

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const values = new FormData(event.currentTarget)
    try {
      await register({ name: String(values.get('name')), email: String(values.get('email')), password: String(values.get('password')) })
      navigate('/app', { replace: true })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create account.') }
    finally { setSubmitting(false) }
  }

  if (user) return <Navigate to="/app" replace />
  return (
    <AuthShell eyebrow="Create workspace" title="Start monitoring" description="Create your private account and deploy your first endpoint monitor.">
      <form className={authStyles.classes.form} onSubmit={handleSubmit}>
        <div className={authStyles.classes.field}><label className={authStyles.classes.label} htmlFor="register-name">Full name</label><input className={authStyles.classes.input} id="register-name" name="name" autoComplete="name" maxLength={100} required /></div>
        <div className={authStyles.classes.field}><label className={authStyles.classes.label} htmlFor="register-email">Email address</label><input className={authStyles.classes.input} id="register-email" name="email" type="email" autoComplete="email" required /></div>
        <div className={authStyles.classes.field}><label className={authStyles.classes.label} htmlFor="register-password">Password</label><input className={authStyles.classes.input} id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></div>
        {error ? <p className={authStyles.classes.error} role="alert">{error}</p> : null}
        <button className={authStyles.classes.button} type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className={authStyles.classes.switchText}>Already have an account? <Link className={authStyles.classes.link} to="/login">Sign in</Link></p>
    </AuthShell>
  )
}
