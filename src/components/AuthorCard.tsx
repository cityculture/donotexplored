import Image from 'next/image';
import Link from 'next/link';
import { getAuthor } from '@/lib/authors';

interface AuthorCardProps {
    authorName: string;
}

export default function AuthorCard({ authorName }: AuthorCardProps) {
    const author = getAuthor(authorName);

    if (!author) {
        return null;
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                    <Image
                        src={author.image}
                        alt={author.name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {author.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        {author.bio}
                    </p>
                    <Link
                        href={`/blog?author=${author.slug}`}
                        className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1 text-sm"
                    >
                        View all posts by {author.name.split(' ')[0]}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}