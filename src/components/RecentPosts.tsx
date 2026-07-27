import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, Post, formatBlogDate } from '@/lib/blog';

interface RecentPostsProps {
    excludeSlug?: string;
    limit?: number;
}

export default function RecentPosts({ excludeSlug, limit = 4 }: RecentPostsProps) {
    const allPosts = getAllPosts(['slug', 'title', 'date', 'image', 'excerpt']);
    const filteredPosts = excludeSlug 
        ? allPosts.filter((post: Partial<Post>) => post.slug !== excludeSlug)
        : allPosts;
    const recentPosts = filteredPosts.slice(0, limit);

    if (recentPosts.length === 0) {
        return null;
    }

    return (
        <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentPosts.map((post: Partial<Post>) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 block"
                    >
                        <div className="relative h-40 w-full">
                            <Image
                                src={post.image || '/images/default-blog.jpg'}
                                alt={post.title || 'Blog Post'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-4">
                            <div className="text-xs text-gray-400 mb-2">
                                {formatBlogDate(post.date || '')}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            {post.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {post.excerpt}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}