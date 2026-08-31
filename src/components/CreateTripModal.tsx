'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight,
  User,
  FileText
} from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkspace: (title: string, creator: string) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onStartWorkspace,
}) => {
  const [tripTitle, setTripTitle] = useState<string>('ทริปโตเกียว & ฟูจิ 2027');
  const [creatorName, setCreatorName] = useState<string>('SuraBoy');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim() || !creatorName.trim()) {
      alert('กรุณากรอกชื่อแพลนเที่ยว และชื่อของคุณ');
      return;
    }
    onStartWorkspace(tripTitle.trim(), creatorName.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '32px 28px', background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="editorial-tag tag-red">
                <Sparkles size={11} /> 1-STEP QUICK START
              </span>
              <span className="editorial-tag tag-cyan">
                🌸 TOKYO EXPEDITION
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              เริ่มต้นวางแผนทริปญี่ปุ่น 2027
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-hairline)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
          กรอกเพียง 2 ช่องเพื่อเปิด Dashboard วางแผน: เลือกที่เที่ยวใกล้โตเกียว ดูระยะทางจากที่พัก และเทียบตั๋วเครื่องบินราคาดีที่สุด
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Trip Title */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              ✏️ ตั้งชื่อแพลนเที่ยวของคุณ *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ทริปโตเกียว-ฟูจิ ใบไม้เปลี่ยนสี 7 วัน, ทริปครอบครัว..."
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '14.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Creator Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              🎒 ชื่อของคุณ / นามแฝง *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น SuraBoy, NekoTraveler"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '14.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="submit"
              className="btn-editorial-primary"
              style={{ flex: 1, padding: '12px 20px', fontSize: '14px', justifyContent: 'center' }}
            >
              <span>ไปยัง Dashboard วางแผนทริป</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
