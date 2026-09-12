import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';
import { JWT_SECRET } from '../middleware/auth.js';

const INITIAL_QUESTS = [
  {
    title: 'Study 45 mins: Focus Session',
    description: 'Read a textbook chapter or complete technical documentation without distractions.',
    category: 'intellect',
    difficulty: 'medium',
    xpReward: 35,
    coinReward: 20,
    statReward: { stat: 'intellect', amount: 1 },
    isRecurring: true
  },
  {
    title: 'Gym & Fitness Workout',
    description: 'Crush a 30-minute cardio or strength workout to build power.',
    category: 'strength',
    difficulty: 'hard',
    xpReward: 65,
    coinReward: 40,
    statReward: { stat: 'strength', amount: 2 },
    isRecurring: true
  },
  {
    title: 'Hydration Quest: Drink 2L Water',
    description: 'Keep your HP and vitality high by drinking plenty of water throughout the day.',
    category: 'vitality',
    difficulty: 'easy',
    xpReward: 15,
    coinReward: 8,
    statReward: { stat: 'vitality', amount: 1 },
    isRecurring: true
  },
  {
    title: 'Design or Code a Creative Feature',
    description: 'Craft a new UI component, sketch an artwork, or write clean code.',
    category: 'creativity',
    difficulty: 'medium',
    xpReward: 35,
    coinReward: 20,
    statReward: { stat: 'creativity', amount: 1 },
    isRecurring: false
  },
  {
    title: '10-Minute Mindfulness & Reflection',
    description: 'Clear the mental fog and boost your spirit before sleep.',
    category: 'spirit',
    difficulty: 'easy',
    xpReward: 15,
    coinReward: 8,
    statReward: { stat: 'spirit', amount: 1 },
    isRecurring: true
  }
];

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, characterName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
    }

    const existingEmail = await dbService.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingUsername = await dbService.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await dbService.createUser({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      characterName: characterName?.trim() || username.trim(),
      avatarId: 'hero-knight',
      title: 'Novice Adventurer',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      coins: 50,
      stats: { intellect: 5, strength: 5, agility: 5, vitality: 5, creativity: 5, spirit: 5 },
      streak: { current: 1, best: 1, lastCompletedDate: null },
      activeTheme: 'pastel-clay',
      unlockedThemes: ['pastel-clay'],
      badges: ['Novice Explorer'],
      inventory: []
    });

    const userId = newUser._id.toString();

    // Populate initial starter quests
    for (const q of INITIAL_QUESTS) {
      await dbService.createQuest({ ...q, userId });
    }

    const token = generateToken(userId);
    const { password: _, ...sanitizedUser } = newUser.toObject ? newUser.toObject() : newUser;

    res.status(201).json({
      success: true,
      token,
      user: sanitizedUser,
      message: 'Account created successfully! Welcome to Life RPG.'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration: ' + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email/username and password.' });
    }

    let user = await dbService.findUserByEmail(emailOrUsername);
    if (!user) {
      user = await dbService.findUserByUsername(emailOrUsername);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id.toString());
    const { password: _, ...sanitizedUser } = user.toObject ? user.toObject() : user;

    res.json({
      success: true,
      token,
      user: sanitizedUser,
      message: 'Logged in successfully!'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
};

export const demoGuestLogin = async (req, res) => {
  try {
    const demoEmail = 'guest.hero@liferpg.local';
    let user = await dbService.findUserByEmail(demoEmail);

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('rpgGuestPass123!', salt);

      user = await dbService.createUser({
        username: 'HeroGuest',
        email: demoEmail,
        password: hashedPassword,
        characterName: 'Valiant Hero',
        avatarId: 'hero-knight',
        title: 'Apprentice Adventurer',
        level: 2,
        xp: 45,
        xpToNextLevel: 130,
        coins: 120,
        stats: { intellect: 8, strength: 7, agility: 6, vitality: 9, creativity: 5, spirit: 6 },
        streak: { current: 3, best: 5, lastCompletedDate: new Date().toISOString().split('T')[0] },
        activeTheme: 'pastel-clay',
        unlockedThemes: ['pastel-clay', 'midnight-arcade'],
        badges: ['Novice Explorer', 'Grand Sage'],
        inventory: []
      });

      const userId = user._id.toString();
      for (const q of INITIAL_QUESTS) {
        await dbService.createQuest({ ...q, userId });
      }
    }

    const token = generateToken(user._id.toString());
    const { password: _, ...sanitizedUser } = user.toObject ? user.toObject() : user;

    res.json({
      success: true,
      token,
      user: sanitizedUser,
      message: 'Logged in as Demo Hero!'
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ success: false, message: 'Error in guest login: ' + err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const { password: _, ...sanitizedUser } = user.toObject ? user.toObject() : user;
    res.json({ success: true, user: sanitizedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { characterName, avatarId, avatarUrl, activeTheme, title } = req.body;
    const userId = req.user._id.toString();

    const updates = {};
    if (characterName !== undefined) updates.characterName = characterName.trim();
    if (avatarId !== undefined) updates.avatarId = avatarId;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (activeTheme !== undefined) updates.activeTheme = activeTheme;
    if (title !== undefined) updates.title = title;

    const updatedUser = await dbService.updateUser(userId, updates);
    const { password: _, ...sanitizedUser } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;

    res.json({ success: true, user: sanitizedUser, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await dbService.findUserByEmail(email.trim());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No character found with that email address.' });
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpires = new Date(Date.now() + 1800000); // 30 minutes expiration

    await dbService.updateUser(user._id.toString(), {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    const clientOrigin = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${clientOrigin}/?resetToken=${resetToken}`;

    // Send real email via SMTP
    const { sendPasswordResetEmail } = await import('../services/emailService.js');
    await sendPasswordResetEmail(user.email, user.characterName || user.username, resetLink);

    res.json({
      success: true,
      message: `A secure password reset link has been sent to ${user.email}. Please check your email inbox to reset your password.`,
      email: user.email
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await dbService.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await dbService.updateUser(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    const jwtToken = generateToken(user._id.toString());
    const { password: _, ...sanitizedUser } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;

    res.json({
      success: true,
      token: jwtToken,
      user: sanitizedUser,
      message: 'Password has been successfully reset! Welcome back to Life RPG.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

