
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

CREATE TYPE game_mode AS ENUM ('classic', 'eins_muss_weg', 'multi_block');

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode game_mode NOT NULL,
    max_players INTEGER NOT NULL CHECK (max_players >= 2 AND max_players <= 10),
    ai_players INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    tournament_mode BOOLEAN DEFAULT false,
    joker_kniffel BOOLEAN DEFAULT false,
    fast_game BOOLEAN DEFAULT false,
    time_limit INTEGER DEFAULT NULL, -- seconds per turn
    multi_blocks INTEGER DEFAULT 1, -- for multi-block mode
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, finished
    current_player_index INTEGER DEFAULT 0,
    current_round INTEGER DEFAULT 1,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for AI players
    player_index INTEGER NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    ai_name VARCHAR(50) DEFAULT NULL,
    is_eliminated BOOLEAN DEFAULT false, -- for tournament mode
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_index)
);

CREATE TABLE IF NOT EXISTS score_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
    block_index INTEGER NOT NULL DEFAULT 0, -- 0 for single block, 0-9 for multi-block
    
    ones INTEGER DEFAULT NULL,
    twos INTEGER DEFAULT NULL,
    threes INTEGER DEFAULT NULL,
    fours INTEGER DEFAULT NULL,
    fives INTEGER DEFAULT NULL,
    sixes INTEGER DEFAULT NULL,
    upper_bonus INTEGER DEFAULT 0,
    
    three_of_kind INTEGER DEFAULT NULL,
    four_of_kind INTEGER DEFAULT NULL,
    full_house INTEGER DEFAULT NULL,
    small_straight INTEGER DEFAULT NULL,
    large_straight INTEGER DEFAULT NULL,
    kniffel INTEGER DEFAULT NULL,
    chance INTEGER DEFAULT NULL,
    
    joker_kniffels INTEGER DEFAULT 0,
    
    total_score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    
    UNIQUE(game_player_id, block_index)
);

CREATE TABLE IF NOT EXISTS game_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_index INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    roll_number INTEGER NOT NULL CHECK (roll_number >= 1 AND roll_number <= 3),
    dice_values INTEGER[] NOT NULL, -- array of 5 dice values
    dice_kept BOOLEAN[] NOT NULL, -- array of 5 booleans for kept dice
    score_category VARCHAR(50) DEFAULT NULL, -- which category was scored
    score_value INTEGER DEFAULT NULL,
    block_index INTEGER DEFAULT 0, -- for multi-block mode
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    human_only_games INTEGER DEFAULT 0,
    human_only_wins INTEGER DEFAULT 0,
    ai_only_games INTEGER DEFAULT 0,
    ai_only_wins INTEGER DEFAULT 0,
    mixed_games INTEGER DEFAULT 0,
    mixed_wins INTEGER DEFAULT 0,
    tournament_wins INTEGER DEFAULT 0,
    
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    total_kniffels INTEGER DEFAULT 0,
    
    classic_games INTEGER DEFAULT 0,
    classic_wins INTEGER DEFAULT 0,
    eins_muss_weg_games INTEGER DEFAULT 0,
    eins_muss_weg_wins INTEGER DEFAULT 0,
    multi_block_games INTEGER DEFAULT 0,
    multi_block_wins INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.username,
    us.total_games,
    us.total_wins,
    us.highest_score,
    us.tournament_wins,
    CASE 
        WHEN us.total_games > 0 THEN ROUND((us.total_wins::DECIMAL / us.total_games) * 100, 2)
        ELSE 0 
    END as win_percentage
FROM users u
JOIN user_statistics us ON u.id = us.user_id
WHERE us.total_games > 0
ORDER BY us.total_wins DESC, us.highest_score DESC;

CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_turns_game_id ON game_turns(game_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
