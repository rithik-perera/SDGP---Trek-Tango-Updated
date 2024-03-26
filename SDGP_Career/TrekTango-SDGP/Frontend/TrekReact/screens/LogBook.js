import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const PastTripsScreen = ({ navigation }) => {
  const pastTripsData = [
    { id: '1', location: 'ragama', date: '2023-01-15' },
    { id: '2', location: 'peralanda', date: '2023-03-22' },
    { id: '3', location: 'thewatte', date: '2023-06-05' },
    { id: '4', location: 'nawala', date: '2023-09-11' },
    { id: '5', location: 'colombo', date: '2023-12-30' },
  ];

  const renderTripItem = ({ item }) => (
    <View style={styles.tripItem}>
      <Text style={styles.tripText}>{`Trip to ${item.location}`}</Text>
      <Text style={styles.dateText}>{`Date: ${item.date}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Past Trips</Text>
      <FlatList
        data={pastTripsData}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tripList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010C33',
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft:20,
    color: '#fff',
    marginTop: 20,
    marginBottom:20,
  },
  tripList: {
    flexGrow: 1,
  },
  tripItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tripText: {
    fontSize: 18,
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default PastTripsScreen;
