-- Run queries as postgres/superuser
-- psql -U postgres -a -f initDatabase

-- Create database, connect to it.
CREATE DATABASE happal;
\c happal;

-- Create required table
\i 'node_modules/connect-pg-simple/table.sql'

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
RETURNS TABLE (id UUID, username VARCHAR, user_docs_id INTEGER)
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
    RETURN QUERY SELECT users.id, users.username, users.user_docs_id FROM users WHERE users.username = new_username;
END;
$$;

-- create role api and grant required privileges
CREATE ROLE "api" LOGIN PASSWORD 'happal_api';

GRANT CONNECT ON DATABASE happal TO "api";

GRANT USAGE ON SCHEMA public TO "api";

GRANT SELECT, INSERT ON TABLE credentials TO "api";
GRANT SELECT, INSERT, UPDATE ON TABLE users TO "api";
GRANT INSERT ON TABLE client_logs TO "api";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE session TO "api";

GRANT USAGE, UPDATE ON SEQUENCE users_user_docs_id_seq TO "api";
GRANT USAGE, UPDATE ON SEQUENCE client_logs_id_seq TO "api";

GRANT EXECUTE ON FUNCTION insert_user TO "api";

GRANT USAGE ON TYPE client_log TO "api";