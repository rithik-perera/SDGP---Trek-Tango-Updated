import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Snackbar from '../../CustomComponents/Snackbar';
import CustomDialog from '../../CustomComponents/CustomDialog';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator';
import  {baseURL}  from '../../getIPAddress';

/**
 * Screen component for selecting the starting location for the adventure game.
 * @returns {JSX.Element} - JSX element representing the SelectStartLocationScreen component.
 */
const SelectStartLocationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedPlaces } = route.params;
  const [showDestinations, setShowDestinations] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handles the selection of destinations from the list.
   */
  const handleSelectFromList = () => {
    setShowDestinations(true);
  };

  /**
   * Handles the detection of the current location.
   */
  const handleDetectCurrentLocation = async () => {
    setLoading(true); // Show loading indicator
    let { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      // req if permission has not been granted previously
      
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      status = newStatus;
    }

    if (status !== 'granted') {
      // if permission is still not granted
      setLoading(false);
      Alert.alert('Permission Denied', 'Please grant location permission to detect your current location.');
      return;
    }
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;     
      setSnackbarMessage('Location detected!');
      setShowSnackbar(true);
      const confirmedStarterLocation = {
        latitude,
        longitude, 
      };

      const response = await fetch(`${baseURL}/api/destinationOrder/orderCurrLoc`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originLat: latitude,
          originLng: longitude,
          destinationList: selectedPlaces}),
      });
      if (!response.ok) {
        console.log(`HTTP error! Status: ${response.status}`);
      }
      orderedPlaces = await response.json();

      setTimeout(() => {
        setLoading(false); // Show loading indicator
        setShowSnackbar(false);
        navigation.navigate('StartGameScreen', {selectedPlaces: orderedPlaces, detected: true, confirmedStarterLocation});
      }, 601); 

    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again later.');
    }
  };

  /**
   * Handles the navigation back to the previous screen.
   * @param {string} option - The selected option ('Yes' or 'No') from the back dialog.
   */
  const handleBack = (option) => {
    if (option === 'Yes') {
      navigation.goBack();
    }
    setShowBackDialog(false);
  };

  /**
   * Handles the selection of the next destination.
   */
  const handleNext = async() => {
    if (selectedDestination) {
      setLoading(true); // Show loading indicator
      let updatedSelectedPlaces = [...selectedPlaces]; // copy of selectedPlaces array
      
      // find index of selectedDestination in selectedPlaces
      const selectedIndex = updatedSelectedPlaces.findIndex(place => place.place_id === selectedDestination.place_id);
      
      // remove selectedDestination from its current index
      updatedSelectedPlaces.splice(selectedIndex, 1);
      
      // add selectedDestination to the beginning of the array
      updatedSelectedPlaces.unshift(selectedDestination);
      
      const response = await fetch(`${baseURL}/api/destinationOrder/orderListPlace`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinationList: updatedSelectedPlaces}),
      });
      if (!response.ok) {
        console.log(`HTTP error! Status: ${response.status}`);
    }
      updatedSelectedPlaces = await response.json();
      setLoading(false); // Show loading indicator

  
      // Navigate to StartGameScreen with updatedSelectedPlaces
      navigation.navigate('StartGameScreen', {
        selectedPlaces: updatedSelectedPlaces,
        detected: false,
        confirmedStarterLocation: {
          latitude: selectedDestination.latitude,
          longitude: selectedDestination.longitude,
        }
      });
    } else {
      // If no destination is selected, show a message
      setShowSnackbar(true);
      setSnackbarMessage('Please select a destination.');
      setTimeout(() => {
        setShowSnackbar(false);
      }, 2000);
    }
  };

  /**
   * Handles the selection of a destination.
   * @param {object} destination - The selected destination object.
   */
  const handleSelectDestination = (destination) => {
    setSelectedDestination(destination);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => setShowBackDialog(true)}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      {!showDestinations && (
        <>
          <Text style={styles.title}>Select Start Point</Text>
          <TouchableOpacity style={styles.button} onPress={handleSelectFromList}>
            <Text style={styles.buttonText}>Select from Destinations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleDetectCurrentLocation}>
            <Text style={styles.buttonText}>Detect Current Location</Text>
          </TouchableOpacity>
        </>
      )}

      {showDestinations && (
        <>
          {selectedPlaces.map(destination => (
            <TouchableOpacity
              key={destination.place_id}
              style={[
                styles.destinationButton,
                selectedDestination === destination && styles.selectedDestinationButton
              ]}
              onPress={() => handleSelectDestination(destination)}
            >
              <Text style={styles.destinationButtonText}>{destination.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {showSnackbar && (
        <Snackbar
          visible={showSnackbar}
          message={snackbarMessage}
          duration={2000}
          action={{ label: 'Dismiss', onPress: () => setShowSnackbar(false) }}
        />
      )}
      {loading && <CustomActivityIndicator />}
      <CustomDialog
        visible={showBackDialog}
        title="Confirmation"
        message="Do you want to go back?"
        options={['Yes', 'No']}
        onSelect={handleBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#010C33',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#FFF'
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  destinationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedDestinationButton: {
    backgroundColor: '#ff6347', // Change background color when selected
  },
  destinationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    // backgroundColor: '#007bff',
    // paddingVertical: 0,
    // paddingHorizontal: 0,
    // borderRadius: 10,
    // marginBottom: 20,
    alignItems: 'center',
    position: 'absolute',
    top: 70,
    left: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#007b00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default SelectStartLocationScreen;
