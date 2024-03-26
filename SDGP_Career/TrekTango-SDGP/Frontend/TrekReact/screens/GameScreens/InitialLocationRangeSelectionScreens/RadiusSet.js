import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import Constants from 'expo-constants';
import CustomDialog from '../../CustomComponents/CustomDialog';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator';

/**
 * Screen component for setting the radius around the selected location.
 * Users can adjust the radius by selecting a value from the dropdown.
 * Provides options for navigation and displays feedback messages.
 * @param {object} route - The route object containing parameters passed from the previous screen.
 * @param {object} navigation - The navigation object provided by React Navigation.
 * @returns {JSX.Element} RadiusSetScreen component.
 */
const RadiusSetScreen = ({ route, navigation }) => {
  const { longitude, latitude } = route.params;
  const mapRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false); // Visibility of confirmation dialog
  const [radius, setRadius] = useState(1000); // Radius value set by user
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Visibility of radius selection dropdown
  const radiusValues = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]; // Available radius values
  const [selectedRadiusValue, setSelectedRadiusValue] = useState(radiusValues[0]); // Currently selected radius
  const [loading, setLoading] = useState(false); // Visibility of loading indicator
  const [mapLoaded, setMapLoaded] = useState(false); // Whether the map has finished loading

  useEffect(() => {
    setLoading(true); 
    if (mapRef.current && mapLoaded) {
      setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        setLoading(false); 
      }, 1000);
    }
  }, [mapLoaded]);

  /**
   * Handles the map ready event.
   * Sets the mapLoaded state to true once the map is ready.
   */
  const handleMapReady = () => {
    setMapLoaded(true);
  };

  /**
   * Handles the user's press on the "Back" button.
   * Displays a confirmation dialog and navigates back to the previous screen if confirmed.
   */
  const handleBackPress = () => {
    try {
      setShowDialog(true);
    } catch (error) {
      //console.error('Error handling back press:', error);
    }
  };

  /**
   * Handles the user's selection in the confirmation dialog.
   * Navigates back to the previous screen if the user confirms.
   * @param {string} option - The option selected by the user ('Yes' or 'No').
   */
  const handleDialogSelect = (option) => {
    setShowDialog(false);
    if (option === 'Yes') {
      navigation.goBack();
    }
  };

  /**
   * Handles the user's press on the "Next" button.
   * Navigates to the next screen if a radius value has been selected.
   */
  const handleNextPress = () => {
    try {
      navigation.navigate('NearbyDestinations', { longitude, latitude, radius });
    } catch (error) {
      //console.error('Error navigating to nearby destinations:', error);
    }
  };

  /**
   * Toggles the visibility of the radius selection dropdown.
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Handles the selection of a radius value from the dropdown.
   * Updates the selected radius value and adjusts the map's region accordingly.
   * @param {number} value - The selected radius value.
   */
  const onRadiusChange = (value) => {
    try{    
      setSelectedRadiusValue(value);
      setRadius(value);
      toggleDropdown();
      
      // new latitudeDelta and longitudeDelta based on the radius
      const delta = value / 112300; // 1 degree = 111.3 kilometers
      const latitudeDelta = value / 22000; // Adjust the division factor as needed for zoom level
      const longitudeDelta = delta;
    
      // Update the map's region to fit the circle
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        });
      }
    }catch{error}
      //console.error('Error handling radius change:', error);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onMapReady={handleMapReady}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Location selected"
          pinColor="blue"
        />
        <Circle
          center={{ latitude, longitude }}
          radius={radius}
          fillColor="rgba(106, 120, 220, 0.3)"
          strokeColor="rgba(0, 0, 255, 0.8)"
          strokeWidth={2}
        />
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.containerTop}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleBackPress} style={styles.button}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDropdown} style={styles.selectedRadiusContainer}>
              <Text style={styles.selectedRadiusText}>{selectedRadiusValue} m</Text>
              {isDropdownOpen && (
                <ScrollView style={styles.dropdownContainer}>
                  {radiusValues.map(value => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => onRadiusChange(value)}
                      style={styles.dropdownItem}
                    >
                      <Text>{value} m</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextPress} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <CustomDialog
            visible={showDialog}
            title="Are you sure you want to go back?"
            message="Your unsaved changes will be lost."
            options={['Yes', 'No']}
            onSelect={handleDialogSelect}
          />
        </View>
      </View>
      {loading && <CustomActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerTop: {
    width: '100%',
    position: 'absolute',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
    backgroundColor: 'rgba(1, 12, 51, 0.6)', // Transparent background for the overlay
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  radiusContainer: {
    width: '50%',
    alignItems: 'center',
  },
  selectedRadiusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    position: 'relative', 
  },
  selectedRadiusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '165%', 
    left: 0,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 150,
    minWidth: 90,
    zIndex: 1,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RadiusSetScreen;
