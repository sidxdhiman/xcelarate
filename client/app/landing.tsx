import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminPanel = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const insets = useSafeAreaInsets(); // ← detects top inset (Dynamic Island / notch)

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
      text: 'Assessments',
      path: '/test_pages/test_management',
    },
  ];

  return (
      <View style={styles.container}>
        {/* Blend header into notch */}
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        {/* Header that extends fully to the top (behind Dynamic Island) */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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

        {/* Floating Logout Button */}
        <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3ff',
  },
  header: {
    backgroundColor: '#800080',
    paddingBottom: 32,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 6,
    shadowColor: '#800080',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    elevation: 6,
    shadowColor: '#800080',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardText: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#4b0082',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#800080',
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#800080',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default AdminPanel;


