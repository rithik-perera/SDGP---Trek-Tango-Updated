import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import Snackbar from '../../CustomComponents/Snackbar';
import CustomDialog from '../../CustomComponents/CustomDialog';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator';
import axios from 'axios'; // Import axios for making HTTP requests

/**
 * Screen component for searching and selecting the initial location for the game.
 * Users can search for locations using the Google Places API and select a location on the map.
 * Provides options for navigation and displays feedback messages.
 * @param {object} navigation - The navigation object provided by React Navigation.
 * @returns {JSX.Element} SearchInitialLocationScreen component.
 */
const SearchInitialLocationScreen = ({ navigation }) => {
  const GOOGLE_API_KEY = 'AIzaSyCCHxfnoWl-DNhLhKcjhCTiHYNY917ltL8';
  const { width, height } = Dimensions.get("window");
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.02;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const INITIAL_POSITION = {
    latitude: 40.767110,
    longitude: -73.979704,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false); // Control visibility of predictions
  const [loading, setLoading] = useState(false); // State to control the loading indicator
  const mapRef = useRef(null);

  /**
   * Handles the user's press on the "Back" button.
   * Displays a confirmation dialog and navigates back to the previous screen if confirmed.
 */
  const handleBackPress = () => {
    setShowDialog(true);
  };

  /**
   * Handles the user's selection in the confirmation dialog.
   * Navigates back to the previous screen if the user confirms.
   * @param {string} option - The option selected by the user ('Yes' or 'No').
   */
  const handleDialogSelect = (option) => {
    setShowDialog(false);
    if (option === 'Yes') {
      navigation.navigate('LocationSelectionScreen');
    }
  };

  /**
   * Handles the user's press on the "Next" button.
   * Navigates to the next screen if a location has been selected,
   * otherwise, displays a snackbar indicating no place has been selected.
   */
  const handleNextPress = () => {
    if (selectedLocation) {
      const { latitude, longitude } = selectedLocation;
      navigation.navigate('RadiusSetScreen', { latitude, longitude });
    } else {
      setSnackbarMessage("No place has been selected."); // Set snackbar message
      setShowSnackbar(true); // Show the snackbar
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    }
  };

  /**
   * Handles the selection of a place from the predictions.
   * Fetches details of the selected place and updates the map accordingly.
   * @param {string} placeId - The unique ID of the selected place.
   */
  const handlePlaceSelect = (placeId) => {
    setLoading(true); // Show loading indicator when fetching place details 
    try {
      // Fetch details of the selected place using placeId
      axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`)
        .then(response => {
          setLoading(false); // Hide loading indicator after fetching place details
          const result = response.data.result;
          setSelectedLocation({
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          });
  
          // Update the searchText with the selected place description
          setSearchText(predictions.find(item => item.place_id === placeId).description);
  
          // pan and zoom to the selected location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              ...INITIAL_POSITION,
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            });
          }
  
          // Close the predictions dropdown
          setShowPredictions(false);
        })
        .catch(error => {
          setLoading(false); // Hide loading indicator if there's an error
          console.error('Error fetching place details:', error);
        });
    } catch (error) {
      setLoading(false); // Hide loading indicator if there's an error
      console.error('Error in handlePlaceSelect:', error);
    }
  };

  /**
   * Handles changes in the text input for location search.
   * Fetches location predictions based on the user's input
   * and updates the predictions dropdown accordingly.
   * @param {string} text - The text entered by the user in the search input field.
   */
  const handleSearchTextChange = (text) => {
    setSearchText(text);
    // Fetch location predictions based on user input
    axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&types=(cities)&key=${GOOGLE_API_KEY}`)
      .then(response => {
        setPredictions(response.data.predictions);
        setShowPredictions(true); // Show predictions when user starts typing
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // Request was canceled
          //console.log('Request canceled:', error.message);
          setSnackbarMessage("Error. Request canceled"); // Set snackbar message
          setShowSnackbar(true); // Show the snackbar
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1201);
        } else {
          // Request failed
          //console.error('Error fetching location predictions:', error);
          setSnackbarMessage("Error fetching location predictions."); // Set snackbar message
          setShowSnackbar(true); // Show the snackbar
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1201);
        }
      });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={"standard"}
        initialRegion={INITIAL_POSITION}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Selected Location" pinColor="blue" />
        )}
      </MapView>
      {loading && <CustomActivityIndicator />}
      <View style={styles.overlay}>
        <View style={[styles.ButtonsInputContainer, !showPredictions && { marginBottom: 0 }]}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleBackPress}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <CustomDialog
              visible={showDialog}
              title="Are you sure you want to go back?"
              message="Your unsaved changes will be lost."
              options={['Yes', 'No']}
              onSelect={handleDialogSelect}
            />
            <TouchableOpacity onPress={handleNextPress}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Search City"
            placeholderTextColor="white"
            value={searchText}
            onChangeText={handleSearchTextChange}
            clearButtonMode="while-editing"
          />
          {showPredictions && (
            <FlatList
              style={styles.listView}
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePlaceSelect(item.place_id, item.description)}>
                  <Text style={styles.predictionText}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        {showSnackbar && (
          <Snackbar
            visible={showSnackbar}
            message={snackbarMessage} 
            duration={1200}
            action={{ label: 'Dismiss', onPress: () => setShowSnackbar(false) }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: Constants.statusBarHeight + 10,
    marginBottom: 10,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  ButtonsInputContainer: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'rgba(1, 12, 51, 0.6)', 
    paddingBottom: 10,
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    width: '90%',
    borderRadius: 5,
    color: 'white', 
  },
  listViewContainer: {
    marginHorizontal: 10,
    marginTop: 5,
    width: '90%',
    maxHeight: 200, 
  },
  listView: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    marginHorizontal: 10,
    marginTop: 5,
    width: '90%',
    maxHeight: 200, 
  },
  predictionText: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    borderColor: 'white', 
    borderWidth: 1, 
    borderRadius: 20, 
    color: 'white',
    marginBottom: 5,
  },
});

export default SearchInitialLocationScreen;