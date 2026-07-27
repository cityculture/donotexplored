'use client'

import { useState } from 'react'
import { updateNotificationPrefsAction } from '@/actions/user.actions'

interface NotificationPrefsFormProps {
  initialPrefs: Record<string, any>;
}

const NOTIFICATION_CATEGORIES = [
  {
    id: 'bookings',
    label: 'Booking Updates',
    description: 'Notifications about your tickets, payments, and cancellations.',
    types: ['booking_confirmed', 'booking_cancelled', 'payment_failed']
  },
  {
    id: 'reminders',
    label: 'Event Reminders',
    description: 'Don\'t miss out! We\'ll remind you when events are starting.',
    types: ['event_reminder_24h', 'event_reminder_1h']
  },
  {
    id: 'messages',
    label: 'New Messages',
    description: 'Direct messages from hosts or other attendees.',
    types: ['new_message']
  },
  {
    id: 'marketing',
    label: 'Host Updates',
    description: 'New events from hosts you follow.',
    types: ['new_event_from_followed_host']
  },
  {
    id: 'alerts',
    label: 'Saved Search Alerts',
    description: 'Notifications for new events matching your saved searches.',
    types: ['saved_search_alert']
  }
];

export default function NotificationPrefsForm({ initialPrefs }: NotificationPrefsFormProps) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleToggle = (type: string, channel: 'in_app' | 'email') => {
    const currentTypePrefs = prefs[type] || { in_app: true, email: true };
    const newTypePrefs = {
      ...currentTypePrefs,
      [channel]: !currentTypePrefs[channel]
    };
    
    setPrefs({
      ...prefs,
      [type]: newTypePrefs
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    // Filter only the categories we're managing here
    const updatePayload: Record<string, any> = {};
    NOTIFICATION_CATEGORIES.forEach(cat => {
      cat.types.forEach(type => {
        updatePayload[type] = prefs[type] || { in_app: true, email: true };
      });
    });

    const result = await updateNotificationPrefsAction(updatePayload);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Preferences updated successfully.' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-8">
      {message && (
        <div className={`p-4 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {NOTIFICATION_CATEGORIES.map((category) => (
          <div key={category.id} className="pb-6 border-b last:border-0 last:pb-0 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">{category.label}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="flex gap-6">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In-App</span>
                  <div className="space-y-3">
                    {category.types.map(type => (
                      <div key={`${type}-app`} className="flex items-center gap-2 h-6">
                         <input
                          type="checkbox"
                          checked={prefs[type]?.in_app ?? true}
                          onChange={() => handleToggle(type, 'in_app')}
                          disabled={isLoading}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                  <div className="space-y-3">
                    {category.types.map(type => (
                      <div key={`${type}-email`} className="flex items-center gap-2 h-6">
                        <input
                          type="checkbox"
                          checked={prefs[type]?.email ?? true}
                          onChange={() => handleToggle(type, 'email')}
                          disabled={isLoading}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex flex-col gap-3">
               {category.types.length > 1 && category.types.map(type => (
                 <div key={`${type}-label`} className="h-6 flex items-center">
                    <span className="text-xs text-muted-foreground capitalize">
                      {type.split('_').join(' ')}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
