import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Attraction, HotelOption, FlightOption } from '@/types/travel';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine distance (km)
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Tokyo Airports Coordinates and Details
const TOKYO_AIRPORTS = {
  NRT: {
    code: 'NRT',
    nameTh: 'ท่าอากาศยานนานาชาตินาริตะ (Narita - NRT)',
    nameEn: 'Narita International Airport',
    lat: 35.7720,
    lng: 140.3929,
    expressTrainTh: 'Keisei Skyliner (41 นาทีสู่อุเอโนะ) / JR Narita Express N\'EX (55 นาทีสู่ชินจูกุ/โตเกียว)',
  },
  HND: {
    code: 'HND',
    nameTh: 'ท่าอากาศยานนานาชาติโตเกียว ฮาเนดะ (Haneda - HND)',
    nameEn: 'Tokyo Haneda Airport',
    lat: 35.5494,
    lng: 139.7798,
    expressTrainTh: 'Tokyo Monorail (13 นาทีสู่ฮามามัตสึโจ) / Keikyu Airport Line (11 นาทีสู่ชินากาวะ)',
  },
};

// Create custom Airport icon (Start of Trip)
function airportIcon() {
  return L.divIcon({
    className: 'trip-map-airport-icon',
    html: `<div style="
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 20px rgba(139,92,246,0.8), 0 0 0 3px rgba(255,255,255,0.5);
      border: 2px solid #fff;
    ">🛫</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

// Create custom hotel icon
function hotelIcon() {
  return L.divIcon({
    className: 'trip-map-hotel-icon',
    html: `<div style="
      background: linear-gradient(135deg, #ff6584 0%, #ff3366 100%);
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 16px rgba(255,101,132,0.5), 0 0 0 3px rgba(255,255,255,0.3);
      border: 2px solid #fff;
    ">🏨</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

// Create numbered attraction icon
function attractionIcon(index: number, isSelected: boolean) {
  const bg = isSelected
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
  const shadow = isSelected
    ? '0 4px 14px rgba(16,185,129,0.5)'
    : '0 4px 14px rgba(56,189,248,0.4)';
  return L.divIcon({
    className: 'trip-map-attraction-icon',
    html: `<div style="
      background: ${bg};
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; color: #fff;
      box-shadow: ${shadow};
      border: 2px solid rgba(255,255,255,0.6);
      font-family: system-ui, sans-serif;
    ">${index + 1}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

// Auto-fit bounds when markers change
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (positions.length === 1) {
      map.setView(positions[0], 12);
    }
  }, [positions, map]);
  return null;
}

interface TripMapProps {
  hotel: HotelOption;
  selectedAttractions: Attraction[];
  allAttractions: Attraction[];
  selectedSpotIds: string[];
  flight?: FlightOption;
}

const TripMapInner: React.FC<TripMapProps> = ({
  hotel,
  selectedAttractions,
  allAttractions,
  selectedSpotIds,
  flight,
}) => {
  const center: [number, number] = [hotel.lat, hotel.lng];

  // Determine Airport
  const airport = useMemo(() => {
    if (flight?.to === 'HND') return TOKYO_AIRPORTS.HND;
    return TOKYO_AIRPORTS.NRT;
  }, [flight]);

  const airportToHotelKm = useMemo(() => {
    return haversineKm(airport.lat, airport.lng, hotel.lat, hotel.lng);
  }, [airport, hotel]);

  // All positions for bounds fitting
  const allPositions = useMemo(() => {
    const pts: [number, number][] = [
      [airport.lat, airport.lng],
      [hotel.lat, hotel.lng],
    ];
    selectedAttractions.forEach((a) => {
      pts.push([a.lat, a.lng]);
    });
    return pts;
  }, [airport, hotel, selectedAttractions]);

  // Polylines from hotel to each selected attraction
  const lines = useMemo(
    () =>
      selectedAttractions.map((a) => ({
        id: a.id,
        positions: [[hotel.lat, hotel.lng], [a.lat, a.lng]] as [number, number][],
        dist: haversineKm(hotel.lat, hotel.lng, a.lat, a.lng),
      })),
    [hotel, selectedAttractions]
  );

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={true}
      style={{
        width: '100%',
        height: '580px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={allPositions} />

      {/* Airport Starting Marker (Leg 0) */}
      <Marker position={[airport.lat, airport.lng]} icon={airportIcon()}>
        <Popup>
          <div style={{ fontFamily: 'system-ui', fontSize: '13px', minWidth: '240px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#8b5cf6', marginBottom: '4px' }}>
              🛫 จุดเริ่มต้นทริป: {airport.nameTh}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '6px' }}>
              🛬 เที่ยวบิน: <strong>{flight ? `${flight.airline} (${flight.flightNumber})` : 'เที่ยวบินกรุงเทพฯ ➔ โตเกียว'}</strong>
            </div>
            <div style={{ background: '#f3e8ff', padding: '6px 8px', borderRadius: '6px', fontSize: '11.5px', color: '#6b21a8' }}>
              🚆 <strong>รถไฟเข้าเมือง:</strong> {airport.expressTrainTh}
            </div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#333' }}>
              📏 ระยะทางตรงเข้าโรงแรม: <strong>~{airportToHotelKm.toFixed(1)} กม.</strong>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Hotel marker (Base camp) */}
      <Marker position={[hotel.lat, hotel.lng]} icon={hotelIcon()}>
        <Popup>
          <div style={{ fontFamily: 'system-ui', fontSize: '13px', minWidth: '220px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#ff3366', marginBottom: '4px' }}>
              🏨 ฐานที่พัก: {hotel.nameTh}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              📍 {hotel.areaTh}<br />
              🚇 {hotel.nearestStation} (เดิน {hotel.walkMinutesToStation} นาที)
            </div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#38bdf8' }}>
              🛫 รับจากสนามบิน: ~{airportToHotelKm.toFixed(1)} กม.
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Attraction markers */}
      {allAttractions.map((a, idx) => {
        const isSelected = selectedSpotIds.includes(a.id);
        const dist = haversineKm(hotel.lat, hotel.lng, a.lat, a.lng);
        return (
          <Marker key={a.id} position={[a.lat, a.lng]} icon={attractionIcon(idx, isSelected)}>
            <Popup>
              <div style={{ fontFamily: 'system-ui', fontSize: '13px', minWidth: '220px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>
                  📍 {a.nameTh.split('(')[0].trim()}
                </div>
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '6px' }}>
                  {a.nameEn} • {a.area}
                </div>
                <div style={{
                  background: isSelected ? '#dcfce7' : '#fef3c7',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-block',
                }}>
                  {isSelected ? '✅ อยู่ในทริป' : '⏳ ยังไม่ได้เลือก'}
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#444' }}>
                  📏 ห่างจากโรงแรม: <strong>{dist.toFixed(1)} กม.</strong><br />
                  🚇 {a.nearestStation}<br />
                  ⏱️ ใช้เวลาเที่ยว: ~{a.estimatedTimeHours} ชม.
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Leg 0: Airport to Hotel Transit Polyline */}
      <Polyline
        positions={[[airport.lat, airport.lng], [hotel.lat, hotel.lng]]}
        pathOptions={{
          color: '#38bdf8',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        }}
      />

      {/* Distance lines from hotel to selected attractions */}
      {lines.map((line) => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            color: '#ff6584',
            weight: 2.5,
            opacity: 0.7,
            dashArray: '6, 6',
          }}
        />
      ))}
    </MapContainer>
  );
};

export default TripMapInner;
