import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { accessCode } = await request.json()

        // We use the Service Role Key to bypass RLS policies
        // This is required because public users are likely authenticated as "anon"
        // and RLS policies on 'feedback' table probably restrict anon read access.
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables')
            return NextResponse.json({
                error: 'Server configuration error. Administrator details: Missing SUPABASE_SERVICE_ROLE_KEY.'
            }, { status: 500 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        )

        // Verify Access Code
        const { data: passwordData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'results_password')
            .single()

        // Check if password matches
        if (!passwordData || passwordData.value !== accessCode) {
            // Also check if access code is empty (disabled)
            if (!passwordData?.value && !accessCode) {
                // If both are empty, maybe allow? 
                // Logic: If 'results_password' row doesn't exist or is empty, it means "disabled" or "no password"?
                // Admin UI says "Leave empty to disable".
                // Use case: If code is cleared in admin, shared dashboard should probably be inaccessible (or public? user said disable).
                // Let's assume emptiness means DISABLED.
                return NextResponse.json({ error: 'Shared dashboard is currently disabled.' }, { status: 403 })
            }
            return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
        }

        // Fetch Feedback Data (Privileged)
        const { data: feedbacks, error: feedbackError } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (feedbackError) {
            throw feedbackError
        }

        // Calculate Stats on the server side to save client processing?
        // Reuse client-side logic for consistency for now.

        return NextResponse.json({ feedbacks })

    } catch (error) {
        console.error('Results API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
