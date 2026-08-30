'use client';

import React from 'react';
import { TabType, Currency, MonthData, FlightOption, Attraction } from '@/types/travel';
import { JPY_TO_THB_RATE, INITIAL_WAYFINDER_DECISIONS } from '@/data/mockData';
import { 
  Calendar, 
  Plane, 
  MapPin, 
  DollarSign, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Sun, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface OverviewTabProps {
  setActiveTab: (tab: TabType) => void;
  selectedMonth: MonthData;
  selectedFlight: FlightOption | undefined;
  wishlistAttractions: Attraction[];
  currency: Currency;
  tripDurationDays: number;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  setActiveTab,
  selectedMonth,
  selectedFlight,
  wishlistAttractions,
  currency,
  tripDurationDays,
}) => {
  // Estimated budget calculation
  const flightCostTHB = selectedFlight ? selectedFlight.basePriceTHB : 18500;
  const hotelPerNightTHB = 3200;
  const hotelTotalTHB = hotelPerNightTHB * (tripDurationDays - 1);
  const dailyFoodJPY = 4500;
  const foodTotalJPY = dailyFoodJPY * tripDurationDays;
  const foodTotalTHB = Math.round(foodTotalJPY * JPY_TO_THB_RATE);
  const attractionCostJPY = wishlistAttractions.reduce((sum, a) => sum + a.priceJPY, 0);
  const attractionCostTHB = Math.round(attractionCostJPY * JPY_TO_THB_RATE);
  const transportPassTHB = 2500; // Metro pass + Skyliner

  const totalEstimatedTHB = flightCostTHB + hotelTotalTHB + foodTotalTHB + attractionCostTHB + transportPassTHB;
  const totalEstimatedJPY = Math.round(totalEstimatedTHB / JPY_TO_THB_RATE);

  const displayTotal =
    currency === 'THB'
      ? `฿${totalEstimatedTHB.toLocaleString()} THB`
      : `¥${totalEstimatedJPY.toLocaleString()} JPY`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(88, 28, 135, 0.4) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          padding: '32px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <span className="badge badge-sakura">
              <Sparkles size={12} /> Tokyo & Japan Trip 2027
            </span>
            <span className="badge badge-cyan">เป้าหมาย: 7 - 10 วัน</span>
            <span className="badge badge-emerald">Wayfinder Planning Active</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: '1.25', marginBottom: '12px', color: '#fff' }}>
            วางแผนทริปเที่ยวญี่ปุ่น 2027 <br />
            <span style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ครบทุกมิติ: วันที่ดีที่สุด • ตั๋วบิน • ที่เที่ยวไฮไลท์
            </span>
          </h1>

          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
            เริ่มต้นเตรียมทริปในฝันล่วงหน้าด้วยข้อมูลเปรียบเทียบฤดูกาล สถิติสภาพอากาศ ตั๋วเครื่องบินแบบละเอียด
            และรวบรวมสถานที่ท่องเที่ยวที่ต้องไปพร้อมประเมินงบประมาณแบบเรียลไทม์
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={() => setActiveTab('dates')} className="btn-primary">
              <Calendar size={16} />
              <span>หาวันที่ดีที่สุด (Best Dates)</span>
            </button>
            <button onClick={() => setActiveTab('flights')} className="btn-secondary">
              <Plane size={16} />
              <span>ค้นหาตั๋วเครื่องบิน (Flights)</span>
            </button>
            <button onClick={() => setActiveTab('attractions')} className="btn-secondary">
              <MapPin size={16} />
              <span>ดูที่เที่ยว ({wishlistAttractions.length} Wishlist)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4">
        {/* Date Stat */}
        <div className="card" onClick={() => setActiveTab('dates')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ช่วงเวลาเดินทางที่เลือก</span>
            <Calendar size={18} color="var(--accent-pink)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            {selectedMonth.nameTh} ({selectedMonth.nameEn})
          </div>
          <div style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sun size={13} /> {selectedMonth.avgTempC.min}°C - {selectedMonth.avgTempC.max}°C • Score {selectedMonth.overallScore}/100
          </div>
        </div>

        {/* Flight Stat */}
        <div className="card" onClick={() => setActiveTab('flights')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>สายการบินเป้าหมาย</span>
            <Plane size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedFlight ? selectedFlight.airline : 'Thai Airways (แนะนำ)'}
          </div>
          <div style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> ฿{flightCostTHB.toLocaleString()} THB (บินตรง)
          </div>
        </div>

        {/* Wishlist Stat */}
        <div className="card" onClick={() => setActiveTab('attractions')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>สถานที่ใน Wishlist</span>
            <MapPin size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            {wishlistAttractions.length} สถานที่
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ครอบคลุม {new Set(wishlistAttractions.map((a) => a.city)).size || 1} เมือง
          </div>
        </div>

        {/* Budget Stat */}
        <div className="card" onClick={() => setActiveTab('itinerary')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ประมาณการงบรวม / คน</span>
            <DollarSign size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
            {displayTotal}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            สำหรับทริป {tripDurationDays} วัน ({Math.round(totalEstimatedTHB / tripDurationDays).toLocaleString()} ฿/วัน)
          </div>
        </div>
      </div>

      {/* 2-Column: Key Decision Summary & Wayfinder Snapshot */}
      <div className="grid-2">
        {/* Left: Summary of 3 Core Steps */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '18px' }}>
            <Sparkles size={20} color="var(--accent-pink)" />
            ภาพรวม 3 หัวใจหลักของทริป (Core Planning)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1 */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px' }}>
                    1. วันที่ดีที่สุด: {selectedMonth.nameTh} ({selectedMonth.seasonTh})
                  </span>
                  <span className="badge badge-sakura">{selectedMonth.overallScore}/100</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  {selectedMonth.highlights.slice(0, 2).join(' • ')}
                </p>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => setActiveTab('dates')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    เปรียบเทียบทั้ง 12 เดือน <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px' }}>
                    2. ตั๋วเครื่องบิน: {selectedFlight ? `${selectedFlight.airline} (${selectedFlight.from} → ${selectedFlight.to})` : 'เปรียบเทียบบินตรง vs ต่อเครื่อง'}
                  </span>
                  <span className="badge badge-cyan">{selectedFlight ? `${selectedFlight.flightType}` : '9 ตัวเลือก'}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Full-Service รวมน้ำหนักกระเป๋า 30-46kg (18,500-22,000฿) หรือ Low-Cost บินดึกถึงเช้า (9,800-11,500฿)
                </p>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => setActiveTab('flights')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    เลือกเที่ยวบินและคำนวณราคา <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px' }}>
                    3. ลิสต์สถานที่ท่องเที่ยว: คัดสรร 14 ไฮไลท์ยอดนิยม
                  </span>
                  <span className="badge badge-emerald">{wishlistAttractions.length} บันทึกแล้ว</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Shibuya Sky, teamLab, วัดอาซากุสะ, ฟูจิคาวากุจิโกะ, ดิสนีย์ซี, กินซ่า, คามาคุระ และโอซาก้า
                </p>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => setActiveTab('attractions')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    สำรวจและเพิ่มลงทริป <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Wayfinder Roadmap Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Compass size={20} color="var(--accent-purple)" />
              Wayfinder Decision Map (แผนที่การตัดสินใจ)
            </h3>
            <button onClick={() => setActiveTab('wayfinder')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              ดูรายละเอียด <ArrowRight size={14} />
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
            หลักการ Wayfinder: แก้ปัญหาทีละการตัดสินใจเพื่อเปิดหมอก (Fog of War) ก่อนลงมือจองจริง
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {INITIAL_WAYFINDER_DECISIONS.map((dec) => (
              <div
                key={dec.id}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>
                    {dec.title.split(':')[0]}: {dec.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {dec.selectedOption || dec.summaryTh.slice(0, 50) + '...'}
                  </div>
                </div>

                <div>
                  {dec.status === 'DECIDED' && (
                    <span className="badge badge-emerald">
                      <CheckCircle2 size={12} /> Decided
                    </span>
                  )}
                  {dec.status === 'IN_PROGRESS' && (
                    <span className="badge badge-amber">In Progress</span>
                  )}
                  {dec.status === 'FOG' && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                      Fog of War
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: '#c084fc',
            }}
          >
            <ShieldCheck size={18} />
            <span>Next Step: เลือกเดือนที่ใช่ใน "Best Dates" และเลือกเที่ยวบินเพื่อปลดล็อก Decision 1 & 2!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
