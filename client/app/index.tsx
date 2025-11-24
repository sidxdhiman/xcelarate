import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { RFValue } from "react-native-responsive-fontsize";

export default function WelcomeScreen() {
  return (
      <View style={styles.container}>
        <ImageBackground
            source={require("../assets/images/0003.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
          <View style={styles.innerContainer}>

            {/* This is the XCELARATE Logo */}
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
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // --- UPDATED LOGO STYLE ---
  titleLogo: {
    // On Web, we use a fixed meaningful size. On Mobile, we use RFValue.
    ...Platform.select({
      web: {
        width: 600,      // Large width for web
        height: 100,     // Fixed height to ensure visibility
        maxWidth: '90%', // Responsive backup for smaller browser windows
      },
      default: {
        width: RFValue(300),
        height: RFValue(28),
      }
    }),
    resizeMode: 'contain',
    marginBottom: 40,
  },
  // --------------------------
  button: {
    backgroundColor: '#740968',
    paddingVertical: 16,
    paddingHorizontal: 96,
    borderRadius: 9999,
    elevation: 5,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  buttonText: {
    color: 'white',
    fontWeight: '300',
    fontSize: 16, // Increased slightly for better web readability
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
});