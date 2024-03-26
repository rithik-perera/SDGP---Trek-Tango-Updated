import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Image} from 'react-native';
import PlaceDetailsModal from './PlaceDetailsModal';
import ConfirmedDestinationListModal from './ConfirmedDestinationListModal'; 
import {  useRoute } from '@react-navigation/native';
import CustomDialog from '../../CustomComponents/CustomDialog';
import Snackbar from '../../CustomComponents/Snackbar';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator';

const GOOGLE_PLACES_API_KEY = "AIzaSyCCHxfnoWl-DNhLhKcjhCTiHYNY917ltL8";
// Define categories for filtering destinations
const categories = [
  { label: "All Categories", value: "all_categories" },
  { label: "Tourist Attractions", value: "tourist_attraction" },
  { label: "Restaurant & Cafe", value: "restaurant|cafe" },
  { label: "Shopping Malls/Stores", value: "shopping_mall|store" },
  { label: "Outdoor Activities", value: "park|amusement_park|bowling_alley|stadium|zoo|parking|night_club" },
  { label: "Cultural/Religious Sites", value: "church|hindu_temple|mosque|synagogue" },
  { label: "Entertainment", value: "movie_theater|night_club|casino" },
  { label: "Nature and Wildlife", value: "park|zoo|aquarium" },
  { label: "Museums", value: "museum" }
];

/**
 * Component for displaying nearby destinations and managing selected places.
 * @param {object} navigation - The navigation object used for navigating between screens.
 * @param {number} latitude - The latitude coordinate of the user's location.
 * @param {number} longitude - The longitude coordinate of the user's location.
 * @param {number} radius - The radius in meters for fetching nearby destinations.
 * @returns {JSX.Element} - JSX element representing the NearbyDestinationsScreen component.
 */
