const Session = require('../models/sessionSchema');
const { v4: uuidv4 } = require('uuid');

const createSession = async (req, res) => {
    try {
      
      const { userId, username, listOfPlaces, detected, confirmedStarterLocation } = req.body;
      const sessionId = uuidv4()
  
      
      const session = new Session({
        sessionId,
        userId,
        username,
        listOfPlaces,
        detected,
        confirmedStarterLocation
      });
  
      
      await session.save();
  
     
      res.status(201).json(sessionId);
    } catch (error) {
      
      console.error(error);
      res.status(500).json({ error:error });
    }
  };

  const latestIncompleteSession = async (req, res) => {
    try {
      
      const { username } = req.params;
  
    
      const session = await Session.findOne({ username, sessionComplete: false }).sort({ createdAt: -1 }).limit(1);
  
      if (!session) {
        return res.status(404).json({ message: 'No incomplete sessions found for the user' });
      }
  
     
      res.status(200).json(session);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve incomplete sessions', details: error.message });
    }
  };

  const isCompleted = async (req, res) => {
    try {
        const { sessionId, placeId } = req.body;

        

       
        let session = await Session.findOne({ sessionId });
      

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

      
        const placeIndex = session.listOfPlaces.findIndex(place => place.place_id === placeId);

        if (placeIndex === -1) {
            return res.status(404).json({ message: "Place not found in session" });
        }

       
        session.listOfPlaces[placeIndex].completed = true;


        session = await session.save();
        


        await Session.updateOne({ sessionId }, { $set: { listOfPlaces: [] } });

        await Session.updateOne({ sessionId }, { $push: { listOfPlaces: { $each: session.listOfPlaces } } });

        res.status(200).json({ message: "Updated" });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const sessionComplete = async (req, res) => {
  try {
      const { sessionId } = req.body;
console.log(sessionId, "hi");
      
      const session = await Session.findOne({ sessionId });

      
      session.sessionComplete = true;
      
     
      await session.save();

      res.status(200).json({ message: "Session marked as complete" });
  } catch (error) {
      console.log("Error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};
      

  module.exports = {createSession, latestIncompleteSession, isCompleted, sessionComplete};
