const express = require('express');
const router = express.Router();
const  {newPost, initiateFeed, likePost, unLikePost, postComment , getUserPost} = require('../controllers/socialMediaController');

router.route('/newPost').post(newPost);
router.route('/getFeed').get(initiateFeed);
router.route('/likePost').put(likePost);
router.route('/unLikePost').put(unLikePost);
router.route('/addComment').put(postComment);
router.route('/getUserPost/:username').get(getUserPost);

module.exports = router;