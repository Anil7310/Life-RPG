import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { X, Sparkles, Swords, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, guestLogin } = useAuth();
  const { playButton, playError, playQuestComplete } = useSound();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!username || !email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        await register({ username, email, password, characterName: characterName || username });
      } else {
        if (!username || !password) {
          throw new Error('Please enter your email/username and password.');
        }
        await login({ emailOrUsername: username, password });
      }

      playQuestComplete();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      playError();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      playButton();
      await guestLogin();
      playQuestComplete();
      onClose();
    } catch (err) {
      setError(err.message || 'Guest login failed.');
      playError();
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    playButton();
    setShowPassword(prev => !prev);
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Swords size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {mode === 'register' ? 'Begin Your Odyssey' : 'Welcome Back, Hero'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {mode === 'register' ? 'Forge your character and save your progress.' : 'Log in to continue your adventure.'}
              </p>
            </div>
          </div>
          <button onClick={() => { playButton(); onClose(); }} className="clay-btn clay-btn-icon" style={{ width: '34px', height: '34px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Quick Demo Guest Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="clay-btn clay-btn-gold"
            style={{ width: '100%', padding: '12px' }}
            id="instant-demo-btn"
          >
            <Sparkles size={16} />
            <span>Instant Demo Hero (Try Without Account)</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 0', color: 'var(--text-light)', fontSize: '0.8rem', textAlign: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-inset)' }} />
            <span>or sign in with credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-inset)' }} />
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => { playButton(); setMode('login'); setError(''); }}
            className={`clay-btn clay-btn-sm ${mode === 'login' ? 'clay-btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            <LogIn size={14} /> Login
          </button>
          <button
            type="button"
            onClick={() => { playButton(); setMode('register'); setError(''); }}
            className={`clay-btn clay-btn-sm ${mode === 'register' ? 'clay-btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Character Name (Display Name)
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. Sir Gallant"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              {mode === 'register' ? 'Username *' : 'Email or Username *'}
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder={mode === 'register' ? 'adventurer99' : 'your@email.com or username'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              id="auth-username-input"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                className="clay-input"
                placeholder="hero@kingdom.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                id="auth-email-input"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="clay-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="auth-password-input"
                style={{ paddingRight: '46px' }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: showPassword ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'color 0.15s ease'
                }}
                title={showPassword ? 'Hide password (show dots)' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                id="toggle-password-visibility-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="clay-btn clay-btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '12px' }}
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? 'Entering Realm...' : mode === 'register' ? 'Create Hero & Begin' : 'Enter Realm'}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
