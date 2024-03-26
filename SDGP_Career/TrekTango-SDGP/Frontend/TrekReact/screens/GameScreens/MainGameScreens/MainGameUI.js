import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Alert} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import GameLocationModal from './GameLocationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../../getIPAddress';

const GameMapScreen = ({ route }) => {
  const navigation = useNavigation();
  const { finalDestinationList, detected, confirmedStarterLocation } = route.params;
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [directions, setDirections] = useState([]);
  const [capturedLocationIDs, setCapturedLocationIDs] = useState([]);

  useEffect(() => {
    const fetchDirections = async () => {
      const apiKey = 'AIzaSyCCHxfnoWl-DNhLhKcjhCTiHYNY917ltL8'; 
      const filteredDestinations = finalDestinationList.filter(destination => !capturedLocationIDs.includes(destination.place_id));
      if (filteredDestinations.length < 2) {
        setDirections([]);
        return;
      }
      const waypoints = filteredDestinations.map(place => `place_id:${place.place_id}`).join('|');
      const origin = `${confirmedStarterLocation.latitude},${confirmedStarterLocation.longitude}`;
      const destination = `${filteredDestinations[filteredDestinations.length - 1].latitude},${filteredDestinations[filteredDestinations.length - 1].longitude}`;
  
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${apiKey}`);
      const data = await response.json();
  
      if (data.status === 'OK') {
        const polylinePoints = data.routes[0].overview_polyline.points;
        setDirections(polylinePoints);
      } else {
        console.error('Error fetching directions:', data.status);
      }
    };
  
    fetchDirections();
  }, [finalDestinationList, confirmedStarterLocation, capturedLocationIDs, userPoints]);
  
  const [userPoints, setUserPoints] = useState(0);


  const handleBackButtonPress = async() => {

    await AsyncStorage.getItem('sessionId').then((value) => {
      sessionId = value;
    });

    await AsyncStorage.getItem('username').then((value) => {
      username = value;
    });

    if (capturedLocationIDs.length === finalDestinationList.length) {
      setUserPoints(prevPoints => prevPoints + 30); // Increment user points by 30
      Alert.alert('Congratulations', `You completed your trek with ${userPoints + 30} points.`, [
        { text: 'OK', onPress: () => { for (let i = 0; i < 5; i++) navigation.goBack(); } }
      ]);
    } else {
      Alert.alert(
        'Confirmation',
        'Are you sure you want to exit? This will end the trip.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => { for (let i = 0; i < 5; i++) navigation.goBack(); } }
        ]
      );
    }
    

    const response = await fetch(`${baseURL}/api/session/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId
      }),
    });
    if(response.status === 200){
      console.log("Session Updated")
    }else{
      console.error("Cannot update");
    }

   
    const response1 = await fetch(`${baseURL}/api/users/addPoints`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        points: userPoints
      }),
    });
    if(response1.status === 200){
      console.log("Points added")
    }else{
      console.error("Cannot update");
    }


  };

  const handleSaveButtonPress = () => {
    if (capturedLocationIDs.length === finalDestinationList.length) {
      setUserPoints(prevPoints => prevPoints + 30); // Increment user points by 30
      Alert.alert('Congratulations', `You completed your trek with ${userPoints + 30} points.`, [
        { text: 'OK', onPress: () => { for (let i = 0; i < 5; i++) navigation.goBack(); } }
      ]);
    } else {
      Alert.alert(
        'Confirmation',
        'Are you sure you want to save your progress and exit trip?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => { for (let i = 0; i < 5; i++) navigation.goBack(); } }
        ]
      );
    }
  };
  
  
  
  const renderDestinationItem = ({ item }) => (
    <TouchableOpacity style={styles.destinationItem}>
      <Text style={capturedLocationIDs.includes(item.place_id) ? styles.crossedText : styles.destinationText}>{item.name}</Text>
    </TouchableOpacity>
  );  
  
  const handleRedMarkerPress = (location) => {
    setSelectedLocation(location);
  };

  const handleBlueMarkerPress = (location) => {
    if (!detected) {
      setSelectedLocation(location);
    }
  };

  const handleLocationCapture = (locationID) => {
    setCapturedLocationIDs(prevIDs => [...prevIDs, locationID]);
    setUserPoints(prevPoints => prevPoints + 10); 
    setSelectedLocation(null);
  };

  return (
    <View style={styles.container}>
      {confirmedStarterLocation && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: confirmedStarterLocation.latitude,
            longitude: confirmedStarterLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          mapType="standard"
        >
          {directions.length > 0 && (
            <Polyline
              coordinates={decodePolyline(directions)}
              strokeWidth={3}
              strokeColor="#FF5733"
            />
          )}

          <Marker
            coordinate={{
              latitude: confirmedStarterLocation.latitude,
              longitude: confirmedStarterLocation.longitude,
            }}
            title="Start Location"
            pinColor="blue"
            onPress={() => handleBlueMarkerPress(finalDestinationList[0])} 
          />

        {finalDestinationList
          .filter(destination => !capturedLocationIDs.includes(destination.place_id))
          .map((destination, index) => (
            !detected && index === 0 ? null : (
              <Marker
                key={destination.place_id}
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                title={destination.name}
                pinColor="red"
                onPress={() => handleRedMarkerPress(destination)} 
              />
            )
          ))}
        </MapView>
      )}
      <TouchableOpacity style={styles.endTripButton} onPress={handleBackButtonPress}>
        <Text style={styles.searchProgressButtonText}>End Trip</Text>
      </TouchableOpacity>      
      <TouchableOpacity style={styles.searchProgressButton} onPress={handleSaveButtonPress}>
        <Text style={styles.searchProgressButtonText}>Save Trip</Text>
      </TouchableOpacity>
      <View style={styles.destinationListContainer}>
        <Text style={styles.userPoints}>Points: {userPoints}</Text>
        <Text style={styles.destinationListHeader}>Your Trek Points</Text>
        <FlatList
          data={finalDestinationList}
          renderItem={renderDestinationItem}
          keyExtractor={item => item.place_id.toString()}
          style={styles.destinationList}
        />
      </View>

      {/* Render the GameLocationModal when selectedLocation is not null */}
      {selectedLocation && (
        <GameLocationModal
          isVisible={true}
          locations={finalDestinationList}
          clickedLocation={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onLocationCapture={handleLocationCapture} 
        />
        )}
        {/*{capturedLocationID === selectedLocation?.place_id && (
          <View>
            {console.log('Location ID:', capturedLocationID)}
          </View>
        )} */}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchProgressButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    zIndex: 1,
  },
  searchProgressButtonText: {
    top:29,
    right:150,
    color: '#fff',
    fontSize: 16,
    backgroundColor:'rgba(0,0,0,0.7)',
    padding: 10,
    paddingLeft:200,
  },
  endTripButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    zIndex: 1,
  },
  destinationListContainer: {
    position: 'absolute',
    bottom: 40,
    maxWidth: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  destinationListHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    left:20,
    bottom: 5,
  },
  destinationList: {
    maxHeight: 200,
  },
  destinationItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  destinationText: {
    fontSize: 16,
    color: '#333',
  },
  crossedText: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  userPoints: {
    left:290,
    top:15,
    backgroundColor:'rgba(180,180,180,0.9)',
    padding:7,
  },
});

// Function to decode Google Maps polyline
function decodePolyline(encoded) {
  // array that holds the points
  const points = []
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63; // ascii
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default GameMapScreen;
