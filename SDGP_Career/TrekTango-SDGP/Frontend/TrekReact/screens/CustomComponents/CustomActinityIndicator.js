import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Spinner from '../CustomComponents/spinner.gif';

/**
 * CustomActivityIndicator component displays a loading indicator with a spinner GIF.
 * @returns {JSX.Element} CustomActivityIndicator component
 */
const CustomActivityIndicator = () => {
  return (
    <View style={styles.overlay}>
      <Image source={Spinner} style={styles.loadingGif} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingGif: {
    width: 65, 
    height:65,
  },
});

export default CustomActivityIndicator;
