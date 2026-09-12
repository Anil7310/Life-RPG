import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { api } from '../utils/api.js';
import confetti from 'canvas-confetti';
import { X, ShoppingBag, Coins, Sparkles, Check, Plus, Trash2, Gift, Palette, Award } from 'lucide-react';

export const ShopModal = ({ isOpen, onClose }) => {
  const { user, updateUserState, applyTheme } = useAuth();
  const { playCoin, playButton, playError } = useSound();

  const [shopData, setShopData] = useState({ presets: [], custom: [] });
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'custom'
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [message, setMessage] = useState('');

  // New custom reward form state
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState(50);
  const [customIcon, setCustomIcon] = useState('☕');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await api.getShop();
      if (res.success) {
        setShopData(res.shop);
      }
    } catch (err) {
      console.error('Fetch shop error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShop();
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuyPreset = async (item) => {
    if ((user.coins || 0) < item.cost) {
      setMessage(`❌ You need ${item.cost - user.coins} more coins to unlock this!`);
      playError();
      return;
    }

    try {
      setBuyingId(item.id);
      playButton();
      const res = await api.buyReward(item.id);

      if (res.success) {
        playCoin();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
        updateUserState(res.user);
        setMessage(`🎉 Unlocked ${item.title}!`);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      playError();
    } finally {
      setBuyingId(null);
    }
  };

  const handleEquipTheme = async (themeName) => {
    try {
      playButton();
      applyTheme(themeName);
      const res = await api.updateProfile({ activeTheme: themeName });
      if (res.success) {
        updateUserState(res.user);
        setMessage(`🎨 Theme equipped: ${themeName}!`);
      }
    } catch (err) {
      console.error('Equip theme error:', err);
    }
  };

  const handleAddCustomReward = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    try {
      playButton();
      const res = await api.createCustomReward({
        title: customTitle.trim(),
        cost: Number(customCost),
        icon: customIcon
      });

      if (res.success) {
        setCustomTitle('');
        setShowAddCustom(false);
        fetchShop();
        setMessage('✅ Custom reward added to your shop!');
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      playError();
    }
  };

  const handleClaimCustom = async (reward) => {
    if ((user.coins || 0) < reward.cost) {
      setMessage(`❌ You need ${reward.cost - user.coins} more coins to claim this reward!`);
      playError();
      return;
    }

    try {
      playButton();
      const res = await api.claimCustomReward(reward._id || reward.id);
      if (res.success) {
        playCoin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        updateUserState(res.user);
        setMessage(`🎉 Claimed "${reward.title}"! Enjoy your well-earned reward!`);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      playError();
    }
  };

  const handleDeleteCustom = async (rewardId) => {
    try {
      playButton();
      await api.deleteCustomReward(rewardId);
      fetchShop();
    } catch (err) {
      console.error(err);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFEAA7, #FDCB6E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6C4400'
            }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Rewards Emporium 🛍️
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#D97706' }}>
                <Coins size={14} /> Available Balance: {user?.coins || 0} Gold Coins
              </div>
            </div>
          </div>
          <button
            onClick={() => { playButton(); onClose(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            background: message.startsWith('❌') ? '#FEE2E2' : '#DEF7EC',
            color: message.startsWith('❌') ? '#991B1B' : '#03543F',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => { playButton(); setActiveTab('catalogue'); }}
            className={`clay-btn clay-btn-sm ${activeTab === 'catalogue' ? 'clay-btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            <Palette size={16} /> Themes & Titles
          </button>
          <button
            onClick={() => { playButton(); setActiveTab('custom'); }}
            className={`clay-btn clay-btn-sm ${activeTab === 'custom' ? 'clay-btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            <Gift size={16} /> Real-Life Rewards ({shopData.custom?.length || 0})
          </button>
        </div>

        {/* Tab 1: Presets (Themes & Badges) */}
        {activeTab === 'catalogue' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', maxHeight: '420px', overflowY: 'auto', padding: '4px' }}>
            {shopData.presets.map((item) => {
              const isUnlocked =
                (item.type === 'theme' && user?.unlockedThemes?.includes(item.value)) ||
                (item.type === 'badge' && user?.badges?.includes(item.value)) ||
                (item.type === 'title' && user?.title === item.value);

              const isEquipped =
                (item.type === 'theme' && user?.activeTheme === item.value) ||
                (item.type === 'title' && user?.title === item.value);

              return (
                <div
                  key={item.id}
                  className="clay-card-sm"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px',
                    border: isEquipped ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.4)',
                    background: 'var(--bg-card-soft)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '1.8rem' }}>{item.icon}</div>
                      <span className="clay-badge" style={{ fontSize: '0.75rem', padding: '2px 8px', color: isUnlocked ? 'var(--primary)' : '#D97706' }}>
                        {isUnlocked ? 'Unlocked' : `${item.cost} Coins`}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{item.description}</p>
                  </div>

                  {isUnlocked ? (
                    item.type === 'theme' ? (
                      <button
                        onClick={() => handleEquipTheme(item.value)}
                        className={`clay-btn clay-btn-sm ${isEquipped ? 'clay-btn-primary' : ''}`}
                        style={{ width: '100%' }}
                        disabled={isEquipped}
                      >
                        {isEquipped ? <><Check size={14} /> Equipped</> : 'Equip Theme'}
                      </button>
                    ) : (
                      <div className="clay-badge" style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-inset)', color: 'var(--text-muted)' }}>
                        <Check size={14} /> Owned
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuyPreset(item)}
                      disabled={buyingId === item.id}
                      className="clay-btn clay-btn-gold clay-btn-sm"
                      style={{ width: '100%' }}
                    >
                      <Coins size={14} /> Unlock for {item.cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Real-Life Rewards */}
        {activeTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', padding: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Create real-life rewards you can treat yourself to when you earn enough gold!
              </p>
              <button
                onClick={() => { playButton(); setShowAddCustom(!showAddCustom); }}
                className="clay-btn clay-btn-primary clay-btn-sm"
              >
                <Plus size={14} /> {showAddCustom ? 'Cancel' : 'New Reward'}
              </button>
            </div>

            {/* Add Custom Reward Form */}
            {showAddCustom && (
              <form onSubmit={handleAddCustomReward} className="clay-card-sm" style={{ background: 'var(--bg-card)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add Custom Real-World Reward</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px', gap: '8px' }}>
                  <input
                    type="text"
                    className="clay-input"
                    value={customIcon}
                    onChange={e => setCustomIcon(e.target.value)}
                    placeholder="Icon"
                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                  />
                  <input
                    type="text"
                    className="clay-input"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="e.g. 1 Hour Video Game Session"
                    required
                  />
                  <input
                    type="number"
                    min="5"
                    step="5"
                    className="clay-input"
                    value={customCost}
                    onChange={e => setCustomCost(e.target.value)}
                    placeholder="Coins"
                    required
                  />
                </div>
                <button type="submit" className="clay-btn clay-btn-primary clay-btn-sm" style={{ alignSelf: 'flex-end' }}>
                  Add Reward
                </button>
              </form>
            )}

            {/* List of Custom Rewards */}
            {shopData.custom.length === 0 ? (
              <div className="clay-card-sm" style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-card-soft)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎁</div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>No custom rewards created yet.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Reward yourself for staying productive! Add rewards like "Watch a Movie", "Coffee Break", or "Buy a Treat".
                </p>
              </div>
            ) : (
              shopData.custom.map((cr) => (
                <div
                  key={cr._id || cr.id}
                  className="clay-card-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    gap: '12px',
                    background: 'var(--bg-card-soft)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.8rem' }}>{cr.icon || '🎁'}</div>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>{cr.title}</h4>
                      <span className="clay-badge" style={{ fontSize: '0.75rem', padding: '2px 8px', color: '#D97706', marginTop: '2px' }}>
                        <Coins size={12} /> {cr.cost} Coins
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleClaimCustom(cr)}
                      className="clay-btn clay-btn-gold clay-btn-sm"
                    >
                      Claim Reward 🎉
                    </button>
                    <button
                      onClick={() => handleDeleteCustom(cr._id || cr.id)}
                      className="clay-btn clay-btn-icon"
                      style={{ width: '32px', height: '32px' }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
