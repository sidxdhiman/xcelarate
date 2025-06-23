import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router, Router } from 'expo-router';

const TestSubmitted: React.FC = () => {
  const handleHome = () => {
    router.push('/userLanding')
    console.log('Go to Home Screen');
  };

  const handleLogout = () => {
    router.push('/Opening')
    console.log('Logged Out');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessment Submitted!</Text>
      <Text style={styles.subtitle}>Thank you for taking part!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleHome}>
          <Text style={styles.buttonText}>Go to Home Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TestSubmitted;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: width < 600 ? 24 : 32,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width < 600 ? 16 : 18,
    color: '#4a4a4a',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    backgroundColor: '#800080',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '80%',
  },
  logoutButton: {
    backgroundColor: '#4B004B',
  },
  buttonText: {
    color: '#fff',
    fontSize: width < 600 ? 16 : 18,
    textAlign: 'center',
  },
});
