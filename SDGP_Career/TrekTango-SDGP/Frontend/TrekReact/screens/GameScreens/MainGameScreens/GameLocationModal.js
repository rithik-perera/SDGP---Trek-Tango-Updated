import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Animated, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import MaterialCommunityIcons for icon use
import * as Location from 'expo-location';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator'; 
import Snackbar from '../../CustomComponents/Snackbar';
import { Camera } from 'expo-camera';
import CameraScreen  from './OpenCamera';
import { upload } from 'cloudinary-react-native'; // Import upload function from Cloudinary
import { Cloudinary } from '@cloudinary/url-gen'; // Import Cloudinary class
import { baseURL } from '../../getIPAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an instance of Cloudinary with your configuration parameters
const cld = new Cloudinary({
  cloud: {
    cloudName: "drxygqing",
  },
});

  const GameLocationModal = ({ isVisible, locations, onClose, clickedLocation, onLocationCapture }) => {
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [selectedFromLocation, setSelectedFromLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsClicked, setDirectionsClicked] = useState(false);
  const [showFullScreenCamera, setShowFullScreenCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [arrived, setArrived] = useState(false); 

  useEffect(() => {
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      setLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
    setSelectedFromLocation({ name: 'Current Location', place_id: 'current_location', latitude: location.coords.latitude, longitude: location.coords.longitude });
    setLoading(false);
  };

  const handleConfirm = () => {
    if (selectedFromLocation) {
      let startLocation;
      if (selectedFromLocation.name === 'Current Location') {
        startLocation = `${currentLocation.latitude},${currentLocation.longitude}`;
      } else {
        startLocation = `${selectedFromLocation.latitude},${selectedFromLocation.longitude}`;
      }
      const destinationLocationName = encodeURIComponent(clickedLocation.name);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLocation}&destination=${destinationLocationName}`;
      setDirectionsClicked(false);
      Linking.openURL(googleMapsUrl);
    }
  };

  const handleFromLocationSelect = (selected) => {
    setSelectedFromLocation(selected);
    setShowFromDropdown(false);
  };

  const handleSnapButtonPress = () => {
    setShowFullScreenCamera(true);
  };

  const handleDirectionsButtonPress = () => {
    setDirectionsClicked(prevState => !prevState); 
  };
  

  const handleArrived = () => {
    if (currentLocation) {
      const modalLocation = clickedLocation;
      const R = 6371e3;
      const φ1 = currentLocation.latitude * Math.PI / 180;
      const φ2 = modalLocation.latitude * Math.PI / 180;
      const Δφ = (modalLocation.latitude - currentLocation.latitude) * Math.PI / 180;
      const Δλ = (modalLocation.longitude - currentLocation.longitude) * Math.PI / 180;
  
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
  
      if (distance <= 50000) {
        setArrived(true);
      } else {
        setArrived(false);
        alert('Not there yet.');
      }
    }
  };

  const handleCapture = async (photoData, caption, isPublic) => {
    console.log('Photo captured:', photoData);
    console.log('Photo captured:', caption);
    console.log(isPublic);    
    try {
      // Upload the captured image to Cloudinary
      const options = {
        upload_preset: 'ro9px38k', // upload preset name
        unsigned: true,
      }
  
      upload(cld, {file: photoData.uri, options: options, callback: async (error, response) => {
        if (!error) {
          //successful upload
          console.log('Upload success:', response);
          const secureUrl = response.secure_url;
          console.log(secureUrl);
          console.log('This is the placeid:',clickedLocation.place_id );

          await AsyncStorage.getItem('sessionId').then((value) => {
            sessionId = value;
          });

          let userName, userID;

          await AsyncStorage.getItem('username').then((value) => {
            userName = value;
          });
      
          await AsyncStorage.getItem('userID').then((value) => {
            userID = value;
          });

          try{
            const response = await fetch(`${baseURL}/api/socialMedia/newPost`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: userName, 
                userID, 
                imageReferenceId: secureUrl , 
                uploadToMedia: isPublic, 
                caption
              }),
            });
            
            // Check if the request was successful
            if (response.status === 201) {
              console.log('Post created successfully');

          
          const response = await fetch(`${baseURL}/api/session/isCompleted`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              placeId : clickedLocation.place_id
            }),
          });
          if(response.status === 200){
            console.log("Database Updated")
          }else{
            console.error("Cannot update");
          }

                      
            } else {
              console.error('Failed to Create a Post');
              // Handle error appropriately
            }} catch (error){
              console.error(error);
            }

        } else {
          // upload error
          console.error('Upload error:', error);
        }
      }});
      onLocationCapture(clickedLocation.place_id);
    } catch (error) {
      console.error('Error uploading photo to Cloudinary:', error.message);
    }
};


  
  const filteredLocations = locations.filter(location => location.name !== clickedLocation.name);

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: new Animated.Value(1) }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{clickedLocation?.name}</Text>

          {loading ? (
            <CustomActivityIndicator />
          ) : (
            <>
            <TouchableOpacity style={styles.directionsButton} onPress={handleDirectionsButtonPress}>
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
              {directionsClicked && (
                <>
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>From: </Text>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowFromDropdown(!showFromDropdown)}>
                      <Text style={styles.dropdownText}>{selectedFromLocation ? selectedFromLocation.name : 'Select Location'}</Text>
                    </TouchableOpacity>
                  </View>

                  {showFromDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView>
                        <TouchableOpacity onPress={() => handleFromLocationSelect({ name: 'Current Location', place_id: 'current_location', latitude: currentLocation.latitude, longitude: currentLocation.longitude })}>
                          <Text style={styles.dropdownItem}>Current Location</Text>
                        </TouchableOpacity>
                        {filteredLocations.map(location => (
                          <TouchableOpacity key={location.place_id} onPress={() => handleFromLocationSelect(location)}>
                            <Text style={styles.dropdownItem}>{location.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <TouchableOpacity style={styles.directionsButton} onPress={handleConfirm}>
                    <Text style={styles.directionsButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </>
              )}

              {arrived && !directionsClicked && (
                <TouchableOpacity style={styles.cameraButton} onPress={handleSnapButtonPress}>
                  <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                  <Text style={styles.snapText}>Snap</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.arrivedButton} onPress={handleArrived}>
                <Text style={styles.arrivedText}>I've arrived</Text>
              </TouchableOpacity>
            </>
          )}
          </Animated.View>
      </View>
      {showFullScreenCamera && (
        <CameraScreen onCapture={handleCapture} onClose={() => setShowFullScreenCamera(false)} />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1E2A78',
    padding: 20,
    borderRadius:20,
    width: '80%',
    minHeight: 300,
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#fff',
    width: 60, 
  },
  dropdownButton: {
    backgroundColor: '#4A69BB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1, 
    alignItems: 'center',
  },
  dropdown: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownText: {
    color: '#fff',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#010C33', 
  },
  directionsButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A69BB',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  snapText: {
    color: '#fff',
    marginLeft: 5,
  },
  arrivedButton: {
    backgroundColor: 'rgba(1,1,1,0.3)',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
    position: 'relative',
    bottom: 20,
    marginLeft: 110,
    maxWidth:'auto',
    transform: [{ translateX: -50 }],
  },
  arrivedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default GameLocationModal;
