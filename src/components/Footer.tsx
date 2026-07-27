import Link from 'next/link';
import Image from 'next/image';
import SocialLinks from './SocialLinks';

const footerSections = [
    {
        title: 'Discover',
        links: [
            { label: 'Explore Events', href: '/events' },
            { label: 'Browse Hosts', href: '/hosts' },
            { label: 'Latest Events', href: '/latest-events' },
            { label: 'Live Online Games', href: '/live-online-games' },
            { label: 'Blog', href: '/blog' },
        ],
    },
    {
        title: 'Cities',
        links: [
            { label: 'Bangalore', href: '/bangalore' },
            { label: 'Mumbai', href: '/mumbai' },
            { label: 'Delhi', href: '/delhi' },
            { label: 'Pune', href: '/pune' },
            { label: 'Hyderabad', href: '/hyderabad' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Our Team', href: '/team' },
            { label: 'Careers', href: '/careers' },
            { label: 'Testimonials', href: '/testimonials' },
            { label: 'Authors', href: '/authors' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'FAQs', href: '/faqs' },
            { label: 'How it Works', href: '/how-it-works' },
            { label: 'Safety Guidelines', href: '/safety-guidelines' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookie-policy' },
            { label: 'Refund Policy', href: '/refund-policy' },
            { label: 'Disclaimer', href: '/disclaimer' },
        ],
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-gray-100 bg-white/80 backdrop-blur-2xl mt-auto z-10 relative">
            <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
                    {footerSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-5">
                            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest px-0.5 border-l-2 border-indigo-500 pl-3">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link 
                                            href={link.href} 
                                            className="text-[15px] text-zinc-500 hover:text-indigo-600 transition-all duration-200 hover:translate-x-1 inline-block"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Brand and Social Section */}
                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center">
                            <Image 
                                src="/logo-2.svg" 
                                alt="City Culture Logo" 
                                width={180} 
                                height={45} 
                                className="h-10 w-auto"
                            />
                        </div>
                        <p className="text-sm text-zinc-500 max-w-sm text-center md:text-left leading-relaxed">
                            Discover the heartbeat of your city through curated events, 
                            social meetups, and unique local experiences.
                        </p>
                        <SocialLinks variant="footer" className="mt-2" />
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                         <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center md:text-right">
                            <p className="text-sm font-regular text-zinc-800">
                                A Brand of <a href="https://saltymediaproduction.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">Salty Media Production (opc) Pvt Ltd</a>
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">© {currentYear} City Culture. All rights reserved.</p>
                         </div>
                    </div>
                </div>

                {/* Attribution and Disclaimer */}
                <div className="mt-10 text-center">
                    <p className="text-[11px] text-zinc-400 max-w-2xl mx-auto leading-loose uppercase tracking-tighter">
                        Images and videos used are from City Culture events, Pexels, and Freepik. 
                        Copyrights belong to their respective owners. Content is intended for community discovery.
                    </p>
                </div>
            </div>
            
            {/* Subtle Gradient Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30"></div>
        </footer>
    );
}
