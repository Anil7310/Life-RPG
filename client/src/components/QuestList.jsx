import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { api } from '../utils/api.js';
import confetti from 'canvas-confetti';
import {
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Coins,
  Repeat,
  Trash2,
  Edit3,
  BookOpen,
  Dumbbell,
  Zap,
  Heart,
  Palette,
  Sun,
  Filter,
  Check
} from 'lucide-react';

const CATEGORY_MAP = {
  intellect: { label: 'Intellect', icon: BookOpen, color: 'var(--stat-intellect)', bg: 'var(--stat-intellect-bg)' },
  strength: { label: 'Strength', icon: Dumbbell, color: 'var(--stat-strength)', bg: 'var(--stat-strength-bg)' },
  agility: { label: 'Agility', icon: Zap, color: 'var(--stat-agility)', bg: 'var(--stat-agility-bg)' },
  vitality: { label: 'Vitality', icon: Heart, color: 'var(--stat-vitality)', bg: 'var(--stat-vitality-bg)' },
  creativity: { label: 'Creativity', icon: Palette, color: 'var(--stat-creativity)', bg: 'var(--stat-creativity-bg)' },
  spirit: { label: 'Spirit', icon: Sun, color: 'var(--stat-spirit)', bg: 'var(--stat-spirit-bg)' }
};

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', color: '#10B981' },
  medium: { label: 'Medium', color: '#3B82F6' },
  hard: { label: 'Hard', color: '#F59E0B' },
  epic: { label: 'Boss Epic', color: '#8B5CF6' }
};

