'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import SearchBar from './events/SearchBar';
import { logoutAction } from '@/actions/auth.actions';
import { CitySelector } from './layout/CitySelector';
import { CreateEventButton } from './layout/CreateEventButton';

import SocialLinks from './SocialLinks';

import { User, HostProfile } from '@/types';

export default function Navbar({ user, dbUser, hasActiveSubscription, activePageId }: { 
    user?: any, // Auth user
    dbUser?: User & { host_profile?: HostProfile | null }, 
    hasActiveSubscription?: boolean, 
    activePageId?: string 
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[9999] w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
                <nav className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0" onClick={closeMobileMenu}>
                        <Image
                            src="/logo-2.svg"
                            alt="City Culture Logo"
                            width={180}
                            height={45}
                            className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-none"
                            priority
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    </Link>

                    {/* Search & City - Hidden on very small screens, visible on md+ */}
                    <div className="hidden md:flex flex-1 justify-center items-center gap-3 px-4 max-w-xl mx-auto">
                        <CitySelector />
                        <div className="flex-1 max-w-[300px]">
                            <Suspense fallback={null}><SearchBar /></Suspense>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-zinc-700">
                        <Link href="/events" className="hover:text-zinc-950 transition-colors hidden sm:block">
                            Events
                        </Link>
                        <Link href="/hosts" className="hover:text-zinc-950 transition-colors hidden sm:block">
                            Hosts
                        </Link>

                        {/* Inject CreateEventButton before auth block */}
                        <div className="hidden sm:block">
                             <CreateEventButton 
                                isLoggedIn={!!user} 
                                hasActiveSubscription={hasActiveSubscription}
                                activePageId={activePageId}
                             />
                        </div>

                        {user ? (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link
                                    href="/members/dashboard"
                                    className="hover:text-black transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="relative group">
                                    <button className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-2 hover:bg-gray-50 transition-colors">
                                        {dbUser?.avatar_url ? (
                                            <img src={dbUser.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                            {(dbUser?.full_name || dbUser?.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">{dbUser?.full_name || dbUser?.email || 'User'}</span>
                                    </button>
                                    {/* Invisible wrapper to bridge the hover gap */}
                                    <div className="absolute right-0 top-full pt-2 hidden w-48 group-hover:block z-50">
                                        <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                            {dbUser?.role === 'admin' && (
                                                <Link href="/admin" className="block px-4 py-2 text-sm text-indigo-700 font-medium hover:bg-gray-100">Admin Dashboard</Link>
                                            )}
                                             <Link href="/members/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Tickets</Link>
                                            <Link href="/members/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                                            <form action={logoutAction} className="block w-full text-left">
                                                <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link href="/login" className="hover:text-black transition-colors hidden sm:block">
                                    Log in
                                </Link>
                                <Link href="/register" className="px-4 py-2 bg-yellow-400 text-black rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-colors hidden sm:inline-block">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Hamburger Button (Mobile Only) */}
                    <div className="flex items-center sm:hidden">
                        <CitySelector />
                        <button
                            onClick={toggleMobileMenu}
                            className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100 transition-colors shrink-0 ml-2"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[99999] sm:hidden"
                    onClick={closeMobileMenu}
                    style={{ top: '73px' }}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`fixed right-4 top-[85px] w-[calc(100vw-32px)] sm:w-80 max-w-[340px] bg-white shadow-2xl z-[999999] sm:hidden rounded-2xl border border-gray-100 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex flex-col h-full p-5">
                    {/* Mobile Search Bar */}
                    <div className="mb-4 sm:hidden">
                        <Suspense fallback={null}><SearchBar /></Suspense>
                    </div>
                    
                    <div className="mb-4">
                        <CreateEventButton 
                            isLoggedIn={!!user} 
                            hasActiveSubscription={hasActiveSubscription}
                            activePageId={activePageId}
                        />
                    </div>

                    <div className="flex flex-col gap-1 mb-5">
                        <Link
                            href="/events"
                            className="px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-gray-50 rounded-xl transition-colors"
                            onClick={closeMobileMenu}
                        >
                            Explore Events
                        </Link>
                        <Link
                            href="/hosts"
                            className="px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-gray-50 rounded-xl transition-colors"
                            onClick={closeMobileMenu}
                        >
                            Browse Hosts
                        </Link>
                    </div>

                    <div className="pt-5 border-t border-gray-100">
                        {user ? (
                            <div className="space-y-2">
                                {dbUser?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="block w-full px-4 py-3 text-sm bg-indigo-600 text-white text-center rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/members/dashboard"
                                    className="block w-full px-4 py-3 text-sm bg-gray-50 text-zinc-900 text-center rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Dashboard
                                </Link>
                                <form action={logoutAction} className="block w-full text-left">
                                    <button type="submit" className="block w-full px-4 py-3 text-sm text-red-600 text-center font-bold hover:bg-red-50 rounded-xl transition-colors" onClick={closeMobileMenu}>
                                        Sign out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-3 text-sm bg-gray-50 text-zinc-900 text-center rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-3 text-sm bg-zinc-950 text-white text-center rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Social Icons at bottom */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center">
                        <SocialLinks variant="footer" className="justify-center w-full" />
                    </div>
                </div>
            </div>
        </>
    );
}
