import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useSound } from './context/SoundContext.jsx';
import { api } from './utils/api.js';
import { Navbar } from './components/Navbar.jsx';
import { CharacterCard } from './components/CharacterCard.jsx';
import { QuestList } from './components/QuestList.jsx';
import { QuestModal } from './components/QuestModal.jsx';
import { ShopModal } from './components/ShopModal.jsx';
import { LevelUpModal } from './components/LevelUpModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { SoundModal } from './components/SoundModal.jsx';
import { Swords, Sparkles, Shield, Flame, CheckCircle2, Plus, Gift, ArrowRight } from 'lucide-react';

export const App = () => {
  const { user, loading, guestLogin } = useAuth();
  const { playButton } = useSound();

  const [quests, setQuests] = useState([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  // Modals state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      return;
    }
    try {
      setLoadingQuests(true);
      const res = await api.getQuests();
      if (res.success) {
        setQuests(res.quests || []);
      }
    } catch (err) {
      console.error('Failed to load quests:', err);
    } finally {
      setLoadingQuests(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // Check if resetToken is in the URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('resetToken')) {
      setIsAuthOpen(true);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        if (user) {
          e.preventDefault();
          setEditingQuest(null);
          setIsQuestModalOpen(true);
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (user) {
          e.preventDefault();
          setIsShopOpen(prev => !prev);
        }
      } else if (e.key === 'Escape') {
        setIsShopOpen(false);
        setIsAuthOpen(false);
        setIsQuestModalOpen(false);
        setIsProfileModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleOpenCreateQuest = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setEditingQuest(null);
    setIsQuestModalOpen(true);
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setIsQuestModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="clay-card" style={{ padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'flamePulse 1.5s infinite ease-in-out' }}>⚔️</div>
          <h2 style={{ marginTop: '12px', fontSize: '1.2rem', fontWeight: 800 }}>Loading Realm...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSoundModal={() => setIsSoundModalOpen(true)}
      />

      {/* Main Content Area */}
      {user ? (
        <main className="dashboard-grid">
          {/* Left: Character RPG Sheet & Stats */}
          <aside>
            <CharacterCard onOpenEditProfile={() => setIsProfileModalOpen(true)} />
          </aside>

          {/* Right: Quest Log & Management */}
          <section>
            <QuestList
              quests={quests}
              onRefreshQuests={fetchQuests}
              onOpenCreateQuest={handleOpenCreateQuest}
              onEditQuest={handleEditQuest}
            />
          </section>
        </main>
      ) : (
        /* Landing / Guest Welcome Showcase */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          {/* Hero Banner */}
          <div className="clay-card" style={{ padding: '48px 32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 20px',
              boxShadow: 'var(--primary-shadow)',
              fontSize: '2.4rem'
            }}>
              ⚔️
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
              Turn Your Daily Tasks into an <span style={{ color: 'var(--primary)' }}>Epic RPG</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Boring to-do lists are a chore. In <strong>Life RPG</strong>, studying builds your <em>Intellect</em>, working out raises your <em>Strength</em>, and completing daily quests unlocks real rewards and glorious level-ups!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { playButton(); guestLogin(); }}
                className="clay-btn clay-btn-gold"
                style={{ padding: '14px 28px', fontSize: '1.05rem' }}
                id="hero-demo-btn"
              >
                <Sparkles size={20} />
                <span>Instant Demo Play</span>
              </button>

              <button
                onClick={() => { playButton(); setIsAuthOpen(true); }}
                className="clay-btn clay-btn-primary"
                style={{ padding: '14px 28px', fontSize: '1.05rem' }}
                id="hero-register-btn"
              >
                <Swords size={20} />
                <span>Create Character</span>
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div className="clay-card-sm" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🧠</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Character Attributes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Group your tasks by category (Intellect, Strength, Agility, Vitality, Creativity, Spirit) and watch your stats grow.
              </p>
            </div>

            <div className="clay-card-sm" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔥</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Streaks & XP Levels</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Maintain daily streaks for multiplier bonuses. Level up with vibrant celebrations and sound effects.
              </p>
            </div>

            <div className="clay-card-sm" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎁</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Rewards & Themes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Earn gold coins to unlock retro themes, prestige badges, and create custom real-world treats.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint Bar */}
      {user && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--clay-shadow-sm)',
          borderRadius: '999px',
          padding: '6px 18px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}>
          <span>⌨️ Shortcuts:</span>
          <span><kbd style={{ background: 'var(--bg-inset)', padding: '2px 6px', borderRadius: '4px' }}>N</kbd> New Quest</span>
          <span><kbd style={{ background: 'var(--bg-inset)', padding: '2px 6px', borderRadius: '4px' }}>S</kbd> Shop</span>
          <span><kbd style={{ background: 'var(--bg-inset)', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> Close</span>
        </div>
      )}

      {/* Modals rendered at root level */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        onQuestSaved={fetchQuests}
        editingQuest={editingQuest}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SoundModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />

      <LevelUpModal />
    </div>
  );
};
