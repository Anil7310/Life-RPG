import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sounds, SOUND_PACKS } from '../utils/soundEffects.js';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('life_rpg_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentPack, setCurrentPack] = useState(() => {
    return localStorage.getItem('life_rpg_sound_pack') || 'retro-arcade';
  });

  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem('life_rpg_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    sounds.setPack(currentPack);
    localStorage.setItem('life_rpg_sound_pack', currentPack);
  }, [currentPack]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      if (next) {
        setTimeout(() => {
          sounds.playQuestComplete(currentPack);
        }, 30);
      }
      return next;
    });
  };

  const changeSoundPack = (packId) => {
    setCurrentPack(packId);
    sounds.setPack(packId);
    localStorage.setItem('life_rpg_sound_pack', packId);
    // Play instant demonstration of the selected pack
    sounds.playQuestComplete(packId);
  };

  const playQuestComplete = useCallback(() => {
    sounds.playQuestComplete(currentPack);
  }, [currentPack]);

  const playCoin = useCallback(() => {
    sounds.playCoin(currentPack);
  }, [currentPack]);

  const playLevelUp = useCallback(() => {
    sounds.playLevelUp(currentPack);
  }, [currentPack]);

  const playButton = useCallback(() => {
    sounds.playButton(currentPack);
  }, [currentPack]);

  const playError = useCallback(() => {
    sounds.playError(currentPack);
  }, [currentPack]);

  return (
    <SoundContext.Provider value={{
      soundEnabled,
      toggleSound,
      currentPack,
      changeSoundPack,
      soundPacks: SOUND_PACKS,
      playQuestComplete,
      playCoin,
      playLevelUp,
      playButton,
      playError,
      previewSound: (packId) => sounds.playQuestComplete(packId)
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
