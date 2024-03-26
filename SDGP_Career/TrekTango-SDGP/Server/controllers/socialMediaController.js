const SocialMediaPost = require('../models/socialMediaPostSchema');
const { v4: uuidv4 } = require('uuid');

const newPost = async (req, res) =>{
   
    const {username, userID, imageReferenceId, uploadToMedia, caption} = req.body;
    try{
    const newPost = new SocialMediaPost({
        username,
        userID,
        postId: uuidv4(),
        imageReferenceId,
        uploadToMedia,
        caption,
        comments: [{commentID: uuidv4()}],
        likes: [],
      });

    await newPost.save();
    console.log('New Post Created');
    res.status(201).json(newPost);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
}

const initiateFeed = async (req, res) => {
  try{
    const post = await SocialMediaPost.find({uploadToMedia: true});

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
     return array;
    }
    const shuffledFeed = await shuffleArray(post);      
    res.status(200).json(shuffledFeed);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Occurred in Fetching Data" });
  }
}

const likePost = async (req, res) => {
  const { userId, postId } = req.body;
  
  try {
    
    const post = await SocialMediaPost.findOne({postId});

    post.likes.push(userId);
    await post.save();
    
    res.status(200).json({ message: "Liked the Post" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Occurred"});
  }
}

const unLikePost = async (req, res) => {
  const { userId, postId } = req.body;
  
  try {
    
    const post = await SocialMediaPost.findOne({postId});

    const index = post.likes.indexOf(userId);
    post.likes.splice(index, 1);
    await post.save();

    
    res.status(200).json({ message: "Unliked the Post" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Occurred"});
  }
}

const postComment = async(req, res) => {
  const {username, comment, postId} = req.body;
  try {
    
    const post = await SocialMediaPost.findOne({postId});

    const commentBlock = { commentID: uuidv4(), username: username, comment: comment};
    post.comments.push(commentBlock);

    await post.save();

    
    res.status(200).json({ message: "Commented on the post" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Occurred"});
  }
  
}

const getUserPost = async (req, res) => {
    const { username } = req.params;
    try{
      const post = await SocialMediaPost.find({username});
  
    res.status(200).json(post);
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error Occurred in Fetching Data" });
    }
  }
  


 

  module.exports = {newPost, initiateFeed, likePost, unLikePost, postComment , getUserPost};
