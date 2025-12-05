import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { media_url } = await request.json();

        if (!media_url) {
            return NextResponse.json(
                { error: 'No media_url provided.' },
                { status: 400 }
            );
        }

        // Only try to delete if it's a locally hosted file (served by us)
        if (media_url.includes('/api/media/') || media_url.includes('/assets/photos/')) {
            const filename = path.basename(media_url);
            const filepath = path.join(process.cwd(), 'public/assets/photos', filename);

            try {
                await unlink(filepath);
                console.log(`Deleted file: ${filepath}`);
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    console.log(`File not found, skipping delete: ${filepath}`);
                } else {
                    console.error('Error deleting file from disk:', error);
                    // We don't fail the request here, because we still want to remove the DB record
                }
            }
        }

        // If it was a regular /assets/ path (from before dynamic serving), try deleting that too if it matches the pattern

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete handler error:', error);
        return NextResponse.json(
            { error: 'Error processing delete request.' },
            { status: 500 }
        );
    }
}
