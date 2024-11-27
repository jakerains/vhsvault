-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create movies table
CREATE TABLE movies (
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
CREATE INDEX movies_user_id_idx ON movies(user_id);

-- Create a function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create RLS policies
CREATE POLICY "Users can view their own movies"
    ON movies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movies"
    ON movies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
    ON movies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
    ON movies FOR DELETE
    USING (auth.uid() = user_id);

-- Create a view for user statistics
CREATE VIEW user_movie_stats AS
SELECT 
    user_id,
    COUNT(*) as total_movies,
    COUNT(DISTINCT collection) as total_collections,
    COUNT(DISTINCT UNNEST(genre)) as total_genres,
    MIN(added_date) as first_movie_added,
    MAX(added_date) as last_movie_added
FROM movies
GROUP BY user_id;

-- Grant necessary permissions
GRANT ALL ON movies TO authenticated;
GRANT ALL ON user_movie_stats TO authenticated;

-- Create user_profiles table
CREATE TABLE user_profiles (
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

-- Create a function to automatically create a user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create a view for user activity stats
CREATE VIEW user_activity_stats AS
SELECT 
    up.id,
    up.username,
    COUNT(m.id) as total_movies,
    COUNT(DISTINCT m.collection) as collections,
    COUNT(DISTINCT UNNEST(m.genre)) as unique_genres,
    ARRAY_AGG(DISTINCT m.genre) as favorite_genres,
    MAX(m.added_date) as last_activity
FROM user_profiles up
LEFT JOIN movies m ON m.user_id = up.id
GROUP BY up.id, up.username;

-- Grant access to the new view
GRANT SELECT ON user_activity_stats TO authenticated;

-- Create RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER set_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;