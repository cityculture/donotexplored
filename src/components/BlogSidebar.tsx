import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, Post, formatBlogDate } from '@/lib/blog';
import NewsletterSignup from './NewsletterSignup';
import SponsoredAds from './SponsoredAds';

interface BlogSidebarProps {
    excludeSlug?: string;
}

export default function BlogSidebar({ excludeSlug }: BlogSidebarProps) {
    const allPosts = getAllPosts(['slug', 'title', 'date', 'image']);
    const filteredPosts = excludeSlug
        ? allPosts.filter((post: Partial<Post>) => post.slug !== excludeSlug)
        : allPosts;
    const recentPosts = filteredPosts.slice(0, 5);

    return (
        <aside className="w-full lg:w-80 space-y-8">
            {/* Recent Posts */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
                <div className="space-y-4">
                    {recentPosts.map((post: Partial<Post>) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex gap-3 hover:opacity-80 transition-opacity"
                        >
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                <Image
                                    src={post.image || '/images/default-blog.jpg'}
                                    alt={post.title || 'Blog Post'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                    {post.title}
                                </h4>
                                <p className="text-xs text-gray-400">
                                    {formatBlogDate(post.date || '')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Sponsored Ads */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sponsored</h3>
                <SponsoredAds />
            </div>

            {/* Newsletter */}
            <NewsletterSignup variant="sidebar" />
        </aside>
    );
}