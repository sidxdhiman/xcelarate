import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { SearchBar } from 'react-native-elements';
import { router } from 'expo-router';

import tw from 'twrnc';

type User = {
  id: string;
  username: string;
  email: string;
  contact: string;
  organisation: string;
  designation: string;
  location: string;
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const axiosInstance = useAuthStore((state) => state.axiosInstance);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/users');
        setUsers(res.data.reverse());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredUsers(users.filter(u =>
          u.username?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredUsers([]);
    }
  }, [search, users]);

  const openModifyPage = (user) => {
    const query = Object.entries(user)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');
    router.push(`/user_pages/modifyUser?${query}`);
  };

  return (
      <ScrollView>
        <View style={tw`absolute top-4 left-4 z-10`}>
          <Pressable onPress={() => router.push('/userManagement')}>
            <Icon name='arrow-left' size={22} color="white" />
          </Pressable>
        </View>

        <View style={styles.headerArc}>
          <Text style={styles.headerText}>USERS</Text>
        </View>

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
            <ActivityIndicator size="large" color="#800080" />
        ) : (
            (filteredUsers.length ? filteredUsers : users).map((user, index) => (
                <View key={user.id || user.email || index} style={[styles.card, !isMobile && styles.cardWeb]}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`text-lg font-bold text-black`}>{user.username}</Text>
                    <View style={tw`flex-row`}>
                      <Pressable onPress={() => openModifyPage(user)} style={tw`mr-4`}>
                        <Feather name="edit" size={20} color="#800080" />
                      </Pressable>
                      <Pressable onPress={() => router.push(`/user_pages/deleteUser?email=${encodeURIComponent(user.email)}`)}>
                        <Feather name="trash-2" size={20} color="red" />
                      </Pressable>
                    </View>
                  </View>
                  <Text>{user.email}</Text>
                  <Text>{user.contact}</Text>
                  <Text>{user.organisation}</Text>
                  <Text>{user.designation}</Text>
                  <Text>{user.location}</Text>
                </View>
            ))
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerArc: { backgroundColor: '#800080', paddingVertical: 32, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  searchContainer: { margin: 12 },
  searchWeb: { alignSelf: 'center', width: 500 },
  searchBarContainer: { backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 },
  searchInputContainer: { backgroundColor: '#fff', borderRadius: 30 },
  searchInput: { color: '#000' },
  card: {
    backgroundColor: '#fff', padding: 16, margin: 10, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardWeb: { width: 500, alignSelf: 'center' },
});

export default UserList;
