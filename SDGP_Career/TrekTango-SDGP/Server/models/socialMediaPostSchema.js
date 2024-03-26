const mongoose = require('mongoose');


const socialMediaPostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  userID: { type: String, required: true },
  postId: { type: String, required: true, unique: true },
  imageReferenceId: { type: String },
  uploadToMedia: { type: Boolean, default: false },
  caption: { type: String },
  comments: {
      type: [{
          commentID: { type: String, unique: true },
          username: { type: String },
          comment: { type: String }
      }],
      default: [] // Default value set to an empty array
  },
  likes: [{ type: String }],
  uploadedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SocialMedia', socialMediaPostSchema);  