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

  const cardWidth = isMobile ? (width - 48) / 2 : width / 5.5;
  const cardHeight = cardWidth;

  const cards = [
    {
      icon: <FontAwesome5 name="users" size={42} color="#800080" />,
      text: 'Users',
      path: '/userManagement',
    },
    {
      icon: <MaterialIcons name="question-answer" size={44} color="#800080" />,
      text: 'Tests',
      path: '/test_pages/test_management',
    },
    {
      icon: <Feather name="file-text" size={44} color="#800080" />,
      text: 'Reports',
      path: '',
    },
    {
      icon: <Ionicons name="log-out-outline" size={44} color="#800080" />,
      text: 'Logout',
      path: '/login',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ADMIN PANEL</Text>
      </View>

      {/* Card Grid */}
      <View
        style={[
          styles.cardGrid,
          {
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: isMobile ? 'space-between' : 'center',
          },
        ]}
      >
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => card.path && router.push(card.path)}
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
                marginRight: !isMobile && index !== cards.length - 1 ? 16 : 0,
                marginBottom: isMobile ? 16 : 0,
              },
            ]}
          >
            {card.icon}
            <Text style={styles.cardText}>{card.text}</Text>
          </TouchableOpacity>
        ))}
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
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#4b0082',
    textAlign: 'center',
  },
});

export default AdminPanel;
