import { baseURL } from '../getIPAddress';
import React, { useState } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigation } from '@react-navigation/native';

const CreateAccountScreen = () => {
  // const navigation = useNavigation(); // Get navigation object
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');

  const navigation = useNavigation(); // Get navigation object
  

  const handleCreateAccount = async () => {
    try {
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
  
      // Make a POST request to the backend endpoint
      const response = await fetch(`${baseURL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          dob
        }),
      });
      
      // Check if the request was successful
      if (response.status === 201) {
        console.log('User registered successfully');
        navigation.navigate('Main'); //Can also navigate to the login page (Will be prompted to rewrite username and password)
        
      } else {
        console.error('Failed to register user');
        // Handle error appropriately
      }
    } catch (error) {
      console.error('Error registering user:', error);
      // Handle error appropriately
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.createAccountText}>Create an account</Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => setLastName(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Enter email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Enter username"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Enter password"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={(text) => setDob(text)}
      />
      <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
        <Text style={styles.createAccountButtonText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createAccountText: {
    color: 'white',
    marginBottom: 16,
    fontSize: 18,
  },
  input: {
    height: 40,
    width: '100%',
    backgroundColor: '#181818',
    marginBottom: 20,
    paddingLeft: 8,
    color: 'white',
    borderRadius: 10,
  },
  createAccountButton: {
    backgroundColor: '#0F4792',
    height: 40,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute', // Place the button at the top left
    top: 40,
    left: 10,
    padding: 10, // Adjust padding for visual consistency
  },
  backButtonText: {
    color: 'white', // Adjust color based on your preference
  },
});

export default CreateAccountScreen;