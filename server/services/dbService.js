import { User } from '../models/User.js';
import { Quest } from '../models/Quest.js';
import { Reward, DEFAULT_SHOP_ITEMS } from '../models/Reward.js';
import { localDB, isMongoConnected } from '../config/db.js';
import crypto from 'crypto';

export const dbService = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (isMongoConnected) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return localDB.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserByUsername(username) {
    if (isMongoConnected) {
      return await User.findOne({ username: username.toLowerCase() });
    }
    return localDB.data.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoConnected) {
      return await User.findById(id);
    }
    return localDB.data.users.find(u => u._id === id) || null;
  },

  async findUserByResetToken(token) {
    if (isMongoConnected) {
      return await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
    }
    const now = new Date().toISOString();
    return localDB.data.users.find(u =>
      u.resetPasswordToken === token &&
      u.resetPasswordExpires &&
      new Date(u.resetPasswordExpires) > new Date(now)
    ) || null;
  },

  async createUser(userData) {
    if (isMongoConnected) {
      const user = new User(userData);
      return await user.save();
    }
    const user = {
      _id: crypto.randomUUID(),
      characterName: userData.characterName || 'Hero',
      avatarId: userData.avatarId || 'knight',
      avatarUrl: userData.avatarUrl || '',
      title: userData.title || 'Novice Adventurer',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      coins: 50,
      stats: {
        intellect: 5,
        strength: 5,
        agility: 5,
        vitality: 5,
        creativity: 5,
        spirit: 5
      },
      streak: {
        current: 1,
        best: 1,
        lastCompletedDate: null
      },
      activeTheme: 'pastel-clay',
      unlockedThemes: ['pastel-clay'],
      badges: ['Novice Explorer'],
      inventory: [],
      createdAt: new Date().toISOString(),
      ...userData
    };
    localDB.data.users.push(user);
    localDB.save();
    return user;
  },

  async updateUser(id, updates) {
    if (isMongoConnected) {
      return await User.findByIdAndUpdate(id, updates, { new: true });
    }
    const idx = localDB.data.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      localDB.data.users[idx] = { ...localDB.data.users[idx], ...updates };
      localDB.save();
      return localDB.data.users[idx];
    }
    return null;
  },

  // --- QUESTS ---
  async getQuestsByUserId(userId) {
    if (isMongoConnected) {
      return await Quest.find({ userId }).sort({ isCompleted: 1, createdAt: -1 });
    }
    return localDB.data.quests
      .filter(q => q.userId === userId)
      .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
  },

  async getQuestById(id) {
    if (isMongoConnected) {
      return await Quest.findById(id);
    }
    return localDB.data.quests.find(q => q._id === id) || null;
  },

  async createQuest(questData) {
    if (isMongoConnected) {
      const quest = new Quest(questData);
      return await quest.save();
    }
   const quest = {
  _id: crypto.randomUUID(),
  isCompleted: false,
  rewardClaimed: false,
  completedAt: null,
  createdAt: new Date().toISOString(),
  ...questData
};
    localDB.data.quests.unshift(quest);
    localDB.save();
    return quest;
  },

  async updateQuest(id, updates) {
    if (isMongoConnected) {
      return await Quest.findByIdAndUpdate(id, updates, { new: true });
    }
    const idx = localDB.data.quests.findIndex(q => q._id === id);
    if (idx !== -1) {
      localDB.data.quests[idx] = { ...localDB.data.quests[idx], ...updates };
      localDB.save();
      return localDB.data.quests[idx];
    }
    return null;
  },

  async deleteQuest(id, userId) {
    if (isMongoConnected) {
      return await Quest.findOneAndDelete({ _id: id, userId });
    }
    const idx = localDB.data.quests.findIndex(q => q._id === id && q.userId === userId);
    if (idx !== -1) {
      const deleted = localDB.data.quests.splice(idx, 1)[0];
      localDB.save();
      return deleted;
    }
    return null;
  },

  // --- REWARDS & SHOP ---
  async getShopItems(userId) {
    let customRewards = [];
    if (isMongoConnected) {
      customRewards = await Reward.find({ userId });
    } else {
      customRewards = localDB.data.rewards.filter(r => r.userId === userId);
    }
    return {
      presets: DEFAULT_SHOP_ITEMS,
      custom: customRewards
    };
  },

  async createCustomReward(rewardData) {
    if (isMongoConnected) {
      const reward = new Reward(rewardData);
      return await reward.save();
    }
    const reward = {
      _id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...rewardData
    };
    localDB.data.rewards.unshift(reward);
    localDB.save();
    return reward;
  },

  async deleteCustomReward(id, userId) {
    if (isMongoConnected) {
      return await Reward.findOneAndDelete({ _id: id, userId });
    }
    const idx = localDB.data.rewards.findIndex(r => r._id === id && r.userId === userId);
    if (idx !== -1) {
      const deleted = localDB.data.rewards.splice(idx, 1)[0];
      localDB.save();
      return deleted;
    }
    return null;
  }
};
