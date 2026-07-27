import SponsoredAdCard from './SponsoredAdCard';

export default function SponsoredAds() {
    return (
        <div className="space-y-4">
            <SponsoredAdCard
                url="https://www.nearbypetcare.com"
                title="Nearby Pet Care"
                description="Free Pet Care Guide, Tools and Tips for working professionals."
            />
            <SponsoredAdCard
                url="https://www.myaitask.com"
                title="My AI Task"
                description="100+ FREE AI powered tools for productivity."
            />
        </div>
    );
}
