import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from './getIPAddress';




const ProfilePage = () => {
  // State declarations
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState([]);
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState ("");
  const[postsData,setPostsData] = useState([]);

  // Fetching posts data from the JSON file
  useEffect(() => {
    const fetchData = async () => {
      // Initialize state variables based on postsData
      const initialComments = postsData.map(post => post.comments.map(comment => comment.comment));
      const initialShowComments = postsData.map(() => false);
  
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername);
  
        if (storedUsername) {
          const pointResponse = await fetch(`${baseURL}/api/users/getPoints/${storedUsername}`);
          const postResponse = await fetch(`${baseURL}/api/socialMedia/getUserPost/${storedUsername}`);
  
          if (pointResponse.ok && postResponse.ok) {
            const pointsData = await pointResponse.json();
            const postData = await postResponse.json();
  
            setPoints(pointsData);
            setPostsData(postData);
            setComments(initialComments);
            setShowComments(initialShowComments);
          } else {
            console.error("Failed to fetch points or posts data");
          }
        } else {
          console.error("No username found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  // Event handler
  const handleComment = (index) => {
    setShowComments((prev) => {
      const updatedShowComments = [...prev];
      updatedShowComments[index] = !updatedShowComments[index];
      return updatedShowComments;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        
        <View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.tripsCompleted}>Trek Points: {points} </Text>
        </View>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.posts}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {postsData.map((post, index) => (
            <View key={index} style={styles.postContainer}>
              <Image source={{ uri: post.imageReferenceId }} style={styles.postImage} />
              <Text style={styles.caption}>{post.caption}</Text>
              <View style={styles.interactionBar}>
                <TouchableOpacity onPress={() => handleComment(index)} style={styles.iconButton}>
                  <FontAwesome name="comment" size={24} color="#ccc" />
                </TouchableOpacity>
              </View>
              {showComments[index] && comments[index] && comments[index].map((comment, commentIndex) => (
                <View key={commentIndex} style={styles.comment}>
                  <Text style={styles.commentText}>{comment}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010C33',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tripsCompleted: {
    fontSize: 16,
    color: '#ccc',
  },
  posts: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  postContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1B1F32',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  comment: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  commentText: {
    fontSize: 14,
    color: '#fff',
  },
  iconButton: {
    padding: 5,
  },
  scroll: {
    backgroundColor: '#010C33',
  },
});

export default ProfilePage;

