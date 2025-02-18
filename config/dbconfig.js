const mysql = require('mysql2');
const dotenv = require('dotenv');
// require('mysql2'): Imports the mysql2 library, which is an improved version of mysql that supports Promises and better performance.
// require('dotenv'): Imports the dotenv package, which is used to load environment variables from a .env file.


dotenv.config();
//This reads the .env file and loads its key-value pairs into process.env, making them accessible throughout the application.

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
queueLimit: 0
});

// mysql.createPool({...}): Creates a connection pool, which is a set of reusable connections to the database.
// host: process.env.DB_HOST: The database host (e.g., localhost or a remote server).
// user: process.env.DB_USER: The database username.
// password: process.env.DB_PASSWORD: The password for the database.
// database: process.env.DB_NAME: The name of the database to connect to.
// waitForConnections: true: If all connections are in use, new requests will wait instead of failing.
// connectionLimit: 10: Limits the number of connections to 10. Setting connectionLimit too high can overload the database, causing slowdowns, crashes, or connection failures. 
// queueLimit: 0: No limit on the number of requests waiting for a connection.


pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to the database');
    connection.release(); 
  }
});

// pool.getConnection((err, connection) => {...}): Tries to get a connection from the pool.
// if (err) { console.error(...) }: If an error occurs, logs the error message.
// else { console.log('Connected to the database') }: If successful, logs a success message.
// connection.release(): Releases the connection back to the pool so it can be reused.


module.exports = pool.promise();

// pool.promise(): Converts the pool to use Promise-based queries instead of callbacks.
// module.exports = pool.promise(): Exports the pool so it can be used in other parts of the application.

