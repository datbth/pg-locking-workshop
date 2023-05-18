-- CREATE DATABASE h_locking;
-- \c h_locking;

CREATE TABLE teams
(
  id SERIAL PRIMARY KEY,
  name text UNIQUE NOT NULL,
  player_count integer DEFAULT 0 NOT NULL
);

INSERT INTO teams(name) VALUES
  ('Manchester City'),
  ('Chelsea'),
  ('Real Madrid');

CREATE TABLE players
(
  id SERIAL PRIMARY KEY,
  name text UNIQUE NOT NULL,
  team_id integer NOT NULL
);