import { NextResponse } from 'next/server';
import { getAllTripPlans, upsertTripPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Fetch all plans directly from database
export async function GET() {
  try {
    const trips = getAllTripPlans();
    return NextResponse.json({ success: true, trips });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, trips: [] }, { status: 500 });
  }
}

// POST: Upsert (insert or update in place) trip plan in database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trip = upsertTripPlan(body);
    return NextResponse.json({ success: true, trip });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
