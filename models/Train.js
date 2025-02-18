
// This imports the database configuration file, dbconfig.js, which likely sets up the connection to the database.
// db is an object that allows us to execute SQL queries.

const db = require('../config/dbconfig');


// This function is exported as addTrain, making it accessible to other modules.
// It is an asynchronous function that takes four parameters:
// trainNumber: The number assigned to the train.
// source: The starting location of the train.
// destination: The ending location of the train.
// totalSeats: The total number of seats available on the train.

exports.addTrain = async (trainNumber, source, destination, totalSeats) => {
  const availableSeats = totalSeats; // Initially, available seats are equal to total seats
  try {
    //The SQL query inserts a new train into the trains table.
    // The ? placeholders prevent SQL injection and are replaced with values from the array [trainNumber, source, destination, totalSeats, availableSeats].
    const [result] = await db.query(
      'INSERT INTO trains (train_number, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)',
      [trainNumber, source, destination, totalSeats, availableSeats]
    );
    return result.insertId; // Returning the ID of the newly added train
  } catch (err) {
    throw new Error('Error adding train'); //If any error occures then display it with appropriate message
  }
};

//Executes a SQL query to fetch the train where id = trainId.
// The [rows] destructuring extracts the result set.
// rows[0] ensures we return only one train record.
// If no train is found, it will return undefined.

exports.getTrainById = async (trainId) => {
  try {
    const [rows] = await db.query('SELECT * FROM trains WHERE id = ?', [trainId]);
    return rows[0];
  } catch (err) {
    throw new Error('Error fetching train');
  }
};

//Fetches trains that travel between a given source and destination.
exports.getTrainsByRoute = async (source, destination) => {
    try {
        // console.log('Source:', source);
        // console.log('Destination:', destination);
   
        //.trim() removes extra spaces, and .toLowerCase() ensures case-insensitive comparison.
         const sourceFormatted = source.trim().toLowerCase();
         const destinationFormatted = destination.trim().toLowerCase();
 
         
            const [rows] = await db.query(`
             SELECT train_number, source, destination, total_seats, available_seats
             FROM trains
             WHERE TRIM(LOWER(source)) = ? AND TRIM(LOWER(destination)) = ?
           `, [sourceFormatted, destinationFormatted]);
           
         
 
         //console.log('Query result:', rows); // Log the query result
         return rows;
   
       } catch (err) {
         console.error('Error fetching trains by route:', err);
         throw new Error('Error fetching trains by route: ' + err.message);
       }
     };
    



//This function updates the available seats when tickets are booked.
exports.updateAvailableSeats = async (trainId, seatsToBook) => {
  try {
    const [result] = await db.query(
      // Ensures that there are at least seatsToBook available before reducing seats to prevent overbooking.
      'UPDATE trains SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?',
      [seatsToBook, trainId, seatsToBook]
    );
    return result.affectedRows > 0; // Return true if seats were successfully booked
  } catch (err) {
    throw new Error('Error updating available seats');
  }
};


//Function to Update Train's Total and Available Seats
exports.updateSeats = async (trainId, totalSeats, availableSeats) => {
    try {
      const [result] = await db.query(
        'UPDATE trains SET total_seats = ?, available_seats = ? WHERE id = ?',
        [totalSeats, availableSeats, trainId]
      );
      return result.affectedRows > 0; // Return true if the update was successful
    } catch (err) {
      throw new Error('Error updating seats in the database: ' + err.message);
    }
};

