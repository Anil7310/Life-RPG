import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../.data');
const DATA_FILE = path.join(DATA_DIR, 'db_fallback.json');

// In-memory / JSON fallback database store
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
      console.warn('Fallback DB init warning:', err.message);
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Fallback DB save error:', err.message);
    }
  }
}

export const localDB = new LocalStorageDB();
export let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/liferpg';
  try {
    // Attempt MongoDB connection with 4 second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000
    });
    isMongoConnected = true;
    console.log('✨ [Database] Connected successfully to Hosted Database / MongoDB!');
  } catch (error) {
    isMongoConnected = false;
    console.log('⚡ [Database] MongoDB not found locally or remote connection failed. Using resilient Local Storage Database.');
    console.log('   (To connect to MongoDB Atlas / Hosted DB, set MONGODB_URI or DATABASE_URL in your environment)');
  }
};
