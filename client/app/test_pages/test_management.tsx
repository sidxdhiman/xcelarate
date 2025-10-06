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

export default function TestManagement() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const cardWidth = isMobile ? (width - 48) / 2 : width / 5.5;
  const cardHeight = cardWidth;

  const cards = [
    {
      icon: <FontAwesome5 name="list" size={42} color="#800080" />,
      text: 'Assessment List',
      path: '/test_pages/testList',
    },
    {
      icon: <FontAwesome5 name="paperclip" size={42} color="#800080" />,
      text: 'Add Assessment',
      path: '/test_pages/addTest',
    },
    {
      icon: <Ionicons name="trash-bin-outline" size={44} color="#800080" />,
      text: 'Archive',
      path: '/test_pages/deleteTest',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={()=> router.push('/landing')}>
          <Icon style={tw`pt-10`} name='arrow-left' size={22} color="white"></Icon>
        </Pressable>
      </View>
      <View style={styles.headerArc}>
        <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
      </View>

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
            onPress={() => router.push(card.path)}
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
                marginRight:
                  !isMobile && index !== cards.length - 1 ? 16 : 0,
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3ff',
  },
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 50
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
