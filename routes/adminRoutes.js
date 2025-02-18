// Imports Express and initializes a router (router), which is used to define API routes separately.
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

//const authMiddleware = require('../middleware/authMiddleware');


//Uses apiKeyMiddleware.verifyApiKey to validate the API key before calling adminController.addTrain.
router.post('/addTrain', apiKeyMiddleware.verifyApiKey, adminController.addTrain);
//PUT /update-seats/:trainId: Updates seat availability for a specific train.
//Uses path parameter (:trainId) to identify the train whose seats should be updated.
router.put('/update-seats/:trainId', apiKeyMiddleware.verifyApiKey, adminController.updateTrainSeats);

module.exports = router;
