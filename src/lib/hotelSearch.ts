import { HOTEL_OPTIONS } from '@/data/mockData';
import type { HotelOption } from '@/types/travel';
import { getOsmHotels, type OsmStatus } from '@/lib/osmHotels';

export type HotelSort = 'cheapest' | 'rating' | 'walk';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

/** lower-case, strip diacritics (Ōjima -> ojima), keep letters/digits/Thai */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}฀-๿\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type IndexRow = { hotel: HotelOption; hay: string };

function haystack(h: HotelOption): string {
  return normalize(
    [h.nameTh, h.nameEn, ...(h.aliases || []), h.area, h.areaTh, h.nearestStation, h.highlights.join(' '), h.source === 'osm' ? '' : h.tagBadge, h.bestSource, h.bookingSource].join(' ')
  );
}

const CURATED: IndexRow[] = HOTEL_OPTIONS.map((h) => ({ hotel: { ...h, source: 'curated' as const }, hay: haystack(h) }));

// Combined index, rebuilt only when the OSM list object changes
let cachedFor: HotelOption[] | null = null;
let cachedIndex: IndexRow[] = CURATED;

function buildIndex(osm: HotelOption[]): IndexRow[] {
  if (osm === cachedFor) return cachedIndex;
  // drop OSM entries that duplicate a curated hotel (within ~80 m)
  const dup = (h: HotelOption) =>
    HOTEL_OPTIONS.some((c) => Math.abs(c.lat - h.lat) < 0.0008 && Math.abs(c.lng - h.lng) < 0.0009);
  cachedIndex = [...CURATED, ...osm.filter((h) => !dup(h)).map((h) => ({ hotel: h, hay: haystack(h) }))];
  cachedFor = osm;
  return cachedIndex;
}

export async function getHotelById(id: string): Promise<HotelOption | null> {
  const { hotels } = await getOsmHotels();
  return buildIndex(hotels).find((r) => r.hotel.id === id)?.hotel ?? null;
}

const UNKNOWN = 1e9; // unknown price / walk sorts last

/** Sort value (ascending order). Rating is negated so every sort is ASC + id tiebreak. */
function sortValue(h: HotelOption, sort: HotelSort): number {
  if (sort === 'cheapest') return h.lowestPriceTHB || h.pricePerNightTHB || UNKNOWN;
  if (sort === 'rating') return -h.ratingScore;
  return h.walkMinutesToStation ?? UNKNOWN;
}

function cmp(aV: number, aId: string, bV: number, bId: string): number {
  if (aV !== bV) return aV - bV;
  return aId < bId ? -1 : aId > bId ? 1 : 0;
}

type Cursor = { v: number; id: string };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

export function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (typeof c?.v === 'number' && typeof c?.id === 'string') return c;
  } catch {}
  return null;
}

export interface HotelPage {
  items: HotelOption[];
  nextCursor: string | null;
  total?: number; // only on first page (no cursor)
  osmStatus: OsmStatus;
}

/**
 * Keyset (seek) pagination: the cursor is the (sortValue, id) of the last item,
 * the next page is "everything strictly after it" — no OFFSET, stable under inserts.
 * When hotels move to SQL: WHERE (price, id) > ($v, $id) ORDER BY price, id LIMIT n+1
 */
export async function searchHotels(opts: {
  q?: string;
  area?: string;
  sort?: HotelSort;
  limit?: number;
  cursor?: string | null;
}): Promise<HotelPage> {
  const sort: HotelSort = opts.sort ?? 'cheapest';
  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const tokens = normalize(opts.q ?? '').split(' ').filter(Boolean);
  const area = (opts.area ?? 'all').toLowerCase();
  const cursor = decodeCursor(opts.cursor ?? null);

  const { hotels: osm, status } = await getOsmHotels();
  const matched = buildIndex(osm).filter(({ hotel, hay }) => {
    if (area !== 'all' && hotel.area.toLowerCase() !== area) return false;
    // every word must appear somewhere (order/spacing independent): "apa ojima", "ojima apa"
    return tokens.every((t) => hay.includes(t));
  })
    .map(({ hotel }) => ({ hotel, v: sortValue(hotel, sort) }))
    .sort((a, b) => cmp(a.v, a.hotel.id, b.v, b.hotel.id));

  const after = cursor ? matched.filter((m) => cmp(m.v, m.hotel.id, cursor.v, cursor.id) > 0) : matched;
  const pageRows = after.slice(0, limit);
  const hasMore = after.length > limit;
  const last = pageRows[pageRows.length - 1];

  return {
    items: pageRows.map((r) => r.hotel),
    nextCursor: hasMore && last ? encodeCursor({ v: last.v, id: last.hotel.id }) : null,
    ...(cursor ? {} : { total: matched.length }),
    osmStatus: status,
  };
}
