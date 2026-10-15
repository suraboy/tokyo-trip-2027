import fs from 'node:fs/promises';
import path from 'node:path';
import type { HotelOption } from '@/types/travel';

/**
 * Tokyo hotels from OpenStreetMap (Overpass API) — free, no API key.
 * Fetched once by the Next server, cached to disk (.cache/), refreshed weekly.
 * OSM has names + coordinates only (no prices / reviews) → cards link out to Agoda/Booking for live price.
 */

const CACHE_FILE = path.join(process.cwd(), '.cache', 'osm-tokyo-hotels.json');
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const RETRY_AFTER_FAIL_MS = 5 * 60 * 1000;
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

// Tokyo 23 wards + nearby (S,W,N,E)
const BBOX = '35.52,139.56,35.82,139.92';
const QUERY = `[out:json][timeout:90];
nwr["tourism"~"^(hotel|hostel|guest_house)$"]["name"](${BBOX});
out center tags;
node["railway"="station"]["name"](${BBOX});
out;`;

const AREA_CENTERS: Array<{ area: HotelOption['area']; th: string; lat: number; lng: number }> = [
  { area: 'Shinjuku', th: 'ชินจูกุ', lat: 35.6909, lng: 139.7003 },
  { area: 'Ueno', th: 'อุเอโนะ', lat: 35.7138, lng: 139.7773 },
  { area: 'Asakusa', th: 'อาซากุสะ', lat: 35.7148, lng: 139.7967 },
  { area: 'Shibuya', th: 'ชิบูย่า', lat: 35.658, lng: 139.7016 },
  { area: 'Ginza', th: 'กินซ่า', lat: 35.6717, lng: 139.765 },
  { area: 'Akihabara', th: 'อากิฮาบาระ', lat: 35.6984, lng: 139.7731 },
  { area: 'Ikebukuro', th: 'อิเคบุคุโระ', lat: 35.7295, lng: 139.7109 },
  { area: 'Roppongi', th: 'รปปงหงิ', lat: 35.6628, lng: 139.7314 },
  { area: 'Tokyo Station', th: 'สถานีโตเกียว', lat: 35.6812, lng: 139.7671 },
  { area: 'Koto', th: 'โคโตะ', lat: 35.6729, lng: 139.8171 },
];

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80';

type OsmEl = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

function distM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function transform(elements: OsmEl[]): HotelOption[] {
  const stations: Array<{ name: string; lat: number; lng: number }> = [];
  const raw: OsmEl[] = [];
  for (const el of elements) {
    const t = el.tags || {};
    if (t.railway === 'station' && el.lat != null && el.lon != null) {
      stations.push({ name: t['name:en'] || t.name, lat: el.lat, lng: el.lon });
    } else if (t.tourism) {
      raw.push(el);
    }
  }

  const out: HotelOption[] = [];
  for (const el of raw) {
    const t = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    let near = { name: '-', d: Infinity };
    for (const s of stations) {
      const d = distM(lat, lng, s.lat, s.lng);
      if (d < near.d) near = { name: s.name, d };
    }
    let area = AREA_CENTERS[0];
    let areaD = Infinity;
    for (const a of AREA_CENTERS) {
      const d = distM(lat, lng, a.lat, a.lng);
      if (d < areaD) {
        area = a;
        areaD = d;
      }
    }

    const nameEn = t['name:en'] || t.name;
    const stars = parseInt(t.stars || '', 10);
    out.push({
      id: `osm-${el.type[0]}${el.id}`,
      nameEn,
      nameTh: t['name:th'] || nameEn,
      aliases: [t.name, t['name:ja'], t['name:ja-Latn'], t['name:en'], t.brand, t['addr:city'], t['addr:suburb'], t['addr:quarter']].filter(Boolean) as string[],
      area: area.area,
      areaTh: `${area.th} (ใกล้เคียง)`,
      starRating: Number.isFinite(stars) ? stars : 0,
      ratingScore: 0,
      pricePerNightTHB: 0,
      pricePerNightJPY: 0,
      nearestStation: near.name,
      walkMinutesToStation: Number.isFinite(near.d) ? Math.max(1, Math.ceil((near.d * 1.25) / 80)) : 99,
      highlights: [],
      tagBadge: 'ยอดนิยม',
      imageUrl: PLACEHOLDER_IMG,
      bookingSource: 'OpenStreetMap',
      lat,
      lng,
      source: 'osm',
      osmKind: (t.tourism as HotelOption['osmKind']) || 'hotel',
    });
  }
  return out;
}

async function fetchFromOverpass(): Promise<HotelOption[]> {
  let lastErr: unknown;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'tokyo-trip-2027/0.1' },
        body: 'data=' + encodeURIComponent(QUERY),
        signal: AbortSignal.timeout(100_000),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = (await res.json()) as { elements: OsmEl[] };
      return transform(json.elements || []);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// ---- in-process state ----
let memory: { hotels: HotelOption[]; fetchedAt: number } | null = null;
let inflight: Promise<void> | null = null;
let lastFailAt = 0;

export type OsmStatus = 'ready' | 'loading' | 'error';

async function refresh(): Promise<void> {
  try {
    const hotels = await fetchFromOverpass();
    memory = { hotels, fetchedAt: Date.now() };
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(memory));
    console.log(`[osmHotels] cached ${hotels.length} Tokyo hotels`);
  } catch (e) {
    lastFailAt = Date.now();
    console.warn('[osmHotels] Overpass fetch failed', e);
  } finally {
    inflight = null;
  }
}

/** Never blocks on the network: returns what is cached now + status; kicks a background refresh if needed. */
export async function getOsmHotels(): Promise<{ hotels: HotelOption[]; status: OsmStatus }> {
  if (!memory) {
    try {
      memory = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
    } catch {}
  }
  const stale = !memory || Date.now() - memory.fetchedAt > TTL_MS;
  if (stale && !inflight && Date.now() - lastFailAt > RETRY_AFTER_FAIL_MS) {
    inflight = refresh();
  }
  if (memory) return { hotels: memory.hotels, status: 'ready' };
  return { hotels: [], status: inflight ? 'loading' : 'error' };
}
