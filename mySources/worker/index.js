// house the host name and the port for connecting redis: API key for connection so to say.
const keys = require('./keys');
// import redis client
const redis = require('redis');
// create redis client
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	// if it loses the connection to redis server, it should automatically to the server once per 1 sec
	retry_strategy: () => 1000
});

// duplicate the client. sub stands for subscription
const sub = redisClient.duplicate();

function fib(index) {
	if (index < 2) return 1;
	return fib(index - 1) + fib(index - 2);

}

// anytime we see the new message, we run the following callback function
// anytime we get the new value on redis, we are gonna calc the new fibonacci values and insert that to redis as hash values and the key is the message we receive 
sub.on('message', (channel, message) => {
	redisClient.hset('values', message, fib(parseInt(message)));
});
// anytime someone inserts values on redis, we run sub.on
sub.sbscribe('insert');

