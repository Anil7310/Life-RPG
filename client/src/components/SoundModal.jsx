import React from 'react';
import { createPortal } from 'react-dom';
import { useSound } from '../context/SoundContext.jsx';
import { X, Volume2, VolumeX, Play, Check, Music } from 'lucide-react';

export const SoundModal = ({ isOpen, onClose }) => {
  const { soundEnabled, toggleSound, currentPack, changeSoundPack, soundPacks, previewSound, playButton } = useSound();

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Music size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Audio & Sound Themes 🎵</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Customize your game audio effects with 5 unique sound packs.
              </p>
            </div>
          </div>
          <button
            onClick={() => { playButton(); onClose(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Master Sound Switcher */}
        <div
          className="clay-card-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            marginBottom: '18px',
            background: 'var(--bg-card-soft)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {soundEnabled ? <Volume2 size={20} color="var(--primary)" /> : <VolumeX size={20} color="var(--text-muted)" />}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Master Sound Effects</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {soundEnabled ? 'Sound is currently active' : 'Sound is currently muted'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className={`clay-btn clay-btn-sm ${soundEnabled ? 'clay-btn-primary' : ''}`}
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 5 Sound Packs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', padding: '2px' }}>
          {soundPacks.map((pack) => {
            const isEquipped = currentPack === pack.id;

            return (
              <div
                key={pack.id}
                className="clay-card-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  gap: '12px',
                  border: isEquipped ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.4)',
                  background: isEquipped ? 'var(--bg-card)' : 'var(--bg-inset)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.8rem', minWidth: '36px', textAlign: 'center' }}>{pack.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800 }}>{pack.name}</h4>
                      {isEquipped && (
                        <span className="clay-badge" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--primary)', color: '#fff' }}>
                          Equipped
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                      {pack.description}
                    </p>
                  </div>
                </div>

                {/* Actions: Preview & Equip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => previewSound(pack.id)}
                    className="clay-btn clay-btn-icon"
                    style={{ width: '36px', height: '36px' }}
                    title="Play Preview Sound"
                  >
                    <Play size={14} color="var(--primary)" />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeSoundPack(pack.id)}
                    disabled={isEquipped}
                    className={`clay-btn clay-btn-sm ${isEquipped ? '' : 'clay-btn-primary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {isEquipped ? <><Check size={13} /> Active</> : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            onClick={() => { playButton(); onClose(); }}
            className="clay-btn clay-btn-primary clay-btn-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
