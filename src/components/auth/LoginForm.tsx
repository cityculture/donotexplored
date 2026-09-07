'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations/auth.schemas'
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from '@/lib/firebase/client'
import { setAdminSessionAction } from '@/actions/auth.actions'
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'

const ALLOWED_ADMIN_EMAIL = 'trishuldn@gmail.com'

export function LoginForm() {
  const [isMounted, setIsMounted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function handleAuthSuccess(user: any) {
    const email = user.email?.toLowerCase().trim()
    if (email !== ALLOWED_ADMIN_EMAIL) {
      await signOut(auth)
      setErrorMsg(`Access Denied: Only ${ALLOWED_ADMIN_EMAIL} is authorized to access the admin portal.`)
      setIsLoading(false)
      return
    }

    const idToken = await user.getIdToken(true)
    const result = await setAdminSessionAction(idToken)

    if (result?.error) {
      await signOut(auth)
      setErrorMsg(result.error)
      setIsLoading(false)
      return
    }

    // Redirect to dashboard at root /
    window.location.href = '/'
  }

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      await handleAuthSuccess(userCredential.user)
    } catch (err: any) {
      console.error('Firebase sign in error:', err)
      setIsLoading(false)
      let message = 'Failed to sign in. Please verify your credentials.'
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password'
      ) {
        message = 'Invalid administrator email or password.'
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.'
      } else if (err?.message) {
        message = err.message
      }
      setErrorMsg(message)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      await handleAuthSuccess(result.user)
    } catch (err: any) {
      console.error('Firebase Google sign in error:', err)
      setIsLoading(false)
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'Google authentication failed.')
      }
    }
  }

  if (!isMounted) {
    return <div className="w-full h-[360px] animate-pulse bg-gray-50 rounded-xl" />
  }

  return (
    <div className="w-full space-y-6">
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-gray-700"
          >
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              {...register('email')}
              id="email"
              type="email"
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all font-medium"
              placeholder="trishuldn@gmail.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              {...register('password')}
              id="password"
              type="password"
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all font-medium"
              placeholder="••••••••••••"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying credentials...
            </>
          ) : (
            'Sign In to Admin Portal'
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">
            Or sign in with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
      >
        <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign In with Google
      </button>

      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          Restricted platform administrator access
        </div>
      </div>
    </div>
  )
}
