'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const CITIES = [
  'Pune',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad'
];

export interface CitySelectorProps {
  onSelect?: (city: string) => void;
  variant?: 'standalone' | 'input';
  className?: string;
}

export function CitySelector({ onSelect, variant = 'standalone', className }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Try to load saved city on mount
    const saved = localStorage.getItem('user_city');
    if (saved) {
      setSelectedCity(saved);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('user_city', city);
    setIsOpen(false);
    
    if (onSelect) {
      onSelect(city);
    }

    // Auto-filter if on homepage or events page AND in standalone mode
    if (variant === 'standalone' && (pathname === '/' || pathname === '/events')) {
      const params = new URLSearchParams(searchParams.toString());
      if (city === 'All Cities') {
        params.delete('city');
      } else {
        params.set('city', city);
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Simple reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('Geocoding failed');
          const data = await res.json();
          
          let city = data.address?.city || data.address?.state_district || data.address?.county || 'Unknown Location';
          
          // Clean up "Pune City" -> "Pune"
          if (city.toLowerCase().includes('pune')) city = 'Pune';
          if (city.toLowerCase().includes('mumbai')) city = 'Mumbai';
          if (city.toLowerCase().includes('bangalore') || city.toLowerCase().includes('bengaluru')) city = 'Bangalore';
          if (city.toLowerCase().includes('delhi')) city = 'Delhi';
          if (city.toLowerCase().includes('hyderabad')) city = 'Hyderabad';

          setSelectedCity(city);
          localStorage.setItem('user_city', city);
          setIsOpen(false);
        } catch (err) {
          console.error('Failed to auto-detect city:', err);
          alert('Could not automatically determine your city.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Please allow location access to use this feature.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex border border-transparent hover:border-gray-200"
      >
        <MapPin className="h-4 w-4 text-indigo-600" />
        <span className="truncate max-w-[120px]">{selectedCity}</span>
      </button>

      {/* Mobile view button (simplified) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-lg sm:hidden"
      >
        <MapPin className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-56 right-0 sm:right-auto sm:left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-3 pb-2 border-b border-gray-100 mb-2">
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isLocating}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Detecting...' : 'Detect my location'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => handleSelectCity('All Cities')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedCity === 'All Cities' ? 'font-bold text-indigo-600' : 'text-gray-700'}`}
          >
            All Cities
          </button>
          
          <div className="max-h-60 overflow-y-auto">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelectCity(city)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedCity === city ? 'font-bold text-indigo-600' : 'text-gray-700'}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
