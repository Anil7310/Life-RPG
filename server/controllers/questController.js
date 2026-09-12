import { dbService } from '../services/dbService.js';
import { RPG } from '../services/rpgEngine.js';

export const getQuests = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const quests = await dbService.getQuestsByUserId(userId);
    res.json({ success: true, quests });
  } catch (err) {
    console.error('Get quests error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quests: ' + err.message });
  }
};

export const createQuest = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { title, description, category = 'intellect', difficulty = 'medium', isRecurring = false, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Quest title is required.' });
    }

    const rewards = RPG.getDifficultyRewards(difficulty, category);

    const newQuest = await dbService.createQuest({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      difficulty,
      xpReward: rewards.xpReward,
      coinReward: rewards.coinReward,
      statReward: rewards.statReward,
      isCompleted: false,
      completedAt: null,
      isRecurring: Boolean(isRecurring),
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      quest: newQuest,
      message: 'Quest created successfully!'
    });
  } catch (err) {
    console.error('Create quest error:', err);
    res.status(500).json({ success: false, message: 'Failed to create quest: ' + err.message });
  }
};

export const updateQuest = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;
    const { title, description, category, difficulty, isRecurring, dueDate } = req.body;

    const quest = await dbService.getQuestById(id);
    if (!quest || quest.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Quest not found.' });
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category) updates.category = category;
    if (difficulty) {
      updates.difficulty = difficulty;
      const rewards = RPG.getDifficultyRewards(difficulty, category || quest.category);
      updates.xpReward = rewards.xpReward;
      updates.coinReward = rewards.coinReward;
      updates.statReward = rewards.statReward;
    }
    if (isRecurring !== undefined) updates.isRecurring = Boolean(isRecurring);
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedQuest = await dbService.updateQuest(id, updates);

    res.json({
      success: true,
      quest: updatedQuest,
      message: 'Quest updated successfully.'
    });
  } catch (err) {
    console.error('Update quest error:', err);
    res.status(500).json({ success: false, message: 'Failed to update quest: ' + err.message });
  }
};

export const deleteQuest = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;

    const deleted = await dbService.deleteQuest(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Quest not found or already deleted.' });
    }

    res.json({
      success: true,
      message: 'Quest deleted successfully.'
    });
  } catch (err) {
    console.error('Delete quest error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete quest: ' + err.message });
  }
};

export const completeQuest = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;

    const quest = await dbService.getQuestById(id);
    if (!quest || quest.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Quest not found.' });
    }

    // Toggle completion or process reward
    if (quest.isCompleted) {
      // Un-complete quest (reverts status)
      const updatedQuest = await dbService.updateQuest(id, {
        isCompleted: false,
        completedAt: null
      });
      return res.json({
        success: true,
        quest: updatedQuest,
        message: 'Quest marked as incomplete.'
      });
    }

    // Apply RPG math
    const { updatedUser, rewards } = RPG.applyQuestCompletion(req.user, quest);

    // Save updated user stats
    const savedUser = await dbService.updateUser(userId, updatedUser);

    // Mark quest complete
    const updatedQuest = await dbService.updateQuest(id, {
      isCompleted: true,
      completedAt: new Date().toISOString()
    });

    const { password: _, ...sanitizedUser } = savedUser.toObject ? savedUser.toObject() : savedUser;

    res.json({
      success: true,
      quest: updatedQuest,
      user: sanitizedUser,
      rewards,
      message: rewards.didLevelUp
        ? `🎉 Level Up! You reached Level ${rewards.newLevel}!`
        : `⚔️ Quest complete! +${rewards.xpGained} XP, +${rewards.coinsGained} Coins!`
    });
  } catch (err) {
    console.error('Complete quest error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete quest: ' + err.message });
  }
};

export const resetRecurringQuests = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const quests = await dbService.getQuestsByUserId(userId);

    const recurringCompleted = quests.filter(q => q.isRecurring && q.isCompleted);
    for (const q of recurringCompleted) {
      await dbService.updateQuest(q._id.toString(), {
        isCompleted: false,
        completedAt: null
      });
    }

    const updatedQuests = await dbService.getQuestsByUserId(userId);
    res.json({
      success: true,
      quests: updatedQuests,
      message: 'Daily recurring quests refreshed!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
