'use client';

import React from 'react';
import { WayfinderDecision, MonthData, FlightOption } from '@/types/travel';
import { 
  Compass, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Wayfinder Header */}
      <div className="bento-card">
        <div className="bento-card-kanji-bg">羅針盤</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="editorial-tag tag-purple">
                <Compass size={11} /> WAYFINDER DECISION ARCHITECTURE
              </span>
              <span className="editorial-tag tag-red">TOKYO 2027 MAP</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              แผนที่การตัดสินใจ Wayfinder (Decision Matrix)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: '1.6' }}>
              เปิดหมอกความไม่แน่นอน (Fog of War) ทีละจุดตัดสินใจ เพื่อไม่ให้เกิดข้อผิดพลาดในการจองจริง
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--lavender)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              textAlign: 'right',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--lavender)' }}>
              DECISION PROGRESS
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              2 / 5 UNLOCKED
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              FRONTIER: ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Decision Sequential Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {decisions.map((dec, index) => {
          const isDecided = dec.status === 'DECIDED';
          const isInProgress = dec.status === 'IN_PROGRESS';
          const isFog = dec.status === 'FOG';

          return (
            <div key={dec.id}>
              <div
                className="bento-card"
                style={{
                  borderLeft: isDecided
                    ? '4px solid var(--matcha-emerald)'
                    : isInProgress
                    ? '4px solid var(--tokyo-gold)'
                    : '4px solid var(--text-tertiary)',
                  background: isDecided
                    ? 'var(--bg-surface-active)'
                    : isFog
                    ? 'rgba(14, 18, 26, 0.5)'
                    : 'var(--grad-dark-bento)',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-surface-raised)',
                        color: isDecided ? 'var(--matcha-emerald)' : isInProgress ? 'var(--tokyo-gold)' : 'var(--text-tertiary)',
                        border: '1px solid var(--border-hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                      {dec.title}
                    </h3>
                  </div>

                  <div>
                    {isDecided && (
                      <span className="editorial-tag tag-green">
                        <CheckCircle2 size={12} /> DECIDED
                      </span>
                    )}
                    {isInProgress && (
                      <span className="editorial-tag tag-gold">
                        <Sparkles size={12} /> FRONTIER
                      </span>
                    )}
                    {isFog && (
                      <span className="editorial-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)' }}>
                        <HelpCircle size={12} /> FOG OF WAR
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: '14px' }}>
                  <div style={{ padding: '12px 14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '3px' }}>
                      // CURRENT CONCLUSION
                    </div>
                    <div style={{ fontSize: '13.5px', color: isDecided ? '#34d399' : '#fff', fontWeight: isDecided ? 700 : 500 }}>
                      {dec.selectedOption || dec.summaryTh}
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '3px' }}>
                      // DOWNSTREAM IMPACT
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {dec.impactTh}
                    </div>
                  </div>
                </div>
              </div>

              {index < decisions.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <ArrowDown size={16} color="var(--border-strong)" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
