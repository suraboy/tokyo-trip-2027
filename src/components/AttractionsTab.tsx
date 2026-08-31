'use client';

import React, { useState } from 'react';
import { Attraction, Currency } from '@/types/travel';
import { ATTRACTIONS_DATA, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  MapPin, 
  Search, 
  Heart, 
  Clock, 
  Train, 
  Star, 
  Sparkles, 
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface AttractionsTabProps {
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onSelectAttractionForModal: (attraction: Attraction) => void;
  currency: Currency;
}

export const AttractionsTab: React.FC<AttractionsTabProps> = ({
  wishlistIds,
  onToggleWishlist,
  onSelectAttractionForModal,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'ทั้งหมด (All)' },
    { id: 'Nature & View', label: '🏙️ วิวมุมสูง & ธรรมชาติ' },
    { id: 'Culture & Shrine', label: '⛩️ วัด & ประวัติศาสตร์' },
    { id: 'Anime & Tech', label: '🎮 อนิเมะ & เทคโนโลยี' },
    { id: 'Shopping & Food', label: '🍜 สตรีทฟู้ด & ช้อปปิ้ง' },
    { id: 'Theme Park', label: '🎡 สวนสนุกระดับโลก' },
  ];

  const cities = ['all', 'Tokyo', 'Fuji/Hakone', 'Kyoto', 'Osaka', 'Yokohama'];

  const filteredAttractions = ATTRACTIONS_DATA.filter((item) => {
    if (wishlistOnly && !wishlistIds.includes(item.id)) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName =
        item.nameEn.toLowerCase().includes(q) ||
        item.nameTh.toLowerCase().includes(q) ||
        item.nameJp.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName) return false;
    }
    return true;
  });

  const formatPrice = (jpy: number) => {
    if (jpy === 0) return 'FREE';
    if (currency === 'THB') {
      return `฿${Math.round(jpy * JPY_TO_THB_RATE).toLocaleString()} THB`;
    }
    return `¥${jpy.toLocaleString()} JPY`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Attractions Header */}
      <div className="bento-card">
        <div className="bento-card-kanji-bg">名所</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="editorial-tag tag-green">
                <Sparkles size={11} /> CURATED JAPAN EXPEDITION DIRECTORY
              </span>
              <span className="editorial-tag tag-red">TOKYO • FUJI • KYOTO • OSAKA</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              สารบบสถานที่ท่องเที่ยวญี่ปุ่นยอดนิยม (Attraction Directory)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: '1.6' }}>
              รวบรวม 14 พิกัดยอดฮิต พร้อมข้อมูลการเดินทาง สถานีรถไฟที่ใกล้ที่สุด ระยะเวลาเที่ยว และข้อควรระวัง
            </p>
          </div>

          <button
            onClick={() => setWishlistOnly(!wishlistOnly)}
            className={`btn-editorial-secondary ${wishlistOnly ? 'active' : ''}`}
            style={{
              padding: '10px 18px',
              background: wishlistOnly ? 'var(--vermilion)' : 'var(--bg-surface-raised)',
              borderColor: wishlistOnly ? 'var(--vermilion)' : 'var(--border-hairline)',
              color: wishlistOnly ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Heart size={15} fill={wishlistOnly ? '#fff' : 'none'} />
            <span>WISHLIST [{wishlistIds.length}]</span>
          </button>
        </div>

        {/* Search & City Filter Bar */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานที่ ย่าน หรือแท็ก (เช่น Shibuya, Fuji, Asakusa, Mario)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-hairline)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* City Filter Strip */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`btn-editorial-secondary ${selectedCity === c ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  background: selectedCity === c ? 'var(--bg-surface-active)' : 'transparent',
                  borderColor: selectedCity === c ? 'var(--fuji-cyan)' : 'var(--border-hairline)',
                  color: selectedCity === c ? 'var(--fuji-cyan)' : 'var(--text-secondary)',
                }}
              >
                {c === 'all' ? 'ALL CITIES' : c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn-editorial-secondary ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              background: selectedCategory === cat.id ? 'var(--matcha-emerald)' : 'var(--bg-surface)',
              borderColor: selectedCategory === cat.id ? 'var(--matcha-emerald)' : 'var(--border-hairline)',
              color: selectedCategory === cat.id ? '#000' : 'var(--text-secondary)',
              fontWeight: selectedCategory === cat.id ? 800 : 500,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Attractions Editorial Grid */}
      <div className="grid-cols-3">
        {filteredAttractions.map((item) => {
          const isWishlisted = wishlistIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="bento-card"
              style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => onSelectAttractionForModal(item)}
            >
              {/* Photo & Overlays */}
              <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.nameEn}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, #0e121a 0%, rgba(14, 18, 26, 0.2) 60%, rgba(0,0,0,0.5) 100%)',
                  }}
                />

                {/* Top Badges */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span className="editorial-tag tag-red" style={{ fontSize: '10px' }}>
                    {item.city}
                  </span>
                  <span className="editorial-tag tag-cyan" style={{ fontSize: '10px' }}>
                    {item.area}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(item.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: isWishlisted ? 'var(--vermilion)' : 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isWishlisted ? '0 0 15px var(--vermilion-glow)' : 'none',
                  }}
                >
                  <Heart size={16} fill={isWishlisted ? '#fff' : 'none'} />
                </button>

                {/* Name Overlay in Photo */}
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Star size={11} fill="#facc15" /> MUST VISIT SCORE: {item.mustVisitScore}/100
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                    {item.nameTh}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    {item.nameEn} • {item.nameJp}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.descriptionTh}
                  </p>
                </div>

                <div>
                  {/* Meta Specs Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-surface-raised)',
                      borderRadius: 'var(--radius-xs)',
                      marginBottom: '12px',
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Clock size={12} color="var(--fuji-cyan)" />
                      <span>{item.estimatedTimeHours}H</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Train size={12} color="#34d399" />
                      <span style={{ maxWidth: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nearestStation.split(' ')[0]}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, color: item.priceJPY === 0 ? '#34d399' : 'var(--fuji-cyan)' }}>
                      {formatPrice(item.priceJPY)}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      #{item.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--vermilion)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      DETAILS & TIPS <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
