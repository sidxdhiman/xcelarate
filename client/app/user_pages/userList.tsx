import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import tw from "twrnc";

export default function UserList() {
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
        <View style={styles.headerArc}>
          <View style={tw`absolute top-4 left-4 z-10`}>
            <Pressable onPress={() => router.push("/userManagement")}>
              <Icon name="arrow-left" size={22} color="white" />
            </Pressable>
          </View>
          <Text style={styles.headerText}>USER LIST</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.searchContainer, !isMobile && styles.searchWeb]}>
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

          {loading ? (
              <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
          ) : (filteredUsers.length ? filteredUsers : users).length === 0 ? (
              <Text style={styles.noUsersText}>No users found.</Text>
          ) : (
              (filteredUsers.length ? filteredUsers : users).map((user) => (
                  <View key={user.id} style={[styles.card, !isMobile && styles.cardWeb]}>
                    <View style={tw`flex-row justify-between items-center mb-2`}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <View style={tw`flex-row`}>
                        <Pressable onPress={() => openModifyPage(user)} style={tw`mr-4`}>
                          <Feather name="edit" size={20} color="#800080" />
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                router.push(
                                    `/user_pages/deleteUser?email=${encodeURIComponent(user.email)}`
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f6ff" },
  headerArc: {
    backgroundColor: "#800080",
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerText: { color: "#fff", fontSize: 26, fontWeight: "bold", letterSpacing: 1 },
  scrollContent: { paddingBottom: 40 },
  searchContainer: { marginVertical: 10, marginHorizontal: 12 },
  searchWeb: { alignSelf: "center", width: 700 },
  searchBarContainer: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0 },
  searchInputContainer: { backgroundColor: "#fff", borderRadius: 30, borderWidth: 1, borderColor: "#e0d0ef" },
  searchInput: { color: "#000" },
  noUsersText: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 16 },
  card: { backgroundColor: "#fff", padding: 16, margin: 10, borderRadius: 16, borderWidth: 1, borderColor: "#f0e6fa" },
  cardWeb: { width: 700, alignSelf: "center" },
  userName: { fontSize: 18, fontWeight: "700", color: "#4b0082" },
  infoBox: { marginTop: 6 },
  infoText: { color: "#333", fontSize: 14, marginBottom: 3 },
});
