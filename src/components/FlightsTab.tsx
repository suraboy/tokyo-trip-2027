'use client';

import React, { useState } from 'react';
import { FlightOption, Currency } from '@/types/travel';
import { FLIGHT_OPTIONS, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  Plane, 
  Luggage, 
  Utensils, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  Info
} from 'lucide-react';

interface FlightsTabProps {
  selectedFlight: FlightOption | undefined;
  onSelectFlight: (flight: FlightOption) => void;
  currency: Currency;
  selectedMonthName: string;
}

export const FlightsTab: React.FC<FlightsTabProps> = ({
  selectedFlight,
  onSelectFlight,
  currency,
  selectedMonthName,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'full_service' | 'low_cost'>('all');
  const [addLccBaggage, setAddLccBaggage] = useState<boolean>(true);
  const [addTravelInsurance, setAddTravelInsurance] = useState<boolean>(true);

  const filteredFlights = FLIGHT_OPTIONS.filter((f) => {
    if (filterType === 'direct' && f.stops !== 0) return false;
    if (filterType === 'full_service' && f.flightType !== 'Full Service') return false;
    if (filterType === 'low_cost' && f.flightType !== 'Low Cost') return false;
    return true;
  });

  const calculateEffectivePrice = (flight: FlightOption) => {
    let price = flight.basePriceTHB;
    if (flight.flightType === 'Low Cost' && addLccBaggage) {
      price += 1400;
    }
    if (addTravelInsurance) {
      price += 850;
    }
    return price;
  };

  const formatPrice = (thb: number) => {
    if (currency === 'THB') return `฿${thb.toLocaleString()} THB`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()} JPY`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Aviation Header Card */}
      <div className="bento-card">
        <div className="bento-card-kanji-bg">航空</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="editorial-tag tag-cyan">
                <Plane size={11} /> FLIGHT LOGISTICS & FARE RADAR 2027
              </span>
              <span className="editorial-tag tag-red">ROUTE: BKK / DMK ⇄ TYO</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              ค้นหาและเปรียบเทียบตั๋วเครื่องบินไปญี่ปุ่น (Flight Finder)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: '1.6' }}>
              เปรียบเทียบสายการบิน Full-Service และ Low-Cost ทั้งบินตรงและต่อเครื่อง วิเคราะห์น้ำหนักกระเป๋า อาหาร เวลาไฟลท์ และสนามบินปลายทาง
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--fuji-cyan)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              textAlign: 'right',
              boxShadow: '0 0 20px var(--fuji-cyan-glow)',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--fuji-cyan)' }}>
              SELECTED ITINERARY
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {selectedFlight ? `${selectedFlight.airline} (${selectedFlight.flightNumber})` : 'ยังไม่ได้เลือก'}
            </div>
            <div style={{ fontSize: '13px', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {selectedFlight ? formatPrice(calculateEffectivePrice(selectedFlight)) : '-'}
            </div>
          </div>
        </div>

        {/* Airport Matrix */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
        >
          <div style={{ padding: '14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '13.5px', color: 'var(--fuji-cyan)' }}>HANEDA (HND)</strong>
              <span className="editorial-tag tag-red" style={{ fontSize: '9.5px' }}>20 MIN TO CITY</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              เข้าเมืองเร็วสุดด้วย Tokyo Monorail หรือ Keikyu Line ประหยัดเวลาเดินทาง
            </p>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '13.5px', color: 'var(--tokyo-gold)' }}>NARITA (NRT)</strong>
              <span className="editorial-tag tag-gold" style={{ fontSize: '9.5px' }}>PROMO FARES</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              สายการบิน LCC และโปรโมชั่นตั๋วถูกที่สุด เข้าโตเกียวด้วย Keisei Skyliner 40 นาที
            </p>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '13.5px', color: '#34d399' }}>KANSAI (KIX)</strong>
              <span className="editorial-tag tag-green" style={{ fontSize: '9.5px' }}>OPEN-JAW</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              เหมาะกับทริปบินเข้าโตเกียว (TYO) แล้วบินกลับจากโอซาก้า (OSA)
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Inclusions Strip */}
      <div
        className="bento-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `ทั้งหมด (${FLIGHT_OPTIONS.length})` },
            { id: 'direct', label: '✈️ บินตรง (Direct)' },
            { id: 'full_service', label: '🍱 Full Service' },
            { id: 'low_cost', label: '💰 Budget LCC' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`btn-editorial-secondary ${filterType === item.id ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                background: filterType === item.id ? 'var(--fuji-cyan)' : 'var(--bg-surface-raised)',
                color: filterType === item.id ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            <input
              type="checkbox"
              checked={addLccBaggage}
              onChange={(e) => setAddLccBaggage(e.target.checked)}
              style={{ accentColor: 'var(--vermilion)' }}
            />
            <span>+ โหลดกระเป๋า 20kg (+1,400฿)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            <input
              type="checkbox"
              checked={addTravelInsurance}
              onChange={(e) => setAddTravelInsurance(e.target.checked)}
              style={{ accentColor: 'var(--vermilion)' }}
            />
            <span>+ ประกันเดินทาง (+850฿)</span>
          </label>
        </div>
      </div>

      {/* Boarding Pass Flight Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFlights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          const effectivePrice = calculateEffectivePrice(flight);

          return (
            <div
              key={flight.id}
              className="flight-ticket-card"
              style={{
                borderColor: isSelected ? 'var(--fuji-cyan)' : 'var(--border-hairline)',
                background: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                boxShadow: isSelected ? '0 0 25px var(--fuji-cyan-glow)' : 'var(--shadow-bento)',
                padding: '22px 26px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                {/* Airline Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-sm)',
                      background: flight.logoColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '15px',
                    }}
                  >
                    {flight.airlineCode}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{flight.airline}</h3>
                      <span className="editorial-tag tag-purple" style={{ fontSize: '10px' }}>
                        {flight.flightNumber}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {flight.aircraft} • {flight.flightType}
                    </div>
                  </div>
                </div>

                {/* Flight Times Timeline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {flight.departureTime}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {flight.from}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '110px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {flight.duration}
                    </span>
                    <div style={{ width: '100%', height: '2px', background: 'var(--border-strong)', margin: '4px 0', position: 'relative' }}>
                      <Plane size={12} color="var(--fuji-cyan)" style={{ position: 'absolute', top: '-5px', left: '44%' }} />
                    </div>
                    <span style={{ fontSize: '10.5px', color: flight.stops === 0 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                      {flight.stops === 0 ? 'บินตรง Direct' : `แวะต่อเครื่อง ${flight.stopAirport?.split(' ')[0]}`}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {flight.arrivalTime}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {flight.to}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: flight.baggageIncludedKg > 0 ? '#34d399' : '#fbbf24' }}>
                    <Luggage size={14} />
                    <span>{flight.baggageIncludedKg > 0 ? `โหลดกระเป๋า ${flight.baggageIncludedKg} kg` : 'กระเป๋าถือ 7kg'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: flight.mealsIncluded ? '#34d399' : 'var(--text-tertiary)' }}>
                    <Utensils size={14} />
                    <span>{flight.mealsIncluded ? 'อาหารร้อนครบชุด' : 'สั่งซื้ออาหารล่วงหน้า'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15' }}>
                    <Star size={13} fill="#facc15" />
                    <span>คะแนน {flight.rating} / 5.0</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--fuji-cyan)' }}>
                    {formatPrice(effectivePrice)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                    {flight.flightType === 'Low Cost' && addLccBaggage ? 'รวมกระเป๋า 20kg แล้ว' : 'ราคาไป-กลับ / คน'}
                  </div>

                  <button
                    onClick={() => onSelectFlight(flight)}
                    className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                    style={{ padding: '8px 18px', width: '100%', justifyContent: 'center' }}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} /> เลือกไฟลท์นี้แล้ว
                      </>
                    ) : (
                      'เลือกไฟลท์นี้'
                    )}
                  </button>
                </div>
              </div>

              {/* Tag Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)' }}>
                {flight.tags.map((tag, idx) => (
                  <span key={idx} className="editorial-tag tag-purple" style={{ fontSize: '10.5px' }}>
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
