'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth.schemas'
import { forgotPasswordAction } from '@/actions/auth.actions'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('email', data.email)

    const result = await forgotPasswordAction(formData)

    if (result?.success) {
      setSuccessMsg("If your email exists in our system, you will receive a password reset link shortly.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {successMsg && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-400">
            {successMsg}
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-gray-50 dark:focus:ring-indigo-400"
            placeholder="name@example.com"
            disabled={isLoading || !!successMsg}
          />
          {errors.email && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMsg}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
