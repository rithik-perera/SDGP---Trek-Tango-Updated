import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from './getIPAddress';

const API_KEY = 'c00e472f4fc54c0693b80206240602';
const CITY_NAME = 'Colombo';
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${CITY_NAME}&aqi=no`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather data:', error.message);
      }
    };

    fetchWeather();
  }, []);

  const navigation = useNavigation();

 

  const onPressOngoingTrips = async () => {
    await AsyncStorage.getItem('username').then((value) => {
      username = value;
    });
  
    const response = await fetch(`${baseURL}/api/session/saveSession/${username}`);
  
    if (!response.ok) {
      // If response status is not 200, display message on screen
      alert('No Saved Session Available');
      return; // Exit the function
    }
  
    const placeData = await response.json();
    const sessionId = placeData.sessionId;
    const finalDestinationList = placeData.listOfPlaces;
    const detected = placeData.detected;
    const confirmedStarterLocation = placeData.confirmedStarterLocation;
  
    await AsyncStorage.setItem('sessionId', sessionId);
  
    const routeParams = {
      finalDestinationList,
      detected,
      confirmedStarterLocation
    };
  
    navigation.navigate('GameMapScreen', routeParams);
  };
  
  const onPressPlanTrip = () => {
    navigation.navigate('LocationSelection');
  
    // Set the active tab to "Game"
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'Game',
        },
      })
    );
  };
  
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };
  

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://imgur.com/uJQUEuh.jpg' }} style={styles.logo} />
      <View style={styles.weatherContainer}>
        {weather && (
          <View style={styles.weatherContent}>
            <View style={styles.weatherLeft}>
              <Text style={styles.temperature}>
                {weather.current.temp_c}<Text style={styles.degree}>°C</Text>
              </Text>
              <Text style={styles.weatherCondition}>{weather.current.condition.text}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.weatherRight}>
              <Image source={{ uri: `http:${weather.current.condition.icon}` }} style={styles.weatherIcon} />
              <Text style={styles.weatherDetail}>Humidity: {weather.current.humidity}%</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <HomePageButton text="Plan Trip" imageUrl="https://imgur.com/dzyCjzl.jpg" onPress={onPressPlanTrip} />
        
        <HomePageButton text="Saved Trip" imageUrl="https://imgur.com/PQob2UE.jpg" onPress={onPressOngoingTrips} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const HomePageButton = ({ text, imageUrl, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
      <Image source={{ uri: imageUrl }} style={styles.buttonImage} />
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#010C33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    top:30,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  weatherContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  weatherLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 10,
  },
  weatherRight: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 10,
  },
  weatherDetail: {
    fontSize: 18,
    color: '#ffffff',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  degree: {
    fontSize: 24,
    fontWeight: 'normal',
  },
  weatherCondition: {
    fontSize: 18,
    color: '#ffffff',
  },
  weatherIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: width * 0.9,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    top:50,
    left:70,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
};

export default HomeScreen;
