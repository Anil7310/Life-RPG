import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  userId: { type: String, default: null }, // null means global predefined reward
  title: { type: String, required: true },
  description: { type: String, default: '' },
  cost: { type: Number, required: true },
  type: {
    type: String,
    enum: ['theme', 'badge', 'title', 'custom_irl'],
    default: 'badge'
  },
  value: { type: String, default: '' }, // theme name or badge identifier
  icon: { type: String, default: '🎁' },
  createdAt: { type: Date, default: Date.now }
});

export const Reward = mongoose.model('Reward', rewardSchema);

export const DEFAULT_SHOP_ITEMS = [
  // Themes
  {
    id: 'theme-midnight',
    title: 'Midnight Arcade Theme',
    description: 'A cozy dark theme with neon accents and retro gamer vibes.',
    cost: 100,
    type: 'theme',
    value: 'midnight-arcade',
    icon: '🌙'
  },
  {
    id: 'theme-forest',
    title: 'Forest Druid Theme',
    description: 'Earthy emerald greens and organic leaf textures for inner peace.',
    cost: 120,
    type: 'theme',
    value: 'forest-druid',
    icon: '🌿'
  },
  {
    id: 'theme-sunset',
    title: 'Sunset Horizon Theme',
    description: 'Warm coral, amber, and golden twilight gradients.',
    cost: 150,
    type: 'theme',
    value: 'sunset-horizon',
    icon: '🌅'
  },
  {
    id: 'theme-cyber',
    title: 'Cyberpunk Neon Theme',
    description: 'Electric cyan and magenta aesthetic for high-tech productivity.',
    cost: 200,
    type: 'theme',
    value: 'cyber-neon',
    icon: '⚡'
  },
  // Badges & Titles
  {
    id: 'badge-slayer',
    title: 'Dragon Slayer Badge',
    description: 'Proof of crushing insurmountable productivity boss fights.',
    cost: 75,
    type: 'badge',
    value: 'Dragon Slayer',
    icon: '🐉'
  },
  {
    id: 'badge-scholar',
    title: 'Grand Sage Medal',
    description: 'For those who prioritize continuous learning and knowledge.',
    cost: 80,
    type: 'badge',
    value: 'Grand Sage',
    icon: '📜'
  },
  {
    id: 'badge-titan',
    title: 'Iron Titan Shield',
    description: 'Awarded to unrelenting warriors of discipline and physical strength.',
    cost: 90,
    type: 'badge',
    value: 'Iron Titan',
    icon: '🛡️'
  },
  {
    id: 'title-legendary',
    title: 'Title: "Master of Destiny"',
    description: 'Equip this prestigious title to show off on your character sheet.',
    cost: 250,
    type: 'title',
    value: 'Master of Destiny',
    icon: '👑'
  }
];
