CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid(),
    username VARCHAR (15) UNIQUE NOT NULL,
    user_docs_id SERIAL,
    created_at DATE DEFAULT CURRENT_DATE,
    last_sync TIMESTAMPTZ,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS credentials (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    provider_id TEXT,
    provider VARCHAR (30) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_logs (
    id INT GENERATED ALWAYS AS IDENTITY,
    "timestamp" TIMESTAMPTZ,
    "level" VARCHAR (15),
    "type" VARCHAR (15),
    "service" VARCHAR (30),
    "message" TEXT,
    stack TEXT,
    user_agent TEXT,
    PRIMARY KEY (id)
);

CREATE TYPE client_log AS (
    "timestamp" TIMESTAMPTZ,
    "level" VARCHAR (15),
    "type" VARCHAR (15),
    "service" VARCHAR (30),
    "message" TEXT,
    stack TEXT,
    user_agent TEXT
);

CREATE OR REPLACE FUNCTION insert_user (name TEXT)
RETURNS TABLE (id UUID, username VARCHAR)
LANGUAGE PLPGSQL
AS $$
DECLARE
    new_username TEXT;
BEGIN
    LOOP
        new_username := LOWER(SUBSTRING(REPLACE(name, ' ', '') FOR 8)||SUBSTRING(MD5(''||NOW()::TEXT||RANDOM()::TEXT) FOR 7));
        BEGIN
            INSERT INTO users (username) VALUES (new_username);
            EXIT;
        EXCEPTION WHEN unique_violation THEN
        END;
    END LOOP;
    RETURN QUERY SELECT users.id, users.username FROM users WHERE users.username = new_username;
END;
$$;