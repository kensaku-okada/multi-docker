// house some different variables that we need to connect to running instances of redis and postgres that associated to the application
module.exports = {
	redisHost: process.env.REDIS_HOST,
	redisPort: process.env.REDIS_PORT,
	// postgres user that we log in as
	pgUser: process.env.PGUSER,
	pgHost: process.env.PGHOST,
	pgDatabase: process.env.PGDATABASE,
	pgPassword: process.env.PGPASSWORD,
	pgPort: process.env.PGPORT

}
