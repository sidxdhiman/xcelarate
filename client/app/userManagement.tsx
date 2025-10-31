// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { router, useNavigation } from 'expo-router';
// import { Pressable } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import tw from 'twrnc';
//
// export default function UserPanel() {
//   const { width } = useWindowDimensions();
//   const isMobile = width < 600;
//   const horizontalPadding = 32;
//   const gapBetweenCards = 16;
//
//   const navigation = useNavigation();
//
//   // Adjust number of cards per row based on screen size
//   const cardsPerRow = isMobile ? 2 : Math.min(5, Math.floor((width - horizontalPadding) / 160));
//   const totalGaps = (cardsPerRow - 1) * gapBetweenCards;
//   const availableWidth = width - horizontalPadding - totalGaps;
//   const cardSize = availableWidth / cardsPerRow;
//
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Purple Header */}
//       <View style={styles.headerArc}>
//         <View style={tw`absolute top-4 left-4 z-10`}>
//         <Pressable onPress={()=> router.push('/landing')}>
//           <Icon name='arrow-left' size={22} color="white"></Icon>
//         </Pressable>
//       </View>
//         <Text style={styles.headerText}>USER MANAGEMENT</Text>
//       </View>
//
//       {/* Button Grid */}
//       <View style={[styles.cardGrid, { flexWrap: isMobile ? 'wrap' : 'nowrap' }]}>
//         <TouchableOpacity
//           style={[styles.card, { width: cardSize, height: cardSize }]}
//           onPress={() => router.push('/user_pages/userList')}
//         >
//           <FontAwesome5 name="user" size={42} color="#800080" />
//           <Text style={styles.cardText}>User List</Text>
//         </TouchableOpacity>
//
//         <TouchableOpacity
//           style={[styles.card, { width: cardSize, height: cardSize }]}
//           onPress={() => router.push('/user_pages/addUser')}
//         >
//           <FontAwesome5 name="user-plus" size={42} color="#800080" />
//           <Text style={styles.cardText}>Add User</Text>
//         </TouchableOpacity>
//
//         <TouchableOpacity
//           style={[styles.card, { width: cardSize, height: cardSize }]}
//           onPress={() => router.push('/user_pages/addBulk')}
//         >
//           <FontAwesome5 name="users" size={42} color="#800080" />
//           <Text style={styles.cardText}>Add Bulk</Text>
//         </TouchableOpacity>
//
//         {/*<TouchableOpacity*/}
//         {/*  style={[styles.card, { width: cardSize, height: cardSize }]}*/}
//         {/*  onPress={() => router.push('/user_pages/deleteUser')}*/}
//         {/*>*/}
//         {/*  <Ionicons name="trash-bin-outline" size={44} color="#800080" />*/}
//         {/*  <Text style={styles.cardText}>Archive</Text>*/}
//         {/*</TouchableOpacity>*/}
//       </View>
//     </SafeAreaView>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7f3ff',
//   },
//   headerArc: {
//     backgroundColor: '#800080',
//     paddingVertical: 32,
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     // marginTop: 10,
//     letterSpacing: 1,
//   },
//   cardGrid: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 16,
//     paddingHorizontal: 16,
//     flex: 1,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 4 },
//     marginBottom: 12,
//   },
//   cardText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#4b0082',
//     textAlign: 'center',
//   },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import tw from "twrnc";

export default function UserManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const axiosInstance = useAuthStore((state) => state.axiosInstance);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredUsers(
          users.filter((u) =>
              u.username?.toLowerCase().includes(search.toLowerCase())
          )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [search, users]);

  const openModifyPage = (user) => {
    const query = Object.entries(user)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join("&");
    router.push(`/user_pages/modifyUser?${query}`);
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerArc}>
          <View style={tw`absolute top-4 left-4 z-10 flex-row items-center gap-4`}>
            <Pressable onPress={() => router.push("/landing")}>
              <Icon name="arrow-left" size={22} color="white" />
            </Pressable>
          </View>
          <Text style={styles.headerText}>USER MANAGEMENT</Text>
        </View>

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          {/* Add Buttons Section */}
          <View
              style={[
                styles.addButtonsContainer,
                !isMobile && styles.addButtonsContainerWeb,
              ]}
          >
            <TouchableOpacity
                style={[styles.addButton, !isMobile && styles.halfButton]}
                onPress={() => router.push("/user_pages/addUser")}
            >
              <View style={styles.buttonContent}>
                <FontAwesome5 name="user-plus" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add User</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: "#9b59b6" },
                  !isMobile && styles.halfButton,
                ]}
                onPress={() => router.push("/user_pages/addBulk")}
            >
              <View style={styles.buttonContent}>
                <FontAwesome5 name="users" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Bulk Users</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
              style={[styles.searchContainer, !isMobile && styles.searchWeb]}
          >
            <SearchBar
                placeholder="Search users..."
                value={search}
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
            />
          </View>

          {/* User List */}
          {loading ? (
              <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
          ) : (filteredUsers.length ? filteredUsers : users).length === 0 ? (
              <Text style={styles.noUsersText}>No users found.</Text>
          ) : (
              (filteredUsers.length ? filteredUsers : users).map((user) => (
                  <View
                      key={user.id}
                      style={[styles.card, !isMobile && styles.cardWeb]}
                  >
                    <View style={tw`flex-row justify-between items-center mb-2`}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <View style={tw`flex-row`}>
                        <Pressable
                            onPress={() => openModifyPage(user)}
                            style={tw`mr-4`}
                        >
                          <Feather name="edit" size={20} color="#800080" />
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                router.push(
                                    `/user_pages/deleteUser?email=${encodeURIComponent(
                                        user.email
                                    )}`
                                )
                            }
                        >
                          <Feather name="trash-2" size={20} color="red" />
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>📧 {user.email}</Text>
                      <Text style={styles.infoText}>📞 {user.contact}</Text>
                      <Text style={styles.infoText}>🏢 {user.organisation}</Text>
                      <Text style={styles.infoText}>💼 {user.designation}</Text>
                      <Text style={styles.infoText}>📍 {user.location}</Text>
                    </View>
                  </View>
              ))
          )}
        </ScrollView>
      </SafeAreaView>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f6ff",
  },
  headerArc: {
    backgroundColor: "#800080",
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 8,
    shadowColor: "#800080",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // 🔲 Add Buttons
  addButtonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    gap: 10,
  },
  addButtonsContainerWeb: {
    flexDirection: "row",
    justifyContent: "center",
    width: 700, // match cards width
    alignSelf: "center",
    gap: 16,
  },
  addButton: {
    backgroundColor: "#800080",
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#800080",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  halfButton: {
    flex: 1, // equal width buttons
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },

  // 🔍 Search
  searchContainer: {
    marginVertical: 10,
    marginHorizontal: 12,
  },
  searchWeb: {
    alignSelf: "center",
    width: 700, // matches cards
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  searchInput: {
    color: "#000",
  },

  // 👥 Users
  noUsersText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 10,
    borderRadius: 16,
    shadowColor: "#800080",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#f0e6fa",
  },
  cardWeb: {
    width: 700, // same width alignment
    alignSelf: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4b0082",
  },
  infoBox: {
    marginTop: 6,
  },
  infoText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 3,
  },
});