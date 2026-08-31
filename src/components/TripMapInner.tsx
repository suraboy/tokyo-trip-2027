'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Attraction, HotelOption } from '@/types/travel';

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
      animation: hotelPulse 2s ease-in-out infinite;
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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13);
    }
  }, [positions, map]);
  return null;
}

interface TripMapProps {
  hotel: HotelOption;
  selectedAttractions: Attraction[];
  allAttractions: Attraction[];
  selectedSpotIds: string[];
}

const TripMapInner: React.FC<TripMapProps> = ({
  hotel,
  selectedAttractions,
  allAttractions,
  selectedSpotIds,
}) => {
  const center: [number, number] = [hotel.lat, hotel.lng];

  // All positions for bounds fitting
  const allPositions = useMemo(() => {
    const pts: [number, number][] = [[hotel.lat, hotel.lng]];
    // Only include selected attractions that are reasonably close for bounds
    selectedAttractions.forEach((a) => {
      pts.push([a.lat, a.lng]);
    });
    return pts;
  }, [hotel, selectedAttractions]);

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
      zoom={12}
      scrollWheelZoom={true}
      style={{
        width: '100%',
        height: '560px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={allPositions} />

      {/* Hotel marker */}
      <Marker position={[hotel.lat, hotel.lng]} icon={hotelIcon()}>
        <Popup>
          <div style={{ fontFamily: 'system-ui', fontSize: '13px', minWidth: '200px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>
              🏨 {hotel.nameTh}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              📍 {hotel.areaTh}<br />
              🚇 {hotel.nearestStation} (เดิน {hotel.walkMinutesToStation} นาที)
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

      {/* Distance lines from hotel to selected attractions */}
      {lines.map((line) => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            color: '#ff6584',
            weight: 2,
            opacity: 0.5,
            dashArray: '8, 6',
          }}
        />
      ))}
    </MapContainer>
  );
};

export default TripMapInner;
