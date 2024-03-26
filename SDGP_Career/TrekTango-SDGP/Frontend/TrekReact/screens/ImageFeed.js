import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { baseURL } from './getIPAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ImageFeed = () => {
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState([]);
  const [commentSectionVisible, setCommentSectionVisible] = useState([]);
  const [postsData, setPostsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userID, setUserID] = useState("");

  useEffect(() => {
    fetchData(); // Fetch data from backend on component mount
  }, []);
  const fetchData = async () => {
    try {
      await AsyncStorage.getItem('username').then((value) => {
        setUserName(value);
      });
  
      // Retrieve userID
      const userID = await AsyncStorage.getItem('userID');
  
      // Now that userID is available, proceed with setting liked state
      await AsyncStorage.getItem('userID').then((value) => {
        setUserID(value);
  
        // Fetch postsData after userID is retrieved
        fetch(`${baseURL}/api/socialMedia/getFeed`)
          .then(response => response.json())
          .then(postsData => {
            // Initialize state based on fetched data
            const initialLikesState = postsData.map(post => post.likes.length);
            setLikes(initialLikesState);
            
            // Now, map over postsData to set liked state
            const initialLikedState = postsData.map(post => {
              const isLikedByUser = post.likes.includes(userID); // Check if liked by the specific user
              return isLikedByUser;
            });
            setLiked(initialLikedState);
            
            const initialCommentsState = postsData.map(post => post.comments.map(comment => comment.comment));
            setComments(initialCommentsState);
            setNewCommentText(postsData.map(() => '')); // Empty comment text for each post
            setCommentSectionVisible(postsData.map(() => false));  // Comment sections initially hidden
  
            // Update postsData to include username and caption
            const updatedPostsData = postsData.map(post => ({
              ...post,
              username: post.username, // Assuming username field is present in postsData
              caption: post.caption // Assuming caption field is present in postsData
            }));
            setPostsData(updatedPostsData);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  {postsData.map((post, index) => (
    <TouchableOpacity key={index}>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
        <Image
          source={{ uri: post.imageReferenceId }}
          style={styles.image}
        />
        <View style={styles.interactionBar}>
          <TouchableOpacity onPress={() => handleLike(index)} style={styles.iconButton}>
            <FontAwesome name={liked[index] ? "heart" : "heart-o"} size={24} color={liked[index] ? "#ff9999" : "#ccc"} />
          </TouchableOpacity>
          <Text style={styles.likeText}>{likes[index]} Likes</Text>
          <TouchableOpacity onPress={() => toggleCommentSection(index)} style={styles.iconButton}>
            <FontAwesome name="comment" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
        {commentSectionVisible[index] && (
          <View style={styles.commentSection}>
            {post.comments.map((comment, commentIndex) => (
              <View key={commentIndex} style={styles.comment}>
                <Text style={styles.commentText}>
                  <Text style={styles.commentUsername}>{comment.username}: </Text>
                  {comment.comment}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.commentInputContainer}>
          <TextInput
            placeholder="Add a comment..."
            placeholderTextColor="#ccc"
            style={styles.commentInput}
            value={newCommentText[index]}
            onChangeText={(text) => handleCommentChange(index, text)}
          />
          <TouchableOpacity onPress={() => handlePostComment(index)} style={styles.postCommentButton}>
            <Text style={styles.postCommentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ))}

  const onRefresh = () => {
    setRefreshing(true); // Set refreshing state to true
    fetchData(); // Fetch data again
    setRefreshing(false); // Set refreshing state back to false after data is fetched
  };

  const handleLike = async(index) => {
    const newLikes = [...likes];
    const newLiked = [...liked];
    if (!newLiked[index]) {
      newLikes[index]++;
      newLiked[index] = true;
      const postId = postsData[index].postId; // Access postId from postsData

      console.log('User liked post:', postId, userID);

      const response = await fetch(`${baseURL}/api/socialMedia/likePost`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userID, 
          postId
        }),
      });
      
      // Check if the request was successful
      if (response.status === 200) {
        console.log('User Liked successfully');
                
      } else {
        console.error('Failed to Like');
        // Handle error appropriately
      }
    } else {
      newLikes[index]--;
      newLiked[index] = false;
      const postId = postsData[index].postId;

      const response = await fetch(`${baseURL}/api/socialMedia/unLikePost`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userID,
          postId
        }),
      });
      
      // Check if the request was successful
      if (response.status === 200) {
        console.log('User UnLiked successfully');
                
      } else {
        console.error('Failed to DisLike');
        // Handle error appropriately
      }
    }
    setLikes(newLikes);
    setLiked(newLiked);
  };

  const handleCommentChange = (index, text) => {
    const newCommentTexts = [...newCommentText];
    newCommentTexts[index] = text;
    setNewCommentText(newCommentTexts);
  };

  const handlePostComment = async (index) => {
    if (newCommentText[index].trim() !== '') {
      try {
        const postId = postsData[index].postId;
        const response = await fetch(`${baseURL}/api/socialMedia/addComment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userName,
            comment: newCommentText[index],
            postId
          }),
        });
  
        if (response.status === 200) {
          console.log('User commented successfully');
          // Update local state with the new comment
          const updatedPostsData = [...postsData];
          updatedPostsData[index].comments.push({
            username: userName,
            comment: newCommentText[index]
          });
          setPostsData(updatedPostsData);
          // Clear the new comment text
          const newCommentTexts = [...newCommentText];
          newCommentTexts[index] = '';
          setNewCommentText(newCommentTexts);
        } else {
          console.error('Failed to comment');
          // Handle error appropriately
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const toggleCommentSection = (index) => {
    const newCommentSectionVisible = [...commentSectionVisible];
    newCommentSectionVisible[index] = !newCommentSectionVisible[index];
    setCommentSectionVisible(newCommentSectionVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trek Tango</Text>
      <ScrollView
        contentContainerStyle={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {postsData.map((post, index) => (
          <TouchableOpacity key={index}>
            <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.caption}>{post.caption}</Text>
            </View>
              <Image
                source={{ uri: post.imageReferenceId }}
                style={styles.image}
              />
              <View style={styles.interactionBar}>
                <TouchableOpacity onPress={() => handleLike(index)} style={styles.iconButton}>
                  <FontAwesome name={liked[index] ? "heart" : "heart-o"} size={24} color={liked[index] ? "#ff9999" : "#ccc"} />
                </TouchableOpacity>
                <Text style={styles.likeText}>{likes[index]} Likes</Text>
                <TouchableOpacity onPress={() => toggleCommentSection(index)} style={styles.iconButton}>
                  <FontAwesome name="comment" size={24} color="#ccc" />
                </TouchableOpacity>
              </View>
              {commentSectionVisible[index] && (
                <View style={styles.commentSection}>
                  {post.comments.map((comment, commentIndex) => (
                    <View key={commentIndex} style={styles.comment}>
                      <Text style={styles.commentText}>
                        <Text style={styles.commentUsername}>{comment.username}: </Text>
                        {comment.comment}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.commentInputContainer}>
                <TextInput
                  placeholder="Add a comment..."
                  placeholderTextColor="#ccc"
                  style={styles.commentInput}
                  value={newCommentText[index]}
                  onChangeText={(text) => handleCommentChange(index, text)}
                />
                <TouchableOpacity onPress={() => handlePostComment(index)} style={styles.postCommentButton}>
                  <Text style={styles.postCommentButtonText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010C33',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  feed: {
    paddingVertical: 20,
  },
  postContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1B1F32',
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  likeText: {
    fontSize: 16,
    color: '#fff',
  },
  commentSection: {
    paddingHorizontal: 10,
  },
  comment: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  commentText: {
    fontSize: 14,
    color: '#fff',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: -5,
    marginBottom: 10, 
  },
  commentInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#010C33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C7A95',
    marginRight: 10,
  },
  postCommentButton: {
    backgroundColor: '#0047AB',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  postCommentButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  username: {
    fontSize: 16,
    color: 'white', 
    fontWeight: 'bold', 
    marginBottom: 5, 
  },
  caption: {
    fontSize: 14,
    color: 'white', 
    marginBottom: 10, 
  },
});

export default ImageFeed;
