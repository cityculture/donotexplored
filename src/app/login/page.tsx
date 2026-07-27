import { redirect } from 'next/navigation'

/**
 * Admin login page — redirects to admin dashboard.
 * Real login is handled via the main frontend (www.cityculture.in/login).
 * Admins must log in there first, then they are redirected here.
 */
export default function AdminLoginPage() {
  // Redirect to main frontend login
  redirect('https://www.cityculture.in/login?redirect=admin')
}
