import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { RFValue } from "react-native-responsive-fontsize";

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function WelcomeScreen() {
  return (
      <View style={styles.container}>
        <ImageBackground
            source={require("../assets/images/0003.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
          <View style={styles.innerContainer}>
            <Image
                source={require('../assets/images/title-logos/title.png')}
                style={styles.titleLogo}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Opening')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <View style={styles.bottomRight}>
              <Text style={styles.subtitle}>Powered By </Text>
              <Image
                  source={require('../assets/images/Xebia.png')}
                  style={styles.logo}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // ensures full height
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // centers logo and button
  },
  titleLogo: {
    width: RFValue(300),
    height: RFValue(28),
    resizeMode: 'cover',
    marginBottom: 40, // spacing before button
  },
  button: {
    backgroundColor: '#740968',
    paddingVertical: 16,
    paddingHorizontal: 96,
    borderRadius: 9999,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '300',
    fontSize: 12,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'white',
    marginRight: 5,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  backgroundImage: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  }
});