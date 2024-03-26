import React, { useState } from 'react';
import { View, Modal, Text, StyleSheet, Button, Image, ScrollView, TouchableOpacity } from 'react-native';

/**
 * Modal component for displaying details of a selected place.
 * @param {object} props - Component props.
 * @param {boolean} props.visible - Controls the visibility of the modal.
 * @param {object} props.place - Data of the selected place.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Function} props.onAddToList - Callback function to add the place to a list.
 * @param {Array} props.selectedPlaces - Array of currently selected places.
 * @returns {JSX.Element} - PlaceDetailsModal component.
 */
const PlaceDetailsModal = ({ visible, place, onClose, onAddToList}) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const GOOGLE_API_KEY = "AIzaSyCCHxfnoWl-DNhLhKcjhCTiHYNY917ltL8";

  /**
   * Handles adding the place to the list.
   */
  const handleAddToList = () => {
    if (!place) return;

    const placeData = {
      place_id: place.place_id,
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng
    };

    onAddToList(placeData);
  };

  /**
   * Handles displaying the next review.
   */
  const handleNextReview = () => {
    setCurrentReviewIndex(currentReviewIndex === place.reviews.length - 1 ? 0 : currentReviewIndex + 1);
  };

  /**
   * Handles displaying the previous review.
   */
  const handlePreviousReview = () => {
    setCurrentReviewIndex(currentReviewIndex === 0 ? place.reviews.length - 1 : currentReviewIndex - 1);
  };

  if (!place) {
    return null;
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeAddress}>{place.vicinity}</Text>
            {place.photos && place.photos.length > 0 && (
              <View style={styles.imageContainer}>
                  <ScrollView horizontal={true}>
                    <View style={styles.imageRow}>
                      {place.photos && place.photos.map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}` }}
                          style={styles.placeImage}
                        />
                      ))}
                    </View>
                  </ScrollView>
              </View>
            )}
            {(!place.photos || place.photos.length == 0) && (
              <Image
              source={require('../../CustomComponents/ImgUnavailable.png')}
              style={{ width: 200, height: 150 }} 
              />
            )}
            <Text style={styles.detailsText}>Rating: {place.rating ? place.rating : "Not available"}</Text>
            <Text style={styles.detailsText}>Opening Hours: {place.opening_hours ? (
              place.opening_hours.open_now ? 'Open Now' : 'Closed'
            ) : (
              'Not available'
            )}</Text>
            <Text style={styles.detailsText}>Price Level: {place.price_level ?'$'.repeat(place.price_level) : "Currently unavailable"}</Text>
            <Text style={styles.detailsText}>Types: {place.types ? place.types.join(", ") : "Currently unavailable"}</Text>
            <Text style={styles.detailsText}>Website: {place.website ? place.website : "Currently unavailable"}</Text>
            <Text style={styles.detailsText}>Phone Number: {place.formatted_phone_number ? place.formatted_phone_number : "Currently unavailable"}</Text>
            {place.reviews && place.reviews.length > 0 ? (
              <View style={styles.reviewsContainer}>
                <View style={styles.reviewNavigation}>
                  <Button title="<" onPress={handlePreviousReview} />
                  <Text style={styles.reviewsTitle}>Review {currentReviewIndex + 1} of {place.reviews.length}:</Text>
                  <Button title=">" onPress={handleNextReview} />
                </View>
                {place.reviews[currentReviewIndex] && (
                  <Text style={styles.reviewText}>{place.reviews[currentReviewIndex].text}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.noReviewsText}>No reviews available</Text>
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button title="Add to List" onPress={handleAddToList} />
          </View>
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 12, 51, 0.8)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  scrollView: {
    maxHeight: '100%',
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
  },
  placeImage: {
    width: 340,
    height: 150,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  infoContainer: {
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  reviewNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default PlaceDetailsModal;
