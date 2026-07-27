'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations/auth.schemas'
import { registerAction, checkUsernameAction } from '@/actions/auth.actions'
import Link from 'next/link'

function getPasswordStrength(password: string) {
  let score = 0
  if (!password) return score
  if (password.length > 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z\d]/.test(password)) score += 1
  return score // 0 to 4
}

export function RegisterForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', phone: '', gender: '', date_of_birth: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const password = watch('password')

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('full_name', data.full_name)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('gender', data.gender)
    formData.append('date_of_birth', data.date_of_birth)
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)

    const result = await registerAction(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccessMsg('Account created successfully! You can now log in.')
      setIsLoading(false)
    }
  }

  const strength = getPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
            {successMsg}
            <div className="mt-2">
              <Link href="/login" className="font-semibold underline">Go to login</Link>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="full_name" className="text-sm font-medium leading-none text-gray-700">
            Full Name
          </label>
          <input
            {...register('full_name')}
            id="full_name"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="John Doe"
            disabled={isLoading || !!successMsg}
          />
          {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium leading-none text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="name@example.com"
            disabled={isLoading || !!successMsg}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <input
            {...register('phone')}
            id="phone"
            type="tel"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. 9876543210"
            disabled={isLoading || !!successMsg}
          />
          {errors.phone && <p className="text-sm text-red-500 dark:text-red-400">{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="gender" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <select
              {...register('gender')}
              id="gender"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading || !!successMsg}
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-sm text-red-500 dark:text-red-400">{errors.gender.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="date_of_birth" className="text-sm font-medium leading-none text-gray-700">
              Date of Birth
            </label>
            <input
              {...register('date_of_birth')}
              id="date_of_birth"
              type="date"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:light]"
              disabled={isLoading || !!successMsg}
            />
            {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium leading-none text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading || !!successMsg}
          />
          {password && password.length > 0 && (
            <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
                style={{ width: `${Math.max(10, (strength / 4) * 100)}%` }}
              />
            </div>
          )}
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-gray-700">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading || !!successMsg}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMsg}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/login/google"
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            className="mr-2 h-5 w-5"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
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
          Google
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <div className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
