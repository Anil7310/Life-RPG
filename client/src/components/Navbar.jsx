import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { Swords, Coins, Flame, Volume2, VolumeX, ShoppingBag, LogOut, User as UserIcon, Sparkles, Music } from 'lucide-react';

export const Navbar = ({ onOpenShop, onOpenAuth, onOpenSoundModal }) => {
  const { user, logout } = useAuth();
  const { soundEnabled, toggleSound, playButton, currentPack, soundPacks } = useSound();

  const handleSoundToggle = () => {
    playButton();
    toggleSound();
  };

  const handleShopClick = () => {
    playButton();
    onOpenShop();
  };

  const activePackObj = soundPacks.find(p => p.id === currentPack) || soundPacks[0];

  return (
    <header style={{
      background: 'var(--bg-card)',
      boxShadow: 'var(--clay-shadow-sm)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 24px',
      marginBottom: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      border: '1px solid rgba(255, 255, 255, 0.6)'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: 'var(--primary-shadow)'
        }}>
          <Swords size={26} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            LIFE <span style={{ color: 'var(--primary)' }}>RPG</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Level Up Your Real Life
          </p>
        </div>
      </div>

      {/* User Stats / Top Quick Status */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* User Avatar & Level Badge */}
          <div className="clay-badge" style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
            color: '#fff',
            padding: '4px 12px 4px 6px',
            gap: '8px'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.2)',
              fontSize: '1rem'
            }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user.avatarId || '🛡️'}</span>
              )}
            </div>
            <span>LVL {user.level || 1}</span>
          </div>

          {/* Coins Pill */}
          <div className="clay-badge" style={{ background: 'var(--bg-inset)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <Coins size={16} />
            <span>{user.coins || 0} Coins</span>
          </div>

          {/* Streak Flame */}
          <div className="clay-badge" style={{ background: 'var(--bg-inset)', color: '#EF4444' }}>
            <Flame size={16} className={user.streak?.current > 0 ? 'flame-active' : ''} />
            <span>{user.streak?.current || 1} Day Streak</span>
          </div>

          {/* Shop Button */}
          <button
            onClick={handleShopClick}
            className="clay-btn clay-btn-gold clay-btn-sm"
            title="Open Rewards Shop"
            id="open-shop-btn"
          >
            <ShoppingBag size={16} />
            <span>Shop</span>
          </button>

          {/* Sound Toggle Button (ON/OFF) */}
          <button
            onClick={handleSoundToggle}
            className={`clay-btn clay-btn-sm ${soundEnabled ? 'clay-btn-primary' : ''}`}
            style={{
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
            title={soundEnabled ? 'Mute Game SFX' : 'Enable Game SFX (Plays Chime)'}
            aria-label="Toggle Sound"
            id="navbar-sound-toggle-btn"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={16} />
                <span>ON</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              </>
            ) : (
              <>
                <VolumeX size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)' }}>OFF</span>
              </>
            )}
          </button>

          {/* Sound Themes Customizer Button */}
          <button
            onClick={() => { playButton(); onOpenSoundModal && onOpenSoundModal(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '38px', height: '38px' }}
            title={`Customize Sound Effects (Current: ${activePackObj.name})`}
            aria-label="Customize Sound Effects"
            id="navbar-sound-packs-btn"
          >
            <span style={{ fontSize: '1.1rem' }}>{activePackObj.icon}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => { playButton(); logout(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '38px', height: '38px' }}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} color="var(--text-muted)" />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSoundToggle}
            className={`clay-btn clay-btn-sm ${soundEnabled ? 'clay-btn-primary' : ''}`}
            style={{
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
            title={soundEnabled ? 'Mute Game SFX' : 'Enable Game SFX (Plays Chime)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={16} />
                <span>ON</span>
              </>
            ) : (
              <>
                <VolumeX size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)' }}>OFF</span>
              </>
            )}
          </button>

          <button
            onClick={() => { playButton(); onOpenSoundModal && onOpenSoundModal(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '38px', height: '38px' }}
            title={`Customize Sound Effects (${activePackObj.name})`}
          >
            <span style={{ fontSize: '1.1rem' }}>{activePackObj.icon}</span>
          </button>

          <button
            onClick={() => { playButton(); onOpenAuth(); }}
            className="clay-btn clay-btn-primary"
            id="login-register-btn"
          >
            <UserIcon size={18} />
            <span>Enter The Realm</span>
          </button>
        </div>
      )}
    </header>
  );
};
