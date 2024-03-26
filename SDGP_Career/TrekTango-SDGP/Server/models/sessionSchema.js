const mongoose = require('mongoose');


const sessionSchema = new mongoose.Schema({
  sessionId: {type: String, required: true, unique: true },
  username: { type: String, required: true },
  userId: { type: String, required: true },
  listOfPlaces: [{ type: Object, required: true }],
  detected: {type: Boolean, required: true},
  confirmedStarterLocation:{ type: Object, required: true },
  points: {type: Number, default: 0},   
  sessionComplete: { type: Boolean, default: false },
 createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', sessionSchema);