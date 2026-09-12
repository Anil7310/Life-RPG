import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSound } from '../context/SoundContext.jsx';
import { api } from '../utils/api.js';
import { X, Sparkles, Coins, BookOpen, Dumbbell, Zap, Heart, Palette, Sun, Repeat } from 'lucide-react';

const CATEGORIES = [
  { id: 'intellect', label: 'Intellect', icon: BookOpen, desc: 'Study, Reading, Coding' },
  { id: 'strength', label: 'Strength', icon: Dumbbell, desc: 'Gym, Running, Workout' },
  { id: 'agility', label: 'Agility', icon: Zap, desc: 'Chores, Fast Tasks, Clean' },
  { id: 'vitality', label: 'Vitality', icon: Heart, desc: 'Health, Water, Sleep' },
  { id: 'creativity', label: 'Creativity', icon: Palette, desc: 'Art, Writing, Music' },
  { id: 'spirit', label: 'Spirit', icon: Sun, desc: 'Meditation, Mindfulness' }
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', xp: 15, coins: 8, color: '#10B981' },
  { id: 'medium', label: 'Medium', xp: 35, coins: 20, color: '#3B82F6' },
  { id: 'hard', label: 'Hard', xp: 65, coins: 40, color: '#F59E0B' },
  { id: 'epic', label: 'Boss Epic', xp: 120, coins: 80, color: '#8B5CF6' }
];

export const QuestModal = ({ isOpen, onClose, onQuestSaved, editingQuest = null }) => {
  const { playButton, playError } = useSound();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('intellect');
  const [difficulty, setDifficulty] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title || '');
      setDescription(editingQuest.description || '');
      setCategory(editingQuest.category || 'intellect');
      setDifficulty(editingQuest.difficulty || 'medium');
      setIsRecurring(editingQuest.isRecurring || false);
    } else {
      setTitle('');
      setDescription('');
      setCategory('intellect');
      setDifficulty('medium');
      setIsRecurring(false);
    }
    setError('');
  }, [editingQuest, isOpen]);

  if (!isOpen) return null;

  const currentDiff = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a quest title.');
      playError();
      return;
    }

    try {
      setLoading(true);
      setError('');
      playButton();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        isRecurring
      };

      if (editingQuest) {
        await api.updateQuest(editingQuest._id, payload);
      } else {
        await api.createQuest(payload);
      }

      onQuestSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save quest');
      playError();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {editingQuest ? 'Edit Quest ⚔️' : 'Embark on a New Quest 📜'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Define your task and configure the attributes it will build.
            </p>
          </div>
          <button
            onClick={() => { playButton(); onClose(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Quest Objective / Title *
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder="e.g. Read 20 pages of clean code"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              id="quest-title-input"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Notes / Sub-tasks (Optional)
            </label>
            <textarea
              className="clay-input"
              rows={2}
              placeholder="Add key objectives, links, or notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Category Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              Target Character Attribute
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { playButton(); setCategory(cat.id); }}
                    className="clay-btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-inset)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      boxShadow: isSelected ? '0 4px 12px var(--primary-shadow)' : 'var(--clay-inset)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              Difficulty Tier & Rewards
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {DIFFICULTIES.map(d => {
                const isSelected = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => { playButton(); setDifficulty(d.id); }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${d.color}` : '2px solid transparent',
                      background: isSelected ? 'var(--bg-card)' : 'var(--bg-inset)',
                      boxShadow: isSelected ? 'var(--clay-shadow-sm)' : 'var(--clay-inset)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: d.color }}>{d.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      +{d.xp} XP
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Habit Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)' }}>
            <input
              type="checkbox"
              id="recurring-checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="recurring-checkbox" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Repeat size={14} color="var(--primary)" /> Repeat as a Daily Habit Quest
            </label>
          </div>

          {/* Live Reward Preview */}
          <div className="clay-card-sm" style={{ background: 'var(--bg-card-soft)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Sparkles size={16} /> +{currentDiff.xp} XP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 700, fontSize: '0.9rem' }}>
              <Coins size={16} /> +{currentDiff.coins} Gold Coins
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              +{difficulty === 'epic' ? 3 : difficulty === 'hard' ? 2 : 1} {category.toUpperCase()}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="clay-btn clay-btn-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clay-btn clay-btn-primary"
              disabled={loading}
              id="save-quest-btn"
            >
              {loading ? 'Saving...' : editingQuest ? 'Save Changes' : 'Accept Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
