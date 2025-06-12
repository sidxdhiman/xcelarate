import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const AdminPanel = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const cardSize = isMobile ? width / 2 - 32 : width / 4 - 32;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ADMIN PANEL</Text>
      </View>

      {/* Card Grid */}
      <View style={[styles.cardGrid, { flexWrap: isMobile ? 'wrap' : 'nowrap' }]}>
        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/userManagement')}
        >
          <FontAwesome5 name="users" size={42} color="#800080" />
          <Text style={styles.cardText}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/test_pages/test_management')}
        >
          <MaterialIcons name="question-answer" size={44} color="#800080" />
          <Text style={styles.cardText}>Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { width: cardSize, height: cardSize }]}>
          <Feather name="file-text" size={44} color="#800080" />
          <Text style={styles.cardText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="log-out-outline" size={44} color="#800080" />
          <Text style={styles.cardText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    // paddingHorizontal: 16,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },
  cardText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#4b0082',
    textAlign: 'center',
  },
});

export default AdminPanel;
