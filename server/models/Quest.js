import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['intellect', 'strength', 'agility', 'vitality', 'creativity', 'spirit'],
    default: 'intellect'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'epic'],
    default: 'medium'
  },
  xpReward: { type: Number, default: 25 },
  coinReward: { type: Number, default: 15 },
  statReward: {
    stat: { type: String, default: 'intellect' },
    amount: { type: Number, default: 1 }
  },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  isRecurring: { type: Boolean, default: false }, // Daily repeating quest
  dueDate: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Quest = mongoose.model('Quest', questSchema);
