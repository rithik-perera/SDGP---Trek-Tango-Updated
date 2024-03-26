import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Snackbar component to display temporary messages with an optional action button.
 * @param {Object} props - Component props.
 * @param {boolean} props.visible - Determines whether the Snackbar is visible.
 * @param {string} props.message - Message to be displayed in the Snackbar.
 * @param {number} [props.duration=2500] - Duration in milliseconds for which the Snackbar is displayed.
 * @param {Object} [props.action] - Optional action button configuration.
 * @param {string} props.action.label - Label text for the action button.
 * @param {function} props.action.onPress - Function to be called when the action button is pressed.
 * @returns {JSX.Element|null} - JSX element representing the Snackbar.
 */
const Snackbar = ({ visible, message, duration, action }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => setIsVisible(false), duration || 2500);
      return () => clearTimeout(timeout);
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    action?.onPress(); 
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, styles.absolute]}>
      <Text style={styles.text}>{message}</Text>
      {action && (
        <TouchableOpacity style={styles.action} onPress={handleDismiss}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 390, 
    position: 'absolute',
    bottom: 15, 
    left: '3%', // left edge is from 3% of the containing element
    right: '98%', // right edge is from 98% of the containing element
    zIndex: 999,
  },
    text: {
      color: '#0047AB',
      fontSize: 16,
      flex: 1,
    },
    action: {
      marginLeft: 10,
    },
    actionText: {
      color: '#0047AB',
      fontSize: 14,
    },
  });

export default Snackbar;