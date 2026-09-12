export const RPG = {
  // Calculate XP threshold required for next level
  getXpRequiredForLevel(level) {
    return Math.floor(100 * Math.pow(1.3, level - 1));
  },

  // Calculate difficulty rewards
  getDifficultyRewards(difficulty, category = 'intellect') {
    let xp = 25;
    let coins = 15;
    let statBonus = 1;

    switch (difficulty) {
      case 'easy':
        xp = 15;
        coins = 8;
        statBonus = 1;
        break;
      case 'medium':
        xp = 35;
        coins = 20;
        statBonus = 1;
        break;
      case 'hard':
        xp = 65;
        coins = 40;
        statBonus = 2;
        break;
      case 'epic':
        xp = 120;
        coins = 80;
        statBonus = 3;
        break;
      default:
        xp = 25;
        coins = 15;
        statBonus = 1;
    }

    return {
      xpReward: xp,
      coinReward: coins,
      statReward: {
        stat: category,
        amount: statBonus
      }
    };
  },

  // Calculate streak bonus and multiplier
  calculateStreak(user) {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.streak?.lastCompletedDate;

    let currentStreak = user.streak?.current || 0;
    let bestStreak = user.streak?.best || 0;

    if (!lastDate) {
      currentStreak = 1;
    } else if (lastDate === today) {
      // Already completed a quest today, keep streak
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        currentStreak += 1;
      } else {
        // Missed day -> reset to 1
        currentStreak = 1;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Multiplier for streak
    let streakMultiplier = 1.0;
    if (currentStreak >= 14) streakMultiplier = 1.5;
    else if (currentStreak >= 7) streakMultiplier = 1.25;
    else if (currentStreak >= 3) streakMultiplier = 1.1;

    return {
      currentStreak,
      bestStreak,
      today,
      streakMultiplier
    };
  },

  // Process XP, Leveling, Stats, and Coins
  applyQuestCompletion(user, quest) {
    const { currentStreak, bestStreak, today, streakMultiplier } = this.calculateStreak(user);

    let xpGained = quest.xpReward || 25;
    let baseCoins = quest.coinReward || 15;
    let coinsGained = Math.round(baseCoins * streakMultiplier);

    let level = user.level || 1;
    let xp = (user.xp || 0) + xpGained;
    let xpToNextLevel = user.xpToNextLevel || this.getXpRequiredForLevel(level);

    let didLevelUp = false;
    let levelsGained = 0;
    const oldLevel = level;

    // Check level up loop
    while (xp >= xpToNextLevel) {
      xp -= xpToNextLevel;
      level += 1;
      levelsGained += 1;
      didLevelUp = true;
      xpToNextLevel = this.getXpRequiredForLevel(level);
    }

    // Stat boost
    const stats = { ...(user.stats || { intellect: 5, strength: 5, agility: 5, vitality: 5, creativity: 5, spirit: 5 }) };
    const statName = quest.statReward?.stat || quest.category || 'intellect';
    const statAmount = quest.statReward?.amount || 1;

    if (stats[statName] !== undefined) {
      stats[statName] += statAmount;
    } else {
      stats[statName] = (stats[statName] || 5) + statAmount;
    }

    // Determine Dynamic Title based on highest stat & level
    let title = user.title || 'Novice Adventurer';
    if (level >= 10) {
      const highestStat = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];
      const titlesByStat = {
        intellect: 'Grand Archmage of Knowledge',
        strength: 'Legendary Iron Titan',
        agility: 'Shadow Phantom',
        vitality: 'Immortal Guardian',
        creativity: 'Master Artisan of Dreams',
        spirit: 'Enlightened Mystic'
      };
      title = titlesByStat[highestStat] || 'Hero of the Realm';
    } else if (level >= 5) {
      const highestStat = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];
      const titlesByStat = {
        intellect: 'Scholar of the Arcane',
        strength: 'Champion of Might',
        agility: 'Swift Scout',
        vitality: 'Resilient Defender',
        creativity: 'Skilled Artisan',
        spirit: 'Mindful Monk'
      };
      title = titlesByStat[highestStat] || 'Rising Champion';
    }

    return {
      updatedUser: {
        level,
        xp,
        xpToNextLevel,
        coins: (user.coins || 0) + coinsGained,
        stats,
        title,
        streak: {
          current: currentStreak,
          best: bestStreak,
          lastCompletedDate: today
        }
      },
      rewards: {
        xpGained,
        coinsGained,
        streakMultiplier,
        didLevelUp,
        oldLevel,
        newLevel: level,
        levelsGained,
        statBoosted: {
          stat: statName,
          amount: statAmount,
          newValue: stats[statName]
        }
      }
    };
  }
};
