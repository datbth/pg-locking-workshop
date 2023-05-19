// @ts-check

const { Client, Pool } = require("pg");
const express = require("express");

const app = express();
app.use(express.json())
const port = 8080;

const pool = new Pool({
  password: "root",
  user: "root",
  host: "postgres",
});

app.get('/', (req, res) => {
  res.status(200);
  res.send('hello');
});

app.post("/reset", async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('TRUNCATE players')
    await client.query('UPDATE teams SET player_count = 0')
    await client.query("DELETE FROM teams WHERE name like 'RM%'")
    res.status(200)
    res.send('OK')
  } catch (e) {
    next(e)
  } finally {
    client.release()
  }
});


app.get('/player_count', async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      'SELECT id, name, player_count FROM teams WHERE name = $1',
      [req.query.team_name],
    )
    const team = rows[0]
    if (!team) throw new Error (`Team not found: ${req.query.team_name}`)
    res.status(200)
    res.send(`${team.name} (${team.id}) player_count: ${team.player_count}`)
  } catch (e) {
    next(e)
  } finally {
    client.release()
  }
})

/**
 * Request body:
 *  * name: name of the new player
 *  * team_name: name of the team the new player belongs to
 * Functions:
 *  * Create a new player record
 *  * Update the player_count of the team of that new player
 */
app.post("/players", async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    /**
     * rows:
     *   [
     *     [id, name, player_count]
     *   ]
     */
    console.log('fetching team...', req.body)
    const { rows: team_rows } = await client.query(
      'SELECT id, name, player_count FROM teams WHERE name = $1',
      [req.body.team_name],
    )
    const team = team_rows[0]
    if (!team) throw new Error (`Team not found: ${req.body.team_name}`)

    console.log('creating player...', req.body)
    await client.query(
      'INSERT INTO players (name, team_id) VALUES ($1, $2)',
      [req.body.name, team.id]
    )
    console.log('updating player_count...', req.body)
    await client.query(
      'UPDATE teams SET player_count = player_count + 1 WHERE id = $1',
      [team.id]
    )

    await client.query('COMMIT')
    console.log('done', req.body)
    res.status(200)
    res.send('OK')
  } catch (e) {
    await client.query('ROLLBACk')
    next(e)
  } finally {
    client.release()
  }
});

/**
 * Request body:
 *  * name: name of the new player
 *  * team_name: name of the team the new player belongs to
 * Functions:
 *  * (PLUS function) If there is no existing team with such name, create a new team record
 *  * Create a new player record
 *  * Update the player_count of the team of that player
 */
app.post("/players_plus", async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `
        INSERT INTO teams (name, player_count) VALUES ($1, 1)
        ON CONFLICT (name) DO UPDATE
          SET player_count = teams.player_count + 1
      `,
      [req.body.team_name]
    )

    await client.query(
      `
        INSERT INTO players (name, team_id)
          SELECT $1, id
          FROM teams t
          WHERE t.name = $2
      `,
      [req.body.name, req.body.team_name]
    )

    await client.query('COMMIT')
    res.status(200)
    res.send('OK')
  } catch (e) {
    await client.query('ROLLBACK')
    next(e)
  } finally {
    client.release()
  }
});

(async () => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