const NearbyDestinationsScreen = ({navigation}) => {

  const [destinations, setDestinations] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPlaceDetailsModalVisible, setPlaceDetailsModalVisible] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isConfirmedDestinationListModalVisible, setIsConfirmedDestinationListModalVisible] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [showBackDialog, setShowBackDialog] = useState(false);

  const route = useRoute();
  const { longitude, latitude, radius } = route.params;

  useEffect(() => {
    setDestinations([]);
    setNextPageToken(null);
    fetchNearbyDestinations();
  }, [selectedType]);

  /**
   * Fetches nearby destinations based on the selected category.
   * @param {string} pageToken - Token for pagination.
   */
  const fetchNearbyDestinations = async (pageToken = '') => {
    // Construct the URL for Google Places API
    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
    
      if (selectedType) {
        url += `&type=${selectedType}`;
      }
    
      if (pageToken) {
        url += `&pagetoken=${pageToken}`;
      }
  
    // Fetch data from the URL
      setShowLoadingIndicator(true);
      const response = await fetch(url);
      const data = await response.json();
  
      setNextPageToken(data.next_page_token);
  
      // Create promises to fetch details for each place concurrently
      const placeDetailsPromises = data.results.map(async (place) => {
        const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_PLACES_API_KEY}`;
        const placeDetailsResponse = await fetch(placeDetailsUrl);
        const placeDetailsData = await placeDetailsResponse.json();
        // Combine place ID and details
        return { ...place, ...placeDetailsData.result };
      });
  
      // Wait for all promises to resolve concurrently
      const detailedPlaces = await Promise.all(placeDetailsPromises);
      setDestinations(detailedPlaces);
  
      // Hide loading indicator after data is fetched
      setTimeout(() => {
        setShowLoadingIndicator(false);
      }, 300);
    } catch (error) {
      //console.error('Error fetching nearby destinations: ', error);
      setShowLoadingIndicator(false);
      setSnackbarMessage('Error fetching nearby destinations');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    }
  };

  /**
   * Loads more data when the user reaches the end of the list.
   */
  const loadMoreData = () => {
    if (nextPageToken) {
      fetchNearbyDestinations(nextPageToken);
    }
  };

  /**
   * Opens a modal to view details of a place.
   * @param {object} place - The place object containing details.
   */
  const openPlaceDetailsModal = (place) => {
    try{
      setSelectedPlace(place);
      setPlaceDetailsModalVisible(true);
    } catch (error) {
      //console.error('Error opening place details modal: ', error);
      setSnackbarMessage('Failed to open place details. Please try again later.');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 5000); // Adjust duration as needed
    }
  };

  /**
   * Adds a place to the list of selected destinations.
   * @param {object} placeData - The place data to be added.
   */
  const handleAddToList = (placeData) => {
    // Check if place is already added
    const isPlaceAlreadyAdded = selectedPlaces.some(item => item.place_id === placeData.place_id);

    if (isPlaceAlreadyAdded) {
      setPlaceDetailsModalVisible(false);
      setSnackbarMessage('Place is already in the list!');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    } else if (selectedPlaces.length >= 8) {
      setPlaceDetailsModalVisible(false);
      setSnackbarMessage('Maximum destination limit reached!');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    } else {
      setSelectedPlaces(prevPlaces => [...prevPlaces, placeData]);
      setPlaceDetailsModalVisible(false);
      setSnackbarMessage('Destination added to list successfully!');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    }
  };

  /**
   * Checks if the minimum selected places count is met before navigating to the next screen.
   */
  const checkSelectedPlacesCount = () => {
    if (selectedPlaces.length > 2) {
      // Navigate to next screen
      navigation.navigate('SelectStartLocationScreen', { selectedPlaces });
    } else {
      // Show snackbar message if minimum count is not met
      setSnackbarMessage('You need to select at least three destinations.');
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1201);
    }
  };

  /**
   * Toggles the visibility of the confirmed destination list modal.
   */
  const toggleConfirmedDestinationListModal = () => {
    setIsConfirmedDestinationListModalVisible(!isConfirmedDestinationListModalVisible);
  };

  /**
   * Removes a destination from the selected list.
   * @param {string} placeId - The ID of the place to be removed.
   */
  const handleRemoveDestination = (placeId) => {
    setSelectedPlaces(prevSelectedPlaces => prevSelectedPlaces.filter(item => item.place_id !== placeId));
  };

  /**
   * Handles the response from the back dialog.
   * @param {string} option - The selected option ('Yes' or 'No').
   */
  const handleBackDialogResponse = (option) => {
    if (option === 'Yes') {
      navigation.goBack();
    }
    setShowBackDialog(false);
  };


  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.button} onPress={() => setShowBackDialog(true)}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setExpanded(!expanded)}>
            <Text style={styles.buttonText}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleConfirmedDestinationListModal}>
            <Text style={styles.buttonText}>Edit List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={checkSelectedPlacesCount}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>


        {expanded && (
          <View style={styles.categories}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedType(category.value);
                  setExpanded(false);
                }}
                style={styles.categoryItem}
              >
                <Text style={styles.categoryText}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {destinations.length > 0 ? (
          <FlatList
            data={destinations}
            renderItem={({ item }) => {
              const firstPhoto = item.photos ? item.photos[0] : null;
              const photoUrl = firstPhoto ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhoto.photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null;

              return (
                <TouchableOpacity onPress={() => openPlaceDetailsModal(item)}>
                  <View style={styles.listItemContainer}>
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.listItemImage}
                      />
                    ) : (
                      <Image
                        source={require('../../CustomComponents/ImgUnavailable.png')}
                        style={styles.listItemImage}
                      />
                    )}
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{item.name}</Text>
                      <Text style={styles.listItemDescription}>Type: {item.types.join(', ')}</Text>
                      <Text style={styles.listItemDescription}>Rating: {item.rating || 'N/A'}</Text>
                      <Text style={styles.listItemDescription}>Open Now: {item.opening_hours && item.opening_hours.open_now ? 'Yes' : 'No'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.place_id}
            onEndReachedThreshold={0.9} // call loadMoreData when close to the end
            onEndReached={loadMoreData}
          />
        ) : (
          <Text style={styles.noPlacesText}>No places available in this category</Text>
        )}
        <CustomDialog
          visible={showBackDialog}
          title="Confirmation"
          message="Do you want to go back?"
          options={['Yes', 'No']}
          onSelect={handleBackDialogResponse}
        />

        {showLoadingIndicator && <CustomActivityIndicator />}

 
        {showSnackbar && (
          <Snackbar
            visible={showSnackbar}
            message={snackbarMessage}
            duration={1200}
            action={{ label: 'Dismiss', onPress: () => setShowSnackbar(false) }}
          />
        )}

        {isPlaceDetailsModalVisible && (
          <PlaceDetailsModal
            visible={isPlaceDetailsModalVisible}
            place={selectedPlace}
            onClose={() => setPlaceDetailsModalVisible(false)}
            onAddToList={handleAddToList}
            selectedPlaces={selectedPlaces}
          />
        )}

        {isConfirmedDestinationListModalVisible && (
          <ConfirmedDestinationListModal
            visible={isConfirmedDestinationListModalVisible}
            onClose={toggleConfirmedDestinationListModal}
            selectedPlaces={selectedPlaces}
            onRemoveDestination={handleRemoveDestination}
          />
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010C33',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: 80,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categories: {
    marginBottom: 20,
  },
  categoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 5,
  },
  categoryText: {
    color: '#FFF',
    textAlign:'center',
  },
  listItemImage: {
    width: 110,
    height: 150,
    borderRadius: 5, 
    marginRight: 15, 
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0056b3', 
    borderRadius: 10, 
    marginBottom: 15, 
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listItemDescription: {
    color: '#ccc',
  },
  noPlacesText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NearbyDestinationsScreen;