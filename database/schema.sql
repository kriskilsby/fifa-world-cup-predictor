CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fifa_code VARCHAR(10)
);

CREATE TABLE fixtures (
    id SERIAL PRIMARY KEY,
    home_team VARCHAR(100),
    away_team VARCHAR(100),
    kickoff TIMESTAMP,
    status VARCHAR(20)
); 

-- View all from match entity
SELECT * FROM match;

-- Count the number of matches
SELECT COUNT(*) FROM match;

-- Get the names of home and away teams for each match
SELECT
    m.id,
    ht.name AS home_team,
    at.name AS away_team,
    m.stage,
    m.matchday
FROM match m
JOIN team ht ON m."homeTeamId" = ht.id
JOIN team at ON m."awayTeamId" = at.id
LIMIT 10;

-- Get the names of the competition for each match
SELECT
    m.id,
    c.name
FROM match m
JOIN competition c
ON m."competitionId" = c.id
LIMIT 10;

-- Get the names of home and away teams for each match, along with the stage and matchday
SELECT
    m.id,
    ht.name AS home_team,
    at.name AS away_team,
    m.stage,
    m.matchday
FROM match m
JOIN team ht
ON m."homeTeamId" = ht.id
JOIN team at
ON m."awayTeamId" = at.id
LIMIT 20;

-- Get the names of home and away teams for each match, along with the stage and matchday, ordered by kickoff date
SELECT
    m.id,
    m."utcDate",
    ht.name AS home_team,
    at.name AS away_team,
    m.stage,
    m.matchday
FROM match m
JOIN team ht ON m."homeTeamId" = ht.id
JOIN team at ON m."awayTeamId" = at.id
ORDER BY m."utcDate"
LIMIT 20;

-- Get the names of home and away teams for each match, along with the group and matchday, ordered by kickoff date, limited to 100 matches
SELECT
    m.id,
    m."utcDate",
    ht.name AS home_team,
    at.name AS away_team,
    m.group,
    m.matchday
FROM match m
JOIN team ht ON m."homeTeamId" = ht.id
JOIN team at ON m."awayTeamId" = at.id
ORDER BY m."utcDate"
LIMIT 100;