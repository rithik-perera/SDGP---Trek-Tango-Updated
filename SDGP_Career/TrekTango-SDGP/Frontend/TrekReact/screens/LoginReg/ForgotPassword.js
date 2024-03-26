import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  const handleContinuePress = () => {
    if (isValidEmailFormat(email)) {
      navigation.navigate('LogIn');
    } else {
      setIsValidEmail(false);
    }
  };

  const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.signInText}>Forgot Password?</Text>
      <Text style={styles.description}>
        Enter your email address below and we'll send you a OTP to reset your password. Check your email.
      </Text>
      <TextInput
        style={[styles.input, !isValidEmail && styles.inputError]}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setIsValidEmail(true);
        }}
        autoCapitalize="none"
      />
      {!isValidEmail && <Text style={styles.errorText}>Please enter a valid email address</Text>}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 300,
  },
  signInText: {
    color: 'white',
    marginBottom: 16,
    fontSize: 24,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  description: {
    color: 'white',
    marginBottom: 20,
    fontSize: 16,
    alignSelf: 'flex-start',
    marginLeft: 5,
    textAlign: 'center',
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  continueButton: {
    backgroundColor: '#0F4792',
    height: 40,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
