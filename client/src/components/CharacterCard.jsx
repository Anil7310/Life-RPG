import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import {
  BookOpen,
  Dumbbell,
  Zap,
  Heart,
  Palette,
  Sun,
  Award,
  Shield,
  Sparkles,
  Camera,
  Edit2
} from 'lucide-react';

export const CharacterCard = ({ onOpenEditProfile }) => {
  const { user } = useAuth();
  const { playButton } = useSound();

  if (!user) return null;

  const xpPercent = Math.min(100, Math.round(((user.xp || 0) / (user.xpToNextLevel || 100)) * 100));

  const statsList = [
    { key: 'intellect', label: 'Intellect', icon: BookOpen, color: 'var(--stat-intellect)', bg: 'var(--stat-intellect-bg)', desc: 'Study, Reading, Deep Focus' },
    { key: 'strength', label: 'Strength', icon: Dumbbell, color: 'var(--stat-strength)', bg: 'var(--stat-strength-bg)', desc: 'Workouts, Gym, Physical Energy' },
    { key: 'agility', label: 'Agility', icon: Zap, color: 'var(--stat-agility)', bg: 'var(--stat-agility-bg)', desc: 'Speed, Cleanliness, Quick Tasks' },
    { key: 'vitality', label: 'Vitality', icon: Heart, color: 'var(--stat-vitality)', bg: 'var(--stat-vitality-bg)', desc: 'Health, Water Intake, Sleep' },
    { key: 'creativity', label: 'Creativity', icon: Palette, color: 'var(--stat-creativity)', bg: 'var(--stat-creativity-bg)', desc: 'Coding, Writing, Art & Design' },
    { key: 'spirit', label: 'Spirit', icon: Sun, color: 'var(--stat-spirit)', bg: 'var(--stat-spirit-bg)', desc: 'Mindfulness, Meditation, Peace' }
  ];

  const handleEdit = () => {
    playButton();
    if (onOpenEditProfile) onOpenEditProfile();
  };

  return (
    <div className="clay-card" style={{ position: 'sticky', top: '24px' }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
        
        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className="clay-btn clay-btn-icon"
          style={{ position: 'absolute', top: '0', right: '0', width: '32px', height: '32px' }}
          title="Customize Profile Picture & Name"
          aria-label="Edit Profile"
        >
          <Edit2 size={14} color="var(--text-muted)" />
        </button>

        {/* Avatar Display with Device Photo or Preset Icon */}
        <div
          onClick={handleEdit}
          style={{
            position: 'relative',
            width: '94px',
            height: '94px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: 'var(--clay-shadow-sm)',
            border: '4px solid var(--bg-card)',
            marginBottom: '12px',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          title="Click to change profile picture"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.characterName || 'Hero'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{user.avatarId || '🛡️'}</span>
          )}

          {/* Camera Overlay Icon on Hover */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'rgba(0,0,0,0.45)',
            padding: '2px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Camera size={12} color="#FFFFFF" />
          </div>
        </div>

        {/* Level Tag */}
        <div style={{
          marginTop: '-6px',
          background: 'var(--gold)',
          color: '#713F12',
          fontWeight: 800,
          fontSize: '0.78rem',
          padding: '2px 10px',
          borderRadius: '999px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          marginBottom: '8px'
        }}>
          LVL {user.level || 1}
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {user.characterName || user.username}
        </h2>

        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--primary)',
          background: 'var(--bg-inset)',
          padding: '4px 14px',
          borderRadius: '999px',
          marginTop: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={12} />
          {user.title || 'Novice Adventurer'}
        </div>
      </div>

      {/* Level & XP Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-muted)' }}>Experience (XP)</span>
          <span style={{ color: 'var(--primary-dark)' }}>{user.xp || 0} / {user.xpToNextLevel || 100} XP ({xpPercent}%)</span>
        </div>
        <div className="xp-bar-container" title={`${user.xpToNextLevel - user.xp} XP remaining to Level ${(user.level || 1) + 1}`}>
          <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      {/* Character Stats Breakdown */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={16} /> Character Attributes
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {statsList.map(st => {
            const Icon = st.icon;
            const val = user.stats?.[st.key] || 5;
            const fillWidth = Math.min(100, Math.max(15, (val / 30) * 100));

            return (
              <div key={st.key} className="clay-card-sm" style={{ padding: '10px 14px', background: 'var(--bg-card-soft)' }} title={st.desc}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: st.bg,
                      color: st.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{st.label}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: st.color }}>
                    {val}
                  </div>
                </div>

                {/* Mini Stat Bar */}
                <div style={{ height: '6px', width: '100%', background: 'var(--bg-inset)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${fillWidth}%`, background: st.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Shelf */}
      {user.badges && user.badges.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} /> Unlocked Badges ({user.badges.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user.badges.map((b, idx) => (
              <span key={idx} className="clay-badge" style={{ background: 'var(--bg-card-soft)', fontSize: '0.78rem' }}>
                ⭐ {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
