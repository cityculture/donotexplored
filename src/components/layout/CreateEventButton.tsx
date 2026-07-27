'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function CreateEventButton({ isLoggedIn, hasActiveSubscription, activePageId }: { isLoggedIn: boolean, hasActiveSubscription?: boolean, activePageId?: string }) {
  let href = '/login?next=/members/host-dashboard/create';

  if (isLoggedIn) {
    if (hasActiveSubscription && activePageId) {
      href = `/members/host-dashboard/${activePageId}/create-event`;
    } else {
      href = '/members/dashboard?openCreateModal=true';
    }
  }

  return (
    <Link
      href={href}
      className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-yellow-400 hover:text-black transition-colors shadow-sm hover:shadow"
    >
      <Plus className="h-4 w-4" />
      Create Event
    </Link>
  );
}
