'use client';

import React from 'react';
import { WayfinderDecision, MonthData, FlightOption } from '@/types/travel';
import { INITIAL_WAYFINDER_DECISIONS } from '@/data/mockData';
import { 
  Compass, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  Plane, 
  Hotel, 
  CreditCard,
  MapPin,
  ArrowDown
} from 'lucide-react';

interface WayfinderRoadmapTabProps {
  selectedMonth: MonthData;
  selectedFlight: FlightOption | undefined;
  wishlistCount: number;
}

export const WayfinderRoadmapTab: React.FC<WayfinderRoadmapTabProps> = ({
  selectedMonth,
  selectedFlight,
  wishlistCount,
}) => {
  const decisions: WayfinderDecision[] = [
    {
      id: 'dec-1-dates',
      title: 'Decision 1: กำหนดช่วงเวลาเดินทางที่แน่นอน (Travel Season & Dates)',
      category: 'Dates',
      status: 'DECIDED',
      summaryTh: `เลือกช่วง: ${selectedMonth.nameTh} (${selectedMonth.nameEn}) • ${selectedMonth.seasonTh}`,
      selectedOption: `ล็อกเดือน ${selectedMonth.nameTh} 2027 (Score ${selectedMonth.overallScore}/100, อุณหภูมิ ${selectedMonth.avgTempC.min}-${selectedMonth.avgTempC.max}°C)`,
      impactTh: 'ปลดล็อกการเช็คราคาตั๋วเครื่องบินและฤดูใบไม้/ดอกไม้',
    },
    {
      id: 'dec-2-flights',
      title: 'Decision 2: เส้นทางบิน & สายการบิน (Direct vs Transit & Airport)',
      category: 'Flights',
      status: selectedFlight ? 'DECIDED' : 'IN_PROGRESS',
      summaryTh: selectedFlight
        ? `เลือกสายการบิน: ${selectedFlight.airline} (${selectedFlight.from} → ${selectedFlight.to})`
        : 'กำลังเปรียบเทียบระหว่าง Thai Airways, ANA, JAL และ AirAsia X / ZIPAIR',
      selectedOption: selectedFlight
        ? `${selectedFlight.airline} (${selectedFlight.flightNumber}) - ฿${selectedFlight.basePriceTHB.toLocaleString()} THB`
        : 'รอยืนยันไฟลท์เป้าหมาย',
      impactTh: 'กำหนดเวลาเดินทางเข้าเมืองและสนามบินปลายทาง (Haneda / Narita)',
    },
    {
      id: 'dec-3-region',
      title: 'Decision 3: ขอบเขตเส้นทางท่องเที่ยว (Tokyo Only vs Tokyo + Fuji + Kansai)',
      category: 'Attractions',
      status: wishlistCount >= 5 ? 'DECIDED' : 'IN_PROGRESS',
      summaryTh: `มีสถานที่ใน Wishlist แล้ว ${wishlistCount} แห่ง`,
      selectedOption: wishlistCount >= 5
        ? `ทริปหลัก: Tokyo + Mt. Fuji Kawaguchiko (${wishlistCount} จุดหมาย)`
        : 'กำลังคัดเลือกสถานที่ท่องเที่ยวลงใน Wishlist',
      impactTh: 'กำหนดความจำเป็นในการจองตั๋วรถไฟด่วน Fuji Excursion หรือ Shinkansen',
    },
    {
      id: 'dec-4-passes',
      title: 'Decision 4: บัตรโดยสารและการเดินทาง (Suica/Pasmo IC vs Day Pass)',
      category: 'Passes & Budget',
      status: 'FOG',
      summaryTh: 'เตรียมใช้งาน Apple Wallet Digital Suica/Pasmo หรือบัตร Welcome Suica สำหรับรถไฟใต้ดินโตเกียว',
      impactTh: 'ความสะดวกในการเดินทางและส่วนลดค่ารถไฟใต้ดิน Tokyo Subway 72-Hour Ticket',
    },
    {
      id: 'dec-5-stay',
      title: 'Decision 5: ย่านที่พักในโตเกียว (Shinjuku vs Ueno vs Ginza)',
      category: 'Stays',
      status: 'FOG',
      summaryTh: 'เลือกทำเลย่านโรงแรม: Shinjuku (คึกคัก เดินทางไปฟูจิง่าย) หรือ Ueno (เดินทางไปสนามบินนาริตะด้วย Skyliner ตรง 40 นาที)',
      impactTh: 'งบประมาณที่พัก 2,800 - 4,500 บาท/คืน และการลากกระเป๋า',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Wayfinder Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-purple">
                <Compass size={12} /> Wayfinder Planning System
              </span>
              <span className="badge badge-sakura">Tokyo Trip 2027 Roadmap</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              แผนที่การตัดสินใจตามหลัก Wayfinder (Decision Map)
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '750px', lineHeight: '1.5' }}>
              หลักการ Wayfinder: คลี่คลายหมอกแห่งความไม่แน่นอน (Fog of War) ทีละการตัดสินใจ 
              จาก วันเดินทาง → ตั๋วเครื่องบิน → สถานที่ท่องเที่ยว → บัตรโดยสารและที่พัก
            </p>
          </div>

          <div
            style={{
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '11px', color: '#c084fc' }}>Wayfinder Status</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              2 จาก 5 ปลดล็อกแล้ว
            </div>
            <div style={{ fontSize: '12px', color: '#34d399' }}>
              Frontier Active
            </div>
          </div>
        </div>
      </div>

      {/* Decision Flow Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {decisions.map((dec, index) => {
          const isDecided = dec.status === 'DECIDED';
          const isInProgress = dec.status === 'IN_PROGRESS';
          const isFog = dec.status === 'FOG';

          return (
            <div key={dec.id}>
              <div
                className="card"
                style={{
                  borderLeft: isDecided
                    ? '4px solid var(--accent-emerald)'
                    : isInProgress
                    ? '4px solid var(--accent-amber)'
                    : '4px solid #64748b',
                  background: isDecided
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : isFog
                    ? 'rgba(15, 23, 42, 0.4)'
                    : 'var(--gradient-card)',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isDecided
                          ? 'rgba(16, 185, 129, 0.2)'
                          : isInProgress
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isDecided ? '#34d399' : isInProgress ? '#fbbf24' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                      }}
                    >
                      {index + 1}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                      {dec.title}
                    </h3>
                  </div>

                  <div>
                    {isDecided && (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={13} /> ปลดล็อกแล้ว (Decided)
                      </span>
                    )}
                    {isInProgress && (
                      <span className="badge badge-amber">
                        <Sparkles size={13} /> อยู่ที่ขอบความรู้ (Frontier)
                      </span>
                    )}
                    {isFog && (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                        <HelpCircle size={13} /> ในหมอก (Fog of War)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '12px' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      ข้อสรุป / การตัดสินใจปัจจุบัน
                    </div>
                    <div style={{ fontSize: '13.5px', color: isDecided ? '#34d399' : '#fff', fontWeight: isDecided ? 700 : 500 }}>
                      {dec.selectedOption || dec.summaryTh}
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      ผลกระทบต่อขั้นตอนถัดไป (Impact)
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                      {dec.impactTh}
                    </div>
                  </div>
                </div>
              </div>

              {index < decisions.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <ArrowDown size={18} color="rgba(255, 255, 255, 0.2)" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
