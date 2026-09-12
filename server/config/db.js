import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../.data');
const DATA_FILE = path.join(DATA_DIR, 'db_fallback.json');

// In-memory / JSON fallback database.
// This is intended for local development only.
class LocalStorageDB {
  constructor() {
    this.data = {
      users: [],
      quests: [],
      rewards: []
    };

    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[Fallback DB] Initialization warning:', err.message);
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(this.data, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[Fallback DB] Save error:', err.message);
    }
  }
}

export const localDB = new LocalStorageDB();

export let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI =
    process.env.DATABASE_URL ||
    process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('[Database] No MONGODB_URI or DATABASE_URL provided in environment.');
    console.log('[Database] Using resilient Local Storage Database.');
    console.log('           (To connect to MongoDB Atlas, add MONGODB_URI in Render/hosting dashboard)');
    isMongoConnected = false;
    return;
  }

  try {
    console.log('[Database] Attempting connection to hosted database...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    isMongoConnected = true;
    console.log('✨ [Database] MongoDB Atlas connected successfully!');
  } catch (error) {
    isMongoConnected = false;
    console.warn('[Database] Remote MongoDB connection failed: ' + error.message);
    console.log('⚡ [Database] Falling back to resilient Local Storage Database so server remains online.');
    console.log('           (Check your MongoDB Atlas IP whitelist [0.0.0.0/0] and credentials if needed)');
  }
};