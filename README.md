## Getting started

To use this project make sure you have [Docker](https://www.docker.com/get-started) installed then run the following command on your terminal:

```bash
docker compose up
```

Run the first test example:
```bash
docker exec pg-locking-workshop-app-1 node tests/players.js
```

## Notes
* Application setup (see `docker-compose.yml` for more info):
  * Nodejs app:
    * exposed at port 18080
  * Postgresql database:
    * exposed at port 15432
* All application code is in `server.js`

### Data
* Seed data (i.e. initial data): see `database-seed.sql`

### Helper commands
* Interactive postgres console: `docker exec -it pg-locking-workshop-postgres-1 psql`