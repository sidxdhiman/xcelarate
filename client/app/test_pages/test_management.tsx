// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ImageBackground,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { push } from 'expo-router/build/global-state/routing';
// import { Dimensions } from 'react-native';
// const screenWidth = Dimensions.get('window').width;
// const screenHeight = Dimensions.get('window').height;

// export default function UserPanel() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require('../../assets/images/0001.jpg')}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       >
//         {/* Header Section */}
//         <View style={styles.headerContainer}>
//           <View style={styles.topCurve}>
//             {/* Home Icon */}
//             {/* <TouchableOpacity style={styles.homeIcon}>
//               <Ionicons name="home" size={24} color="#000" />
//             </TouchableOpacity> */}

//             <Text style={styles.headerText}>TEST MANAGEMENT</Text>
//           </View>
//         </View>

//         {/* Buttons */}
//         <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.button} /*onPress={() => router.push('/user_pages/userList')}*/>
//             <FontAwesome5 name="list" size={16} color="#000" />
//             <Text style={styles.buttonText}>Test List</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.button} /*onPress={() => router.push('/user_pages/addUser')}*/>
//             <FontAwesome5 name="paperclip" size={16} color="#000" />
//             <Text style={styles.buttonText}>Add Test</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.button} /*onPress={() => router.push('/user_pages/modifyUser')}*/>
//             <MaterialIcons name="edit" size={18} color="#000" />
//             <Text style={styles.buttonText}>Modify Test</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.button} /*onPress={() => router.push('/user_pages/deleteUser')}*/>
//             <Ionicons name="trash-bin-outline" size={18} color="#000" />
//             <Text style={styles.buttonText}>Flag/Archive Test</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   backgroundImage: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     width: screenWidth,
//     height: screenHeight,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     position: 'relative',
//     marginBottom: 120,
//   },
//   topCurve: {
//     backgroundColor: '#800080',
//     width: '100%',
//     height: 190,
//     borderBottomLeftRadius: 350,
//     borderBottomRightRadius: 350,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     paddingTop: 30,
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   homeIcon: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 6,
//     elevation: 5,
//   },
//   buttonContainer: {
//     paddingHorizontal: 25,
//     alignItems: 'center',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     marginVertical: 10,
//     width: '100%',
//     justifyContent: 'center',
//     gap: 10,
//     elevation: 4,
//   },
//   buttonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     textTransform: 'capitalize',
//   },
// });

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
import { router } from 'expo-router';

export default function TestManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const cardWidth = isMobile ? (width - 48) / 2 : width / 5.5;
  const cardHeight = cardWidth;

  const cards = [
    {
      icon: <FontAwesome5 name="list" size={42} color="#800080" />,
      text: 'Test List',
      path: '/test_pages/testList',
    },
    {
      icon: <FontAwesome5 name="paperclip" size={42} color="#800080" />,
      text: 'Add Test',
      path: '/test_pages/addTest',
    },
    {
      icon: <MaterialIcons name="edit" size={46} color="#800080" />,
      text: 'Modify Test',
      path: '/test_pages/modifyTest',
    },
    {
      icon: <Ionicons name="trash-bin-outline" size={44} color="#800080" />,
      text: 'Archive',
      path: '/test_pages/deleteTest',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerArc}>
        <Text style={styles.headerText}>TEST MANAGEMENT</Text>
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
