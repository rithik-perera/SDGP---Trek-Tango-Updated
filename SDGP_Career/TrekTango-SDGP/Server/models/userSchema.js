const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userID: { type: String, required: true }, 
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true }, // Salt field added
    profilePic: { type: String, default: null },
    name: {
      firstName: { type: String },
      lastName: { type: String }
    },
    dob: { type: Date },
    verificationCode: { type: String, default: null, minlength: 6, maxlength: 6 },
    points: {type: Number, default: 0}
  });

module.exports  = mongoose.model('User' , userSchema);