-- Enable Row Level Security
ALTER TABLE IF EXISTS movies ENABLE ROW LEVEL SECURITY;

-- Create movies table if it doesn't exist
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    year TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    genre TEXT[] NOT NULL,
    rating TEXT,
    plot TEXT,
    director TEXT,
    actors TEXT[],
    added_date TIMESTAMP WITH TIME ZONE NOT NULL,
    imdb_id TEXT,
    collection TEXT,
    trailer_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS movies_user_id_idx ON movies(user_id);

-- Create a function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON movies;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own movies" ON movies;
CREATE POLICY "Users can view their own movies"
    ON movies FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own movies" ON movies;
CREATE POLICY "Users can insert their own movies"
    ON movies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own movies" ON movies;
CREATE POLICY "Users can update their own movies"
    ON movies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own movies" ON movies;
CREATE POLICY "Users can delete their own movies"
    ON movies FOR DELETE
    USING (auth.uid() = user_id);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    theme_preferences JSONB DEFAULT '{
        "darkMode": true,
        "retro": true,
        "animations": true
    }'::jsonb,
    movie_preferences JSONB DEFAULT '{
        "favoriteGenres": [],
        "watchingPlatforms": [],
        "moviesPerMonth": 0,
        "favoriteMovies": [],
        "preferredWatchingTime": [],
        "lastViewed": []
    }'::jsonb,
    privacy_settings JSONB DEFAULT '{
        "profileVisibility": "private",
        "showEmail": false,
        "showWatchHistory": false,
        "showStats": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to automatically create a user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_base TEXT;
  username_attempt TEXT;
  counter INTEGER := 0;
BEGIN
    -- Generate a unique username from email
    username_base := split_part(NEW.email, '@', 1);
    username_attempt := username_base;
    
    -- Keep trying until we find a unique username
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = username_attempt) LOOP
        counter := counter + 1;
        username_attempt := username_base || counter::text;
    END LOOP;

    INSERT INTO user_profiles (
        id,
        email,
        first_name,
        last_name,
        username,
        bio,
        movie_preferences,
        theme_preferences,
        privacy_settings
    )
    VALUES (
        NEW.id,
        NEW.email,
        '',
        '',
        username_attempt,
        'VHS enthusiast',
        '{
            "favoriteGenres": [],
            "watchingPlatforms": [],
            "moviesPerMonth": 0,
            "favoriteMovies": [],
            "preferredWatchingTime": [],
            "lastViewed": []
        }'::jsonb,
        '{
            "darkMode": true,
            "retro": true,
            "animations": true
        }'::jsonb,
        '{
            "profileVisibility": "private",
            "showEmail": false,
            "showWatchHistory": false,
            "showStats": true
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    USING (auth.uid() = id);

-- Create trigger for updated_at on user_profiles
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create views for user statistics
DROP VIEW IF EXISTS user_movie_stats;
CREATE VIEW user_movie_stats AS
SELECT 
    user_id,
    COUNT(*) as total_movies,
    COUNT(DISTINCT collection) as total_collections,
    (SELECT COUNT(DISTINCT g) FROM UNNEST(array_agg(genre)) AS g) as total_genres,
    MIN(added_date) as first_movie_added,
    MAX(added_date) as last_movie_added
FROM movies
GROUP BY user_id;

DROP VIEW IF EXISTS user_activity_stats;
CREATE VIEW user_activity_stats AS
SELECT 
    up.id,
    up.username,
    COUNT(m.id) as total_movies,
    COUNT(DISTINCT m.collection) as collections,
    (SELECT COUNT(DISTINCT g) FROM UNNEST(array_agg(m.genre)) AS g) as unique_genres,
    ARRAY_AGG(DISTINCT m.genre) as favorite_genres,
    MAX(m.added_date) as last_activity
FROM user_profiles up
LEFT JOIN movies m ON m.user_id = up.id
GROUP BY up.id, up.username;

-- Grant necessary permissions
GRANT ALL ON movies TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_movie_stats TO authenticated;
GRANT SELECT ON user_activity_stats TO authenticated;

-- Create initial profile for existing users if they don't have one
INSERT INTO user_profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    bio,
    movie_preferences,
    theme_preferences,
    privacy_settings
)
SELECT 
    u.id,
    u.email,
    split_part(u.email, '@', 1),
    '',
    '',
    'VHS enthusiast',
    '{
        "favoriteGenres": [],
        "watchingPlatforms": [],
        "moviesPerMonth": 0,
        "favoriteMovies": [],
        "preferredWatchingTime": [],
        "lastViewed": []
    }'::jsonb,
    '{
        "darkMode": true,
        "retro": true,
        "animations": true
    }'::jsonb,
    '{
        "profileVisibility": "private",
        "showEmail": false,
        "showWatchHistory": false,
        "showStats": true
    }'::jsonb
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
WHERE p.id IS NULL;