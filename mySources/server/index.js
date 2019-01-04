const keys = require('./keys');

//////////////////////////////////////////////////////////////////
// express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// make a new express application
// the object that receive and respond to any HTTP requests coming and going back to react server
const app = express();
// tell the app to use cors and bodyParser.json
// cors = cross origin resource sharing
app.use(cors());
app.use(bodyParser.json());
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
// postgres client setup
// get Pool module from pg library
const { Pool } = require('pg');
// make pgClient instance out of Pool module
const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort
});
// error listening. anytime the error connection occurs, show the console log below
pgClient.on('error', () => console.log('Lost PG connection'));

// initially create a table that stores all values. number == column name
pgClient
	.query('CREATE TABLE IF NOT EXISTS values (number INT)')
	.catch(err => console.log(err));
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	// if we lose connection to redis, try to reconnect it once every 1000 ms.
	retry_strategy: () => 1000
});
// the javascript documentation says if we have a client that is listening or publishing information on redis, we have to make a duplicate connection because, when a connection is turned into a connection that is going to listen, subscribe or publish information, it cannot be used for other purposes.
const redisPublisher = redisClient.duplicate();
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// express route handlers

// test route
app.get('', (req, res) => {
	res.send('Hi');
});

// query the running postscripts instance and retrieve all the different values that have ever been submitted to postscripts (returns all the values that have been submitted to whoever requesting to /values/all)
app.get('/values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * from values');
	res.send(values.rows);
});

// we reach redis server and retrive all the different indices calculating fibonacci values
	// hgetall == look at all the hash values 
app.get('/values/current', async (req, res) => {
	redisClient.hgetall('values', (err, values) => {
		res.send(values);
	});
});

// transferring the input value in the form to redis nad postgres server each
app.post ('/values', async (req, res) => {
	const index = req.body.index;
	// input validation: to avoid taking too long time for fibonacci value calculation, we limit the number less than 40
	if (parseInt(index) > 40) {
		return res.status(422).send('Index too high');
	}

	// put index to the redis server to calc fibonacci value
	// 'Nothing yet!' indicates 'we have not yet calculated'
	redisClient.hset('values', index, 'Nothing yet!');
	// get up the worker process and make it pull a new value out of redis
	redisPublisher.publish('insert', index);
	// insert index to postgres db
	pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

	res.send({working: true});
});

app.listen(5000, err => {
	console.log('listening')
});


//////////////////////////////////////////////////////////////////



