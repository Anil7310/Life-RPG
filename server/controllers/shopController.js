import { dbService } from '../services/dbService.js';
import { DEFAULT_SHOP_ITEMS } from '../models/Reward.js';

export const getShopCatalogue = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const items = await dbService.getShopItems(userId);
    res.json({
      success: true,
      shop: items,
      userCoins: req.user.coins || 0
    });
  } catch (err) {
    console.error('Get shop items error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch shop items: ' + err.message });
  }
};

export const buyReward = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = req.user;
    const { itemId } = req.body;

    const preset = DEFAULT_SHOP_ITEMS.find(item => item.id === itemId);
    if (!preset) {
      return res.status(404).json({ success: false, message: 'Shop item not found.' });
    }

    if ((user.coins || 0) < preset.cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins! You need ${preset.cost} coins (You have ${user.coins || 0}).`
      });
    }

    const updates = {
      coins: user.coins - preset.cost
    };

    const inventory = Array.isArray(user.inventory) ? [...user.inventory] : [];
    inventory.push({
      itemId: preset.id,
      title: preset.title,
      type: preset.type,
      icon: preset.icon,
      unlockedAt: new Date()
    });
    updates.inventory = inventory;

    // Apply unlocks
    if (preset.type === 'theme') {
      const unlockedThemes = user.unlockedThemes ? [...user.unlockedThemes] : ['pastel-clay'];
      if (!unlockedThemes.includes(preset.value)) {
        unlockedThemes.push(preset.value);
      }
      updates.unlockedThemes = unlockedThemes;
      updates.activeTheme = preset.value; // Auto-equip newly bought theme
    } else if (preset.type === 'badge') {
      const badges = user.badges ? [...user.badges] : [];
      if (!badges.includes(preset.value)) {
        badges.push(preset.value);
      }
      updates.badges = badges;
    } else if (preset.type === 'title') {
      updates.title = preset.value;
    }

    const updatedUser = await dbService.updateUser(userId, updates);
    const { password: _, ...sanitizedUser } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;

    res.json({
      success: true,
      user: sanitizedUser,
      boughtItem: preset,
      message: `🎉 Unlocked ${preset.title}! -${preset.cost} Coins.`
    });
  } catch (err) {
    console.error('Buy reward error:', err);
    res.status(500).json({ success: false, message: 'Purchase failed: ' + err.message });
  }
};

export const createCustomReward = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { title, description, cost, icon } = req.body;

    if (!title || !cost) {
      return res.status(400).json({ success: false, message: 'Reward title and coin cost are required.' });
    }

    const reward = await dbService.createCustomReward({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      cost: Number(cost),
      type: 'custom_irl',
      icon: icon || '🎁'
    });

    res.status(201).json({
      success: true,
      reward,
      message: 'Custom reward created!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create reward: ' + err.message });
  }
};

export const claimCustomReward = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { rewardId } = req.params;

    const freshUser = await dbService.findUserById(userId);
    if (!freshUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { custom } = await dbService.getShopItems(userId);
    const reward = custom.find(r => (r._id?.toString() === rewardId || r.id === rewardId || r._id === rewardId));

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Custom reward not found.' });
    }

    if ((freshUser.coins || 0) < reward.cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins! Need ${reward.cost} coins (You have ${freshUser.coins || 0}).`
      });
    }

    const updatedUser = await dbService.updateUser(userId, {
      coins: freshUser.coins - reward.cost
    });

    const { password: _, ...sanitizedUser } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;

    res.json({
      success: true,
      user: sanitizedUser,
      claimedReward: reward,
      message: `🎉 Enjoy your reward: "${reward.title}"! -${reward.cost} Coins.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to claim reward: ' + err.message });
  }
};

export const deleteCustomReward = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { rewardId } = req.params;

    await dbService.deleteCustomReward(rewardId, userId);
    res.json({ success: true, message: 'Custom reward deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
