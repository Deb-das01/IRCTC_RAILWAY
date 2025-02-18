// Import the database configuration file, which contains the database connection settings.
const db = require('../config/dbconfig');



const Booking = {  // Define an object named 'Booking' that contains database-related operations.
  
  create: async (userId, trainId, seats, connection) => { // Define an asynchronous function 'create' to insert a new booking into the database.
    // Parameters:
    // - userId: The ID of the user making the booking.
    // - trainId: The ID of the train for which the booking is made.
    // - seats: The number of seats being booked.
    // - connection: The active database connection.
 
    try {
      // Define the SQL query for inserting a new booking.
      // '?' placeholders are used to safely insert values, preventing SQL injection.

                            // SQL INJECTION IN SHORT:-
      //  SQL Injection is a security vulnerability where an attacker manipulates an application's SQL query 
      //  by injecting malicious SQL code into input fields. This can allow unauthorized access, data theft, 
      //  modification, or even deletion of database records.
      
      //  Example of a vulnerable query:
      //    const query = "SELECT * FROM users WHERE username = '" + userInput + "' AND password = '" + passInput + "'";
      //  If the attacker enters: `admin' --` (as username), the query bypasses authentication.
      
      //  To prevent SQL Injection, always use parameterized queries like:
      //    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
      //    db.query(query, [username, password]); // Secure approach
      
      //  In this code, we use '?' placeholders in SQL queries to prevent SQL Injection attacks.
      

      const query = `
        INSERT INTO bookings (user_id, train_id, seats)
        VALUES (?, ?, ?)
      `;

      // Execute the query using the provided database connection.
      // The query parameters (userId, trainId, seats) are passed as an array.
      // The 'await' keyword ensures that the function waits for the query to complete before proceeding.
      const [result] = await connection.query(query, [userId, trainId, seats]); 
     // Return the ID of the newly created booking, which can be used for further reference.
      return result.insertId;
    } catch (err) {
      // If an error occurs during database insertion, it is caught in this block.

      // Throw a new error with a descriptive message so the caller knows what went wrong.
      throw new Error('Error creating booking: ' + err.message);
    }
  },
};


// Export the 'Booking' object so it can be used in other files.
module.exports = Booking;

