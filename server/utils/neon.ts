import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
  connectionString,
  ssl: true,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  password_hash?: string;
  is_verified?: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  ai_response: string;
  mood?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_level: number;
  notes?: string;
  created_at: string;
}

export async function initializeNeonDatabase(): Promise<boolean> {
  try {
    console.log("🔄 Initializing Neon database...");

    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        bio TEXT DEFAULT 'Ready to begin my healing journey.',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_verified BOOLEAN DEFAULT false
      );
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
          ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Ready to begin my healing journey.';
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        mood INTEGER CHECK (mood >= 1 AND mood <= 10),
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 10),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
    `);

    client.release();

    console.log("✅ Neon database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Neon database:", error);
    return false;
  }
}


export async function testNeonConnection(): Promise<boolean> {
  try {
    console.log("🧪 Testing Neon database connection...");
    console.log(
      "🔗 Connection string:",
      connectionString.replace(/:[^:]*@/, ":****@"),
    );

    const client = await pool.connect();
    const result = await client.query(
      "SELECT 1 as test, NOW() as current_time",
    );
    client.release();

    console.log("Neon database connection test successful:", result.rows[0]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("❌ Neon database connection test failed:");
    console.error("  Error code:", error.code);
    console.error("  Error message:", error.message);
    console.error("  Error details:", error.detail || "No additional details");
    return false;
  }
}

export async function createUser(
  email: string,
  username: string,
): Promise<User | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO users (email, username, password_hash, created_at, updated_at)
       VALUES ($1, $2, 'temp_hash', NOW(), NOW())
       RETURNING *`,
      [email, username],
    );
    client.release();

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    client.release();

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error finding user:", error);
    return null;
  }
}

export async function updateUserLastActive(userId: string): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query(
      "UPDATE users SET last_active = NOW(), updated_at = NOW() WHERE id = $1",
      [userId],
    );
    client.release();
  } catch (error) {
    console.error("❌ Error updating user last active:", error);
  }
}

export async function createJournalEntry(
  userId: string,
  content: string,
  aiResponse: string,
  mood?: number,
  tags?: string[],
): Promise<JournalEntry | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO journal_entries (user_id, content, ai_response, mood, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [userId, content, aiResponse, mood, tags],
    );
    client.release();

    await updateUserLastActive(userId);

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error creating journal entry:", error);
    return null;
  }
}

export async function getJournalEntries(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ entries: JournalEntry[]; total: number }> {
  try {
    const offset = (page - 1) * limit;
    const client = await pool.connect();

    const entriesResult = await client.query(
      `SELECT * FROM journal_entries 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await client.query(
      "SELECT COUNT(*) FROM journal_entries WHERE user_id = $1",
      [userId],
    );

    client.release();

    return {
      entries: entriesResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  } catch (error) {
    console.error("❌ Error fetching journal entries:", error);
    return { entries: [], total: 0 };
  }
}

export async function getJournalEntry(
  entryId: string,
  userId: string,
): Promise<JournalEntry | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2",
      [entryId, userId],
    );
    client.release();

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error fetching journal entry:", error);
    return null;
  }
}

export async function createMoodEntry(
  userId: string,
  moodLevel: number,
  notes?: string,
): Promise<MoodEntry | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO mood_entries (user_id, mood_level, notes, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, moodLevel, notes],
    );
    client.release();

    await updateUserLastActive(userId);

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error creating mood entry:", error);
    return null;
  }
}

export async function getMoodEntries(
  userId: string,
  days: number = 30,
): Promise<MoodEntry[]> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM mood_entries
       WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '1 day' * $2
       ORDER BY created_at ASC`,
      [userId, days],
    );
    client.release();

    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching mood entries:", error);
    return [];
  }
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; bio?: string },
): Promise<User | null> {
  try {
    const client = await pool.connect();
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.username) {
      setClauses.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }

    if (updates.bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      values.push(updates.bio);
    }

    if (setClauses.length === 0) {
      client.release();
      return null;
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await client.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    client.release();
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    return null;
  }
}

export async function updateUserProfileByEmail(
  email: string,
  updates: { username?: string; bio?: string },
): Promise<User | null> {
  try {
    const client = await pool.connect();
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.username) {
      setClauses.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }

    if (updates.bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      values.push(updates.bio);
    }

    if (setClauses.length === 0) {
      client.release();
      return null;
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(email);

    const result = await client.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE email = $${paramIndex} RETURNING *`,
      values,
    );

    client.release();
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error updating user profile by email:", error);
    return null;
  }
}

export async function cleanupTestJournalEntries(): Promise<number> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      `DELETE FROM journal_entries
       WHERE content ILIKE '%Testing API integration%'
          OR content ILIKE '%test%journal%'
          OR content ILIKE '%API testing%'
          OR content ILIKE '%This will create a REAL journal entry%'
       RETURNING id`,
    );

    client.release();

    const deletedCount = result.rowCount || 0;
    console.log(`🧹 Deleted ${deletedCount} test journal entries`);
    return deletedCount;
  } catch (error) {
    console.error("❌ Error cleaning up test journal entries:", error);
    return 0;
  }
}

export async function cleanupTestMoodEntries(): Promise<number> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      `DELETE FROM mood_entries
       WHERE notes ILIKE '%Testing API mood logging%'
          OR notes ILIKE '%test%mood%'
          OR notes ILIKE '%API testing%'
          OR notes ILIKE '%This will create a REAL mood entry%'
       RETURNING id`,
    );

    client.release();

    const deletedCount = result.rowCount || 0;
    console.log(`🧹 Deleted ${deletedCount} test mood entries`);
    return deletedCount;
  } catch (error) {
    console.error("❌ Error cleaning up test mood entries:", error);
    return 0;
  }
}

export async function closeNeonConnection(): Promise<void> {
  try {
    await pool.end();
    console.log("Neon database connection closed");
  } catch (error) {
    console.error("❌ Error closing Neon database connection:", error);
  }
}
