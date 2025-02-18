//This imports the database connection from the dbconfig file
const db = require('../config/dbconfig');
//This imports the Train model
const Train = require('../models/Train');


//Logic for add train by admin only
// This function is exported and will handle adding trains to the database.
//It is asynchronous because database operations are involved 
exports.addTrain = async (req, res) => {
  // Extracts the train data sent in the request body (could be a single train or multiple trains).
    let trains = req.body; 
    
    //If the incoming data is a single object, it is converted into an array to handle both single and multiple train insertions.
    if (!Array.isArray(trains)) {
      trains = [trains];
    }
  
    // Check if the array has at least one train object
    if (trains.length === 0) {
      return res.status(400).json({ message: 'Please provide train data to add.' });
    }
  
    try {
      //An empty array trainIds is created to store the train IDs of inserted trains.
      const trainIds = []; 
  
      //A loop iterates over each train in the trains array.
      // Extracts important fields from each train object.
      for (const train of trains) {
        const { trainNumber, source, destination, totalSeats } = train;
  
        
        if (!trainNumber || !source || !destination || !totalSeats) {
          return res.status(400).json({ message: 'Train number, source, destination, and total seats are required for each train.' });
        }
  
        // Available seats are initialized to total seats when a new train is added
        const availableSeats = totalSeats;
  
        // Insert each train into the database
        
        const [result] = await db.query(
          'INSERT INTO trains (train_number, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)',
          [trainNumber, source, destination, totalSeats, availableSeats]
        );
        //above line could have been written like this using Train.js of models
        // const trainId = await Train.addTrain(trainNumber, source, destination, totalSeats);
        //RESULT WILL CONTAIN SOMETHING LIKE THIS:-
        /*
              {
                "fieldCount": 0,
                "affectedRows": 1,
                "insertId": 25,
                "serverStatus": 2,
                "warningCount": 0,
                "message": "",
                "protocol41": true,
                "changedRows": 0
              }
        */
       //pushing values into the trainIds
        //result.insertId: Returns the ID of the newly inserted train.
        trainIds.push({ trainNumber, trainId: result.insertId });
        //IF Train.js of models was used then simply we would have done this:-
        // trainIds.push({ trainNumber, trainId });
      }
  
    
      res.json({ message: 'Trains added successfully', trainIds });
    } catch (err) {
      res.status(500).json({ message: 'Error adding trains', error: err.message });
    }
  };
  




  //Logic of adding seats of train by admin only
  exports.updateTrainSeats = async (req, res) => {
    const { trainId } = req.params;
    const { totalSeats, availableSeats } = req.body; 
  
    if (totalSeats === undefined || availableSeats === undefined) {
      return res.status(400).json({ message: 'Total seats and available seats are required' });
    }

    if (availableSeats > totalSeats) {
        return res.status(400).json({ message: 'Available seats cannot be greater than total seats' });
      }
  
    try {
      
      const updated = await Train.updateSeats(trainId, totalSeats, availableSeats);
  
      if (updated) {
        res.status(200).json({ message: 'Seats updated successfully' });
      } else {
        res.status(404).json({ message: 'Train not found or seats not updated' });
      }
    } catch (err) {
      console.error('Error updating train seats:', err.message);
      res.status(500).json({ message: 'Error updating train seats', error: err.message });
    }
  };