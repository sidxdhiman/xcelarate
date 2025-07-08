import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';

export default function UserPanel() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const horizontalPadding = 32;
  const gapBetweenCards = 16;

  const navigation = useNavigation();

  // Adjust number of cards per row based on screen size
  const cardsPerRow = isMobile ? 2 : Math.min(5, Math.floor((width - horizontalPadding) / 160));
  const totalGaps = (cardsPerRow - 1) * gapBetweenCards;
  const availableWidth = width - horizontalPadding - totalGaps;
  const cardSize = availableWidth / cardsPerRow;

  return (
    <SafeAreaView style={styles.container}>
      {/* Purple Header */}
      <View style={styles.headerArc}>
        <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={()=> router.push('/landing')}>
          <Icon name='arrow-left' size={22} color="white"></Icon>
        </Pressable>
      </View>
        <Text style={styles.headerText}>USER MANAGEMENT</Text>
      </View>

      {/* Button Grid */}
      <View style={[styles.cardGrid, { flexWrap: isMobile ? 'wrap' : 'nowrap' }]}>
        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/user_pages/userList')}
        >
          <FontAwesome5 name="user" size={42} color="#800080" />
          <Text style={styles.cardText}>User List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/user_pages/addUser')}
        >
          <FontAwesome5 name="user-plus" size={42} color="#800080" />
          <Text style={styles.cardText}>Add User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/user_pages/addBulk')}
        >
          <FontAwesome5 name="users" size={42} color="#800080" />
          <Text style={styles.cardText}>Add Bulk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/user_pages/modifyUser')}
        >
          <MaterialIcons name="edit" size={46} color="#800080" />
          <Text style={styles.cardText}>Modify User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { width: cardSize, height: cardSize }]}
          onPress={() => router.push('/user_pages/deleteUser')}
        >
          <Ionicons name="trash-bin-outline" size={44} color="#800080" />
          <Text style={styles.cardText}>Archive</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3ff', // Admin panel background match
  },
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 12,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#4b0082',
    textAlign: 'center',
  },
});
