import ConferenceView from "@/components/views/ConferenceView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

// This is a server component wrapper or client component wrapper depending on how data is fetched
// For simplicity, we make it a client component wrapper like page.tsx
// But Next.js dynamic routes pass params.

export default async function ArchivePage({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params;

    // You might want to fetch specific settings for that year if your DB supports it
    // For now, we'll just render the Conference View essentially as the "Archive"
    // It will fetch the same guests/schedule for now unless we filter by year in the future.

    return (
        <div className="min-h-screen flex flex-col font-poppins">
            <Navbar />
            <main className="flex-grow">
                {/* We reuse ConferenceView but could pass a prop to indicate it's an archive if needed */}
                <ConferenceView settings={null} isArchive={true} />
            </main>
            <Footer />
        </div>
    );
}
