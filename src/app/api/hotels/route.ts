import { NextRequest, NextResponse } from 'next/server';
import { searchHotels, getHotelById, type HotelSort } from '@/lib/hotelSearch';

const SORTS: HotelSort[] = ['cheapest', 'rating', 'walk'];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const id = sp.get('id');
  if (id) {
    const hotel = await getHotelById(id);
    return NextResponse.json({ success: !!hotel, hotel });
  }
  const sortParam = sp.get('sort') as HotelSort;
  const page = await searchHotels({
    q: sp.get('q') ?? '',
    area: sp.get('area') ?? 'all',
    sort: SORTS.includes(sortParam) ? sortParam : 'cheapest',
    limit: Number(sp.get('limit')) || undefined,
    cursor: sp.get('cursor'),
  });
  return NextResponse.json(
    { success: true, ...page },
    { headers: { 'Cache-Control': page.osmStatus === 'ready' ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store' } }
  );
}
