'use client';

import React, { useState } from 'react';
import { FlightOption, Currency } from '@/types/travel';
import { FLIGHT_OPTIONS, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  Plane, 
  Clock, 
  Luggage, 
  Utensils, 
  Check, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Star, 
  Filter,
  Info,
  Calendar
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
  const [destFilter, setDestFilter] = useState<'all' | 'HND' | 'NRT' | 'KIX'>('all');
  const [addLccBaggage, setAddLccBaggage] = useState<boolean>(true); // +1,400 THB for 20kg
  const [addTravelInsurance, setAddTravelInsurance] = useState<boolean>(true); // +850 THB

  const filteredFlights = FLIGHT_OPTIONS.filter((f) => {
    if (filterType === 'direct' && f.stops !== 0) return false;
    if (filterType === 'full_service' && f.flightType !== 'Full Service') return false;
    if (filterType === 'low_cost' && f.flightType !== 'Low Cost') return false;
    if (destFilter !== 'all' && f.to !== destFilter) return false;
    return true;
  });

  const calculateEffectivePrice = (flight: FlightOption) => {
    let price = flight.basePriceTHB;
    if (flight.flightType === 'Low Cost' && addLccBaggage) {
      price += 1400; // Baggage 20kg roundtrip
    }
    if (addTravelInsurance) {
      price += 850;
    }
    return price;
  };

  const formatPrice = (thb: number) => {
    if (currency === 'THB') {
      return `฿${thb.toLocaleString()} THB`;
    }
    const jpy = Math.round(thb / JPY_TO_THB_RATE);
    return `¥${jpy.toLocaleString()} JPY`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Flight Search Banner */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-cyan">
                <Plane size={12} /> Flight Intelligence 2027
              </span>
              <span className="badge badge-sakura">เส้นทางยอดนิยม: กรุงเทพฯ ⇄ ญี่ปุ่น</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              ค้นหาและเปรียบเทียบตั๋วเครื่องบินไปญี่ปุ่น (Flight Finder)
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '750px', lineHeight: '1.5' }}>
              เปรียบเทียบสายการบิน Full-Service และ Low-Cost ทั้งบินตรงและต่อเครื่อง วิเคราะห์น้ำหนักกระเป๋า อาหาร เวลาไฟลท์ และสนามบินปลายทาง (Haneda vs Narita vs Kansai)
            </p>
          </div>

          <div
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '11px', color: '#38bdf8' }}>เที่ยวบินที่เลือกไว้</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              {selectedFlight ? `${selectedFlight.airline} (${selectedFlight.flightNumber})` : 'ยังไม่ได้เลือก'}
            </div>
            <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 700 }}>
              {selectedFlight ? formatPrice(calculateEffectivePrice(selectedFlight)) : '-'}
            </div>
          </div>
        </div>

        {/* Airport Comparison Tips */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
        >
          {/* HND */}
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>สนามบินฮาเนดะ (HND)</span>
              <span className="badge badge-sakura" style={{ fontSize: '10px' }}>ใกล้เมืองสุด</span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              เข้าสู่ใจกลางโตเกียว (Shinagawa/Shibuya) เพียง <strong>20 นาที</strong> ด้วยรถไฟ Keikyu / Tokyo Monorail ค่าเดินทางเพียง ~500 เยน
            </p>
          </div>

          {/* NRT */}
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>สนามบินนาริตะ (NRT)</span>
              <span className="badge badge-amber" style={{ fontSize: '10px' }}>ไฟลท์เยอะ/ถูกกว่า</span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              ตัวเลือกสายการบิน LCC และไฟลท์โปรโมชั่นมากที่สุด เข้าโตเกียวด้วย Keisei Skyliner (40 นาทีถึง Ueno) หรือ N'EX
            </p>
          </div>

          {/* KIX */}
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>สนามบินคันไซ โอซาก้า (KIX)</span>
              <span className="badge badge-emerald" style={{ fontSize: '10px' }}>สำหรับคันไซ</span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              เหมาะกับทริป Open-Jaw เช่น ขาไปลงโตเกียว (NRT/HND) ขากลับบินจากโอซาก้า (KIX) โดยไม่ต้องนั่งชินคันเซ็นย้อนกลับมา
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Add-on Controls */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('all')}
            className={`btn-secondary ${filterType === 'all' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              background: filterType === 'all' ? 'var(--accent-cyan)' : 'transparent',
              color: filterType === 'all' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            ทั้งหมด ({FLIGHT_OPTIONS.length})
          </button>
          <button
            onClick={() => setFilterType('direct')}
            className={`btn-secondary ${filterType === 'direct' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              background: filterType === 'direct' ? 'var(--accent-cyan)' : 'transparent',
              color: filterType === 'direct' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            ✈️ บินตรงเท่านั้น (Direct)
          </button>
          <button
            onClick={() => setFilterType('full_service')}
            className={`btn-secondary ${filterType === 'full_service' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              background: filterType === 'full_service' ? 'var(--accent-cyan)' : 'transparent',
              color: filterType === 'full_service' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            🍱 Full Service (รวมกระเป๋า+อาหาร)
          </button>
          <button
            onClick={() => setFilterType('low_cost')}
            className={`btn-secondary ${filterType === 'low_cost' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              background: filterType === 'low_cost' ? 'var(--accent-cyan)' : 'transparent',
              color: filterType === 'low_cost' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            💰 Budget Low Cost
          </button>
        </div>

        {/* Add-ons Checkbox */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={addLccBaggage}
              onChange={(e) => setAddLccBaggage(e.target.checked)}
              style={{ accentColor: 'var(--accent-pink)' }}
            />
            <span>+ โหลดกระเป๋า 20kg สำหรับ LCC (+1,400฿)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={addTravelInsurance}
              onChange={(e) => setAddTravelInsurance(e.target.checked)}
              style={{ accentColor: 'var(--accent-pink)' }}
            />
            <span>+ ประกันเดินทางต่างประเทศ (+850฿)</span>
          </label>
        </div>
      </div>

      {/* Flight Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFlights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          const effectivePrice = calculateEffectivePrice(flight);

          return (
            <div
              key={flight.id}
              className="card"
              style={{
                borderColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'var(--gradient-card)',
                boxShadow: isSelected ? '0 0 25px rgba(56, 189, 248, 0.25)' : 'var(--shadow-card)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                {/* Airline & Route Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '260px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: flight.logoColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    {flight.airlineCode}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{flight.airline}</h3>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', fontSize: '11px', color: '#cbd5e1' }}>
                        {flight.flightNumber}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {flight.aircraft} • {flight.flightType}
                    </div>
                  </div>
                </div>

                {/* Schedule Times */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{flight.departureTime}</div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{flight.from}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{flight.fromName.split(' ')[0]}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>{flight.duration}</span>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.2)', position: 'relative' }}>
                      <Plane size={12} color="#38bdf8" style={{ position: 'absolute', top: '-5px', left: '42%' }} />
                    </div>
                    <span style={{ fontSize: '10.5px', color: flight.stops === 0 ? '#34d399' : '#fbbf24', marginTop: '4px', fontWeight: 600 }}>
                      {flight.stops === 0 ? 'บินตรง Direct' : `แวะต่อเครื่อง ${flight.stopAirport?.split(' ')[0]}`}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{flight.arrivalTime}</div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{flight.to}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{flight.toName.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Inclusions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: flight.baggageIncludedKg > 0 ? '#34d399' : '#fbbf24' }}>
                    <Luggage size={14} />
                    <span>
                      {flight.baggageIncludedKg > 0
                        ? `กระเป๋าโหลด ${flight.baggageIncludedKg} kg`
                        : 'กระเป๋าถือขึ้นเครื่อง 7kg'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: flight.mealsIncluded ? '#34d399' : '#94a3b8' }}>
                    <Utensils size={14} />
                    <span>{flight.mealsIncluded ? 'อาหารร้อน & เครื่องดื่ม' : 'สั่งซื้ออาหารล่วงหน้าได้'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>คะแนนรีวิว {flight.rating} / 5.0</span>
                  </div>
                </div>

                {/* Price & Select Button */}
                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }}>
                    {formatPrice(effectivePrice)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {flight.flightType === 'Low Cost' && addLccBaggage ? 'รวมกระเป๋า 20kg แล้ว' : 'ราคาตั๋วไป-กลับ / คน'}
                  </div>

                  <button
                    onClick={() => onSelectFlight(flight)}
                    className={isSelected ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '8px 18px', fontSize: '13px', width: '100%', justifyContent: 'center' }}
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

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {flight.tags.map((tag, idx) => (
                  <span key={idx} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px', color: '#cbd5e1' }}>
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
