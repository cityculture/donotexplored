'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth.schemas'
import { updatePasswordAction } from '@/actions/auth.actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)

    const result = await updatePasswordAction(formData)

    if (result?.success) {
      toast.success('Password updated successfully!')
      router.push('/login')
    } else {
      toast.error(result?.error || 'Failed to update password')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-gray-50 dark:focus:ring-indigo-400"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-gray-50 dark:focus:ring-indigo-400"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
