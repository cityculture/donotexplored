import { getEventsByCity, formatEventDate } from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import Link from "next/link";

interface CityEventsPageProps {
    cityName: string;
}

export default async function CityEventsPage({ cityName }: CityEventsPageProps) {
    const cityEvents = await getEventsByCity(cityName);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Page Header */}
            <section className="w-full bg-white border-b border-gray-200 pt-32 pb-12 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-6">
                        <Link href="/events" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                            ← Back to all events
                        </Link>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Events in {cityName}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover the best offline experiences in {cityName} this weekend.
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <main className="w-full max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {cityEvents.map((event) => (
                        <div key={event.id} className="h-full">
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>

                {cityEvents.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-bold text-gray-400">
                            No events scheduled in {cityName} right now.
                        </h3>
                        <p className="text-gray-500 mt-2">
                            Check back later or browse <Link href="/events" className="text-blue-600 hover:underline">all events</Link>.
                        </p>
                    </div>
                )}
            </main>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Home",
                                    "item": "https://www.cityculture.in"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Events",
                                    "item": "https://www.cityculture.in/events"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": cityName,
                                    "item": `https://www.cityculture.in/events/${cityName.toLowerCase()}`
                                }
                            ]
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "itemListElement": cityEvents.map((event, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "item": {
                                    "@type": "Event",
                                    "name": event.title,
                                    "startDate": event.start_datetime,
                                    "endDate": event.end_datetime,
                                    "location": {
                                        "@type": "Place",
                                        "name": event.venue_name || event.title,
                                        "address": {
                                            "@type": "PostalAddress",
                                            "addressLocality": cityName,
                                            "addressCountry": "IN"
                                        }
                                    },
                                    "offers": {
                                        "@type": "Offer",
                                        "price": (event.min_price ?? 0) === 0 ? "0" : (event.min_price ?? 0).toString(),
                                        "priceCurrency": "INR"
                                    }
                                }
                            }))
                        }
                    ])
                }}
            />
        </div>
    );
}
