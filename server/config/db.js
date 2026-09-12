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
  const isProduction = process.env.NODE_ENV === 'production';

  const mongoURI =
    process.env.DATABASE_URL ||
    process.env.MONGODB_URI;

  // Production must have a real MongoDB connection string.
  if (isProduction && !mongoURI) {
    console.error(
      '[Database] ERROR: DATABASE_URL or MONGODB_URI is required in production.'
    );
    process.exit(1);
  }

  // Local development can use the local MongoDB instance.
  const connectionURI =
    mongoURI || 'mongodb://127.0.0.1:27017/liferpg';

  try {
    await mongoose.connect(connectionURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    isMongoConnected = true;

    console.log('[Database] MongoDB connected successfully.');
  } catch (error) {
    isMongoConnected = false;

    if (isProduction) {
      console.error('[Database] MongoDB connection failed.');
      console.error('[Database] Production server cannot start without MongoDB.');
      console.error('[Database] Error:', error.message);

      process.exit(1);
    }

    console.warn(
      '[Database] MongoDB unavailable in development.'
    );
    console.warn(
      '[Database] Using local JSON fallback database.'
    );
  }
};