export const QuestList = ({ quests, onRefreshQuests, onOpenCreateQuest, onEditQuest }) => {
  const { updateUserState, triggerLevelUp } = useAuth();
  const { playQuestComplete, playLevelUp, playCoin, playButton } = useSound();

  const [filterCategory, setFilterCategory] = useState('all');
  const [tab, setTab] = useState('active'); // 'active' | 'completed'
  const [loadingId, setLoadingId] = useState(null);

  const handleToggleComplete = async (quest) => {
    try {
      setLoadingId(quest._id);
      const res = await api.completeQuest(quest._id);

      if (res.success) {
        if (!quest.isCompleted) {
          // Quest was just completed!
          if (res.rewards?.didLevelUp) {
            playLevelUp();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
            triggerLevelUp(res.rewards);
          } else {
            playQuestComplete();
            playCoin();
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.7 }
            });
          }
          if (res.user) {
            updateUserState(res.user);
          }
        } else {
          // Uncompleted
          playButton();
        }
        await onRefreshQuests();
      }
    } catch (err) {
      alert(err.message || 'Failed to update quest.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteQuest = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to abandon this quest?')) return;
    try {
      playButton();
      await api.deleteQuest(id);
      await onRefreshQuests();
    } catch (err) {
      alert(err.message || 'Failed to delete quest.');
    }
  };

  const filteredQuests = quests.filter(q => {
    // Tab filter
    if (tab === 'active' && q.isCompleted) return false;
    if (tab === 'completed' && !q.isCompleted) return false;

    // Category filter
    if (filterCategory === 'recurring') return q.isRecurring;
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Quest Log 📜
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete quests to earn XP, level up your attributes, and collect gold coins!
          </p>
        </div>

        <button
          onClick={() => { playButton(); onOpenCreateQuest(); }}
          className="clay-btn clay-btn-primary"
          id="add-quest-btn"
        >
          <Plus size={18} />
          <span>New Quest</span>
        </button>
      </div>

      {/* Tabs: Active vs Completed */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--bg-inset)', paddingBottom: '12px' }}>
        <button
          onClick={() => { playButton(); setTab('active'); }}
          className={`clay-btn clay-btn-sm ${tab === 'active' ? 'clay-btn-primary' : ''}`}
        >
          Active Quests ({quests.filter(q => !q.isCompleted).length})
        </button>
        <button
          onClick={() => { playButton(); setTab('completed'); }}
          className={`clay-btn clay-btn-sm ${tab === 'completed' ? 'clay-btn-primary' : ''}`}
        >
          Completed ({quests.filter(q => q.isCompleted).length})
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        <button
          onClick={() => { playButton(); setFilterCategory('all'); }}
          className="clay-btn clay-btn-sm"
          style={{
            background: filterCategory === 'all' ? 'var(--primary)' : 'var(--bg-card)',
            color: filterCategory === 'all' ? '#fff' : 'var(--text-main)'
          }}
        >
          All
        </button>
        <button
          onClick={() => { playButton(); setFilterCategory('recurring'); }}
          className="clay-btn clay-btn-sm"
          style={{
            background: filterCategory === 'recurring' ? 'var(--primary)' : 'var(--bg-card)',
            color: filterCategory === 'recurring' ? '#fff' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Repeat size={14} /> Habits
        </button>
        {Object.entries(CATEGORY_MAP).map(([key, item]) => {
          const isSelected = filterCategory === key;
          const Icon = item.icon;
          return (
            <button
              key={key}
              onClick={() => { playButton(); setFilterCategory(key); }}
              className="clay-btn clay-btn-sm"
              style={{
                background: isSelected ? item.color : 'var(--bg-card)',
                color: isSelected ? '#fff' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quests Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredQuests.length === 0 ? (
          <div className="clay-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✨</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
              {tab === 'active' ? 'No active quests found' : 'No completed quests yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {tab === 'active'
                ? 'Create a new quest to start earning XP and leveling up!'
                : 'Finish some active quests to see your triumphs recorded here.'}
            </p>
            {tab === 'active' && (
              <button onClick={onOpenCreateQuest} className="clay-btn clay-btn-primary clay-btn-sm">
                <Plus size={16} /> Create First Quest
              </button>
            )}
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const cat = CATEGORY_MAP[quest.category] || CATEGORY_MAP.intellect;
            const CatIcon = cat.icon;
            const diff = DIFFICULTY_MAP[quest.difficulty] || DIFFICULTY_MAP.medium;
            const isLoading = loadingId === quest._id;

            return (
              <div
                key={quest._id}
                className="clay-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  gap: '16px',
                  opacity: quest.isCompleted ? 0.75 : 1,
                  borderLeft: `6px solid ${cat.color}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Checkbox and Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  {/* Big 3D Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(quest)}
                    disabled={isLoading}
                    className="clay-btn clay-btn-icon"
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '12px',
                      background: quest.isCompleted ? 'var(--primary)' : 'var(--bg-inset)',
                      color: quest.isCompleted ? '#fff' : 'var(--text-light)',
                      boxShadow: quest.isCompleted ? '0 4px 12px var(--primary-shadow)' : 'var(--clay-inset)'
                    }}
                    title={quest.isCompleted ? 'Mark as incomplete' : 'Complete Quest (+XP & Coins)'}
                    aria-label={quest.isCompleted ? 'Mark incomplete' : 'Complete quest'}
                  >
                    {quest.isCompleted ? <Check size={22} strokeWidth={3} /> : <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px dashed var(--text-light)' }} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        textDecoration: quest.isCompleted ? 'line-through' : 'none',
                        color: quest.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        wordBreak: 'break-word'
                      }}>
                        {quest.title}
                      </h3>

                      {quest.isRecurring && (
                        <span className="clay-badge" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-card-soft)' }} title="Daily Habit">
                          <Repeat size={12} color="var(--primary)" /> Daily
                        </span>
                      )}
                    </div>

                    {quest.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', wordBreak: 'break-word' }}>
                        {quest.description}
                      </p>
                    )}

                    {/* Meta Rewards Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Category Tag */}
                      <span className="clay-badge" style={{ background: cat.bg, color: cat.color, fontSize: '0.75rem', padding: '3px 10px' }}>
                        <CatIcon size={12} /> {cat.label} +{quest.statReward?.amount || 1}
                      </span>

                      {/* Difficulty Tag */}
                      <span className="clay-badge" style={{ background: 'var(--bg-card-soft)', color: diff.color, fontSize: '0.75rem', padding: '3px 10px' }}>
                        {diff.label}
                      </span>

                      {/* XP & Coins */}
                      <span className="clay-badge" style={{ background: 'var(--bg-inset)', color: 'var(--primary)', fontSize: '0.75rem', padding: '3px 10px' }}>
                        <Sparkles size={12} /> +{quest.xpReward} XP
                      </span>

                      <span className="clay-badge" style={{ background: 'var(--bg-inset)', color: '#D97706', fontSize: '0.75rem', padding: '3px 10px' }}>
                        <Coins size={12} /> +{quest.coinReward} Coins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Edit & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); playButton(); onEditQuest(quest); }}
                    className="clay-btn clay-btn-icon"
                    style={{ width: '34px', height: '34px' }}
                    title="Edit Quest"
                  >
                    <Edit3 size={15} color="var(--text-muted)" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteQuest(quest._id, e)}
                    className="clay-btn clay-btn-icon"
                    style={{ width: '34px', height: '34px' }}
                    title="Abandon Quest"
                  >
                    <Trash2 size={15} color="#EF4444" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
