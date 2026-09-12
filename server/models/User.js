import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  characterName: { type: String, default: 'Hero' },
  avatarId: { type: String, default: 'knight' },
  avatarUrl: { type: String, default: '' },
  title: { type: String, default: 'Novice Adventurer' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  coins: { type: Number, default: 50 },
  stats: {
    intellect: { type: Number, default: 5 },
    strength: { type: Number, default: 5 },
    agility: { type: Number, default: 5 },
    vitality: { type: Number, default: 5 },
    creativity: { type: Number, default: 5 },
    spirit: { type: Number, default: 5 }
  },
  streak: {
    current: { type: Number, default: 1 },
    best: { type: Number, default: 1 },
    lastCompletedDate: { type: String, default: null }
  },
  activeTheme: { type: String, default: 'pastel-clay' },
  unlockedThemes: { type: [String], default: ['pastel-clay'] },
  badges: { type: [String], default: ['Novice Explorer'] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  inventory: [{
    itemId: String,
    title: String,
    type: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
