
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can view their own mood entries" ON mood_entries
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert their own mood entries" ON mood_entries
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can update their own mood entries" ON mood_entries
    FOR UPDATE USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete their own mood entries" ON mood_entries
    FOR DELETE USING (user_id IN (
        SELECT id FROM users WHERE auth0_id = auth.uid()::text
    ));
