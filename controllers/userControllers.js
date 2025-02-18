
const db = require('../config/dbconfig');
const Train = require('../models/Train');
const Booking = require('../models/Booking');


//Logic for getting the available trains and seats accng to src and dest

//Fetches available trains and seats based on user-provided source and destination.
exports.getSeatAvailability = async (req, res) => {
  //Extracts user input from request parameters (req.query).
    const { source, destination } = req.query;
  
    //If either source or destination is missing, returns a 400 Bad Request.
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }
  
    try {
      //Fetches all trains available on the given route.
      const trains = await Train.getTrainsByRoute(source, destination);
  
    //If no trains are found, sends 404 Not Found.
      if (trains.length === 0) {
        return res.status(404).json({ message: 'No trains available for the specified route' });
      }
  
      // Map the available trains with train number and available seats
      // Extracts only trainNumber and availableSeats.

      const availableTrains = trains.map(train => ({
        trainNumber: train.train_number,
        availableSeats: train.available_seats
      }));
  
      //Filters out trains with zero available seats.
      const trainsWithSeats = availableTrains.filter(train => train.availableSeats > 0);
  
      // count the number of available trains and seat details
      //Sends train availability details to the user.
      res.status(200).json({
        available: trainsWithSeats.length > 0,
        availableTrainCount: trainsWithSeats.length, 
        trains: availableTrains
      });
    } catch (err) {
      console.error('Error fetching seat availability:', err);
      //If any error occurs, logs it and returns a 500 Internal Server Error.
      res.status(500).json({ message: 'Error fetching seat availability', error: err.message });
    }
  };
  

//Logic for booking the seat with implementataion of LOCKS 
//Uses SQL row-level locks (FOR UPDATE) to ensure only one process updates the seat count at a time.
exports.bookSeat = async (req, res) => {
    const { trainId, seatsToBook } = req.body;
    const userId = req.user.id;
  
    //Creates a connection to the database.
    const connection = await db.getConnection();
    try {
      //Begins a SQL transaction to ensure that all operations  
      // (seat deduction + booking creation) succeed or fail together ensuring atomicity(ACID).

      console.log("Booking started");
  
      
      await connection.beginTransaction();
      console.log("Transaction started");
  
      //Row Locking with FOR UPDATE
      //This locks the row for trainId, preventing other transactions from... 
      // ...modifying it until the current one completes.
      //Thus handeling the race condition effectively.
      //simple the query would be this without the locking condition:-
        //const [train] = await connection.query('SELECT total_seats, available_seats FROM trains WHERE id = ?', [trainId]);

      const [train] = await connection.query('SELECT total_seats, available_seats FROM trains WHERE id = ? FOR UPDATE', [trainId]);
      console.log("Train fetched:", train);
      
      // [train] would be something like:-
      // [
      //   {
      //     total_seats: 100,
      //     available_seats: 5
      //   }
      // ]
      
    
      if (!train.length) {
        console.log("Train not found");
        await connection.rollback();
        return res.status(404).json({ message: 'Train not found' });
      }
  
      const availableSeats = train[0].available_seats;
      console.log("Available seats:", availableSeats);
  
      if (availableSeats < seatsToBook) {
        console.log("Not enough seats available");
        await connection.rollback();
        return res.status(400).json({ message: 'Not enough seats available' });
      }
  
      // Update available seats
      // remember the lock is still accquired in the row so no need to specify FOR UPDATE again
      await connection.query('UPDATE trains SET available_seats = available_seats - ? WHERE id = ?', [seatsToBook, trainId]);
      console.log("Seats updated");
  
      
      await Booking.create(userId, trainId, seatsToBook, connection);
      console.log("Booking Done"); 
  
      // Commit the transaction
      await connection.commit();
      res.json({ message: 'Seats booked successfully' });
    } catch (err) {
      console.error("Error during booking:", err.message); // Log error message
      await connection.rollback();
      res.status(500).json({ message: 'Error booking seats', error: err.message });
    } finally {
      
      connection.release();
    }
  };


  
//getting all the boooking details of a particular user 
exports.getBookingDetails = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const query = `
        SELECT 
          b.id AS booking_id,
          b.seats AS number_of_seats,
          t.train_number,
          t.source,
          t.destination
        FROM bookings b
        JOIN trains t ON b.train_id = t.id
        WHERE b.user_id = ? 
      `;
  
      const [rows] = await db.query(query, [userId]);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching booking details:', err.message);
      res.status(500).json({ message: 'Error fetching booking details' });
    }
  };
  