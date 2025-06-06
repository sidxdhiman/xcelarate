import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const AssessmentPortal: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/0001.jpg')} // Adjust path based on your structure
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.flexContainer}>
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                ASSESSMENT{'\n'}PORTAL
              </Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.flex1} />

          {/* Buttons */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/user_pages/disclaimer')}
            >
              <Text style={styles.buttonText}>Start New Assessment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  flexContainer: {
    flex: 1,
  },
  headerWrapper: {
    backgroundColor: '#800080',
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    height: 180,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  titleContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
  buttonWrapper: {
    marginTop: 400,
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AssessmentPortal;
