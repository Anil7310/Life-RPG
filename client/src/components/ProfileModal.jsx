import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { api } from '../utils/api.js';
import { X, Upload, Trash2, Camera, Check, Sparkles, Loader2 } from 'lucide-react';

const PRESET_AVATARS = ['🛡️', '🧙‍♂️', '🥷', '🏹', '🐲', '👑', '⚔️', '🦁', '🦉', '💎'];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserState } = useAuth();
  const { playButton, playCoin, playError } = useSound();

  const [characterName, setCharacterName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('🛡️');
  const [customAvatarPreview, setCustomAvatarPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setCharacterName(user.characterName || user.username || 'Hero');
      setSelectedAvatarId(user.avatarId || '🛡️');
      setCustomAvatarPreview(user.avatarUrl || '');
      setMessage('');
      setIsSuccess(false);
      setIsProcessing(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Save profile helper (updates backend & frontend state immediately)
  const saveProfileData = async (nameToSave, avatarIdToSave, avatarUrlToSave) => {
    try {
      setIsProcessing(true);
      setMessage('');

      const res = await api.updateProfile({
        characterName: (nameToSave || user.characterName || user.username).trim(),
        avatarId: avatarIdToSave,
        avatarUrl: avatarUrlToSave !== undefined ? avatarUrlToSave : customAvatarPreview
      });

      if (res.success && res.user) {
        updateUserState(res.user);
        playCoin();
        setIsSuccess(true);
        setMessage('🎉 Profile updated successfully!');
        return res.user;
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setIsSuccess(false);
      setMessage(`❌ ${err.message || 'Error updating profile'}`);
      playError();
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Image Upload handler with instant Auto-Save
  const handleImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file (PNG, JPG, WEBP, etc.).');
      setIsSuccess(false);
      playError();
      return;
    }

    setIsProcessing(true);
    setMessage('Processing photo...');

    const reader = new FileReader();

    reader.onerror = () => {
      setMessage('❌ Failed to read image file.');
      setIsProcessing(false);
      playError();
    };

    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result;
      if (!rawDataUrl) {
        setIsProcessing(false);
        return;
      }

      // Smooth canvas resize to ~400px
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width || maxDim;
          let height = img.height || maxDim;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCustomAvatarPreview(optimizedUrl);

          // Auto-save immediately!
          await saveProfileData(characterName, selectedAvatarId, optimizedUrl);
        } catch (canvasErr) {
          console.warn('Canvas optimization skipped, saving direct image:', canvasErr);
          setCustomAvatarPreview(rawDataUrl);
          await saveProfileData(characterName, selectedAvatarId, rawDataUrl);
        }
      };

      img.onerror = async () => {
        setCustomAvatarPreview(rawDataUrl);
        await saveProfileData(characterName, selectedAvatarId, rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleRemovePhoto = async () => {
    playButton();
    setCustomAvatarPreview('');
    await saveProfileData(characterName, selectedAvatarId, '');
  };

  const handleSelectPresetAvatar = async (avatar) => {
    playButton();
    setSelectedAvatarId(avatar);
    setCustomAvatarPreview('');
    await saveProfileData(characterName, avatar, '');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    playButton();
    const saved = await saveProfileData(characterName, selectedAvatarId, customAvatarPreview);
    if (saved) {
      setTimeout(() => onClose(), 600);
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Customize Hero Profile 🎨</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Upload your photo from your device or pick a fantasy icon.
            </p>
          </div>
          <button
            onClick={() => { playButton(); onClose(); }}
            className="clay-btn clay-btn-icon"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            style={{
              background: isSuccess ? '#DEF7EC' : '#FEE2E2',
              color: isSuccess ? '#03543F' : '#991B1B',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSuccess ? <Check size={16} /> : <X size={16} />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Avatar Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              padding: '20px 16px',
              background: 'var(--bg-inset)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--primary-light)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Clickable Avatar Circle */}
              <label
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                  boxShadow: 'var(--clay-shadow)',
                  overflow: 'hidden',
                  border: '4px solid var(--bg-card)',
                  cursor: 'pointer'
                }}
                title="Click to select photo from device"
              >
                <input
                  type="file"
                  onChange={handleInputChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {isProcessing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Loader2 size={24} className="flame-active" />
                    <span>Saving...</span>
                  </div>
                ) : customAvatarPreview ? (
                  <img
                    src={customAvatarPreview}
                    alt="Hero Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{selectedAvatarId}</span>
                )}

                {/* Camera Overlay Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.5)',
                    padding: '3px 0',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Camera size={13} color="#fff" />
                </div>
              </label>

              {/* Upload Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <label
                  className="clay-btn clay-btn-primary clay-btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <input
                    type="file"
                    onChange={handleInputChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <Upload size={14} />
                  <span>{customAvatarPreview ? 'Change Photo' : 'Upload from Device'}</span>
                </label>

                {customAvatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isProcessing}
                    className="clay-btn clay-btn-sm"
                    style={{ color: '#EF4444', fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <Trash2 size={13} /> Remove Photo
                  </button>
                )}

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Auto-saves immediately on select
                </span>
              </div>
            </div>

            {/* Fantasy Class Icons Selection */}
            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Or select a classic fantasy RPG icon:
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(avatar)}
                    disabled={isProcessing}
                    style={{
                      fontSize: '1.4rem',
                      padding: '6px 8px',
                      borderRadius: '12px',
                      border: !customAvatarPreview && selectedAvatarId === avatar ? '2px solid var(--primary)' : '1px solid transparent',
                      background: !customAvatarPreview && selectedAvatarId === avatar ? 'var(--bg-card)' : 'transparent',
                      boxShadow: !customAvatarPreview && selectedAvatarId === avatar ? 'var(--clay-shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Equip ${avatar}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Name Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Hero Name
            </label>
            <input
              type="text"
              className="clay-input"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g. Sir Gallant"
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="clay-btn clay-btn-sm"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="clay-btn clay-btn-primary"
            >
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
