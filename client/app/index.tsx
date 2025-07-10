import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';
import {RFValue} from "react-native-responsive-fontsize";

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function WelcomeScreen() {
  return (
      <SafeAreaView style={styles.container}>
        <ImageBackground 
         source={require("../assets/images/0003.png")}
         style={styles.backgroundImage}
         resizeMode="cover"
        >
          <View style={styles.innerContainer}>
          {/* <Text style={styles.title}>XCELARATE</Text> */}
          <Image 
            source={require('../assets/images/title-logos/title.png')}
            style={styles.titleLogo}
          />

          <View style={styles.bottomRight}>
            <Text style={styles.subtitle}>Powered By </Text>
            <Image
              source={require('../assets/images/Xebia.png')}
              style={styles.logo}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/Opening')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
        </ImageBackground>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // backgroundImage: {
  //  flex: 1, // Ensures it covers the full screen
  //   width: '100%', // Ensures the image is stretched to the full width
  //   height: '100%', // Ensures the image is stretched to the full height
  // },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    //paddingTop: 50,
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: RFValue(50),
    fontWeight: 'bold',
    color: 'white',
    marginTop: 200,
  },
  titleLogo: {
    marginTop: 250,
    width: RFValue(300),
    height: RFValue(28),
    resizeMode: 'cover',
  },
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 80,
  },
  poweredByText: {
    fontSize: 12,
    color: '#4B5563',
    marginRight: 4,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#740968',
    paddingVertical: 16,
    paddingHorizontal: 96,
    borderRadius: 9999,
    marginTop: 256,
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
    marginRight: 5
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    height: screenHeight,
    width: screenWidth
    // width: '100%',
    // height: '100%'
  }
});
