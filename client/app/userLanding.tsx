import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const UserLanding = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const cardWidth = isMobile ? (width - 48) : width / 2.2;
  const cardHeight = 80;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ASSESSMENT{"\n"}PORTAL</Text>
      </View>

      {/* Buttons as Cards */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.card, { width: cardWidth, height: cardHeight }]}
          onPress={() => router.push('/user_pages/disclaimer')}
        >
          <Ionicons name="play-circle-outline" size={30} color="#800080" />
          <Text style={styles.cardText}>Start New Assessment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardWidth, height: cardHeight }]}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="log-out-outline" size={30} color="#800080" />
          <Text style={styles.cardText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UserLanding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3ff',
  },
  header: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#4b0082',
    textAlign: 'center',
  },
});
