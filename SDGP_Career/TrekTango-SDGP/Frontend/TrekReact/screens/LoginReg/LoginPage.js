// import React from 'react';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CustomDialog from '../CustomComponents/CustomDialog'; // Import your custom dialog component
import { baseURL } from '../getIPAddress';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false); // State to control error dialog visibility
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignInPress = async () => {
    try {
      const response = await fetch(`${baseURL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: email,
          password: password
        }),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        // Login successful, save username to AsyncStorage
        await AsyncStorage.setItem('username', email);
  
        // Fetch user ID by username or email
        const response1 = await fetch(`${baseURL}/api/users/getId/${email}`);
        const userData = await response1.json();
        const userID = userData.userID;
  
        // Save userID as a string to AsyncStorage
        await AsyncStorage.setItem('userID', userID);
  
        // Retrieve and log stored values for testing
        AsyncStorage.getItem('username').then((value) => {
          console.log('Stored username:', value);
        });
  
        AsyncStorage.getItem('userID').then((value) => {
          console.log('Stored userID:', value);
        });
  
        // Navigate to the home screen
        navigation.navigate('Main');
      } else {
        // Login failed, show error message using custom dialog
        setErrorMessage(responseData.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error(error);
      // Failed to connect to server, show error message using custom dialog
      setErrorMessage('Failed to connect to server');
      setShowErrorDialog(true);
    }
  };
  

  const handleCreateAccountPress = () => {
    navigation.navigate('CreateAccountScreen');
  };

  const handleForgotPasswordPress = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleDialogOptionSelect = () => {
    setShowErrorDialog(false); // Hide the error dialog
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: 'https://i.imgur.com/uJQUEuh.png' }}
        resizeMode="contain"
        style={styles.logo}
      />
      <Text style={styles.signInText}>Sign in to continue</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Username Or Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="white"
        placeholder="Password"
        secureTextEntry={true}
        autoCapitalize="none"
value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.signInButton} onPress={handleSignInPress}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <View style={styles.space}></View>
      <View style={styles.orContainer}>
        <View style={styles.smallLine}></View>
        <Text style={styles.orText}>or</Text>
        <View style={styles.smallLine}></View>
      </View>
      <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccountPress}>
        <Text style={styles.createAccountText}>Create an account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPasswordPress}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      {/* Custom Error Dialog */}
      <CustomDialog
        visible={showErrorDialog}
        title="Error"
        message={errorMessage}
        options={['OK']}
        onSelect={handleDialogOptionSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 40, 
  },
  logo: {
    width: 243,
    height: 244,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  signInText: {
    color: 'white',
    marginBottom: 16,
    fontSize: 18,
    alignSelf: 'flex-start',
    marginLeft: 5,
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
  signInButton: {
    backgroundColor: '#0F4792',
    height: 40,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  space: {
    height: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginTop: 16,
  },
  smallLine: {
    flex: 0.4,
    height: 1,
    backgroundColor: 'white',
    marginLeft: 8,
    marginRight: 8,
  },
  orText: {
    color: 'white',
  },
  createAccountButton: {
    marginTop: 16,
  },
  createAccountText: {
    color: '#8CCDF1',
  },
  forgotPasswordButton: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#8CCDF1',
  },
});

export default LoginScreen;
