import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export const LevelUpModal = () => {
  const { levelUpData, clearLevelUp } = useAuth();
  const { playButton } = useSound();

  if (!levelUpData || !levelUpData.didLevelUp) return null;

  return createPortal(
    <div className="modal-overlay" onClick={clearLevelUp} style={{ zIndex: 99999 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          padding: '36px 28px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card-soft) 100%)',
          border: '3px solid var(--gold)'
        }}
      >
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFEAA7, #FDCB6E)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(253, 203, 110, 0.5)',
          fontSize: '2.5rem'
        }}>
          👑
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
          LEVEL UP!
        </h2>
        <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '20px' }}>
          You have achieved Level {levelUpData.newLevel}!
        </p>

        <div className="clay-card-sm" style={{ background: 'var(--bg-card)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Level Progression</span>
            <span style={{ fontWeight: 800, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Lvl {levelUpData.oldLevel} <ArrowUpRight size={16} /> Lvl {levelUpData.newLevel}
            </span>
          </div>

          {levelUpData.statBoosted && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--bg-inset)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {levelUpData.statBoosted.stat} Boost
              </span>
              <span style={{ fontWeight: 800, color: '#10B981' }}>
                +{levelUpData.statBoosted.amount} (Now {levelUpData.statBoosted.newValue})
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--bg-inset)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quest Gold Earned</span>
            <span style={{ fontWeight: 800, color: '#D97706' }}>
              +{levelUpData.coinsGained} Coins
            </span>
          </div>
        </div>

        <button
          onClick={() => { playButton(); clearLevelUp(); }}
          className="clay-btn clay-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          id="continue-adventure-btn"
        >
          <Sparkles size={18} /> Continue Adventure
        </button>
      </div>
    </div>,
    document.body
  );
};
