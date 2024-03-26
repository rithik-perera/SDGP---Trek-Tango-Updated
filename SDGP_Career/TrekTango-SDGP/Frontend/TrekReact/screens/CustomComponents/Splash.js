import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * SplashScreen component displayed when the app is first launched.
 * @returns {JSX.Element} - JSX element representing the SplashScreen.
 */
const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the Home screen after 4 seconds
      navigation.navigate('LogInNav');
    }, 3500);

    // Clear the timeout if the component is unmounted
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run the effect only once

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.imgur.com/lCbsJVU.jpg' }}
        style={styles.image}
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
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
