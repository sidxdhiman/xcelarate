import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions, Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import tw from 'twrnc';
import { SearchBar } from 'react-native-elements';
import { router } from 'expo-router';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userSeach, setUserSearch] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const axiosInstance = useAuthStore((state) => state.axiosInstance);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/users');
        setUsers(res.data.reverse());
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.length > 0) {
      const filtered = users.filter((user) =>
        user.username?.toLowerCase().startsWith(search.toLowerCase())
      );
      setUserSearch(filtered);
    } else {
      setUserSearch([]);
    }
  }, [search, users]);

  return (
    <ScrollView>
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={() => router.back()}>
          <Icon name='arrow-left' size={22} color="white" />
        </Pressable>
      </View>

      <View style={styles.headerArc}>
        <Text style={styles.headerText}>USERS</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, !isMobile && styles.searchWeb]}>
        <SearchBar
          placeholder="Search users..."
          onChangeText={(text: string) => setSearch(text)}
          value={search}
          platform="default"
          round
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInputText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Result Suggestions */}
      {userSeach.length > 0 && (
        <View style={[styles.resultBox, !isMobile && styles.resultBoxWeb]}>
          {userSeach.map((user) => (
            <Pressable
              key={user.id}
              onPress={() => {
                setSelectedUser(user);
                setSearch('');
                setUserSearch([]);
              }}
              style={({ pressed }) => [
                styles.resultItem,
                pressed && { backgroundColor: '#f0e5ff' },
              ]}
            >
              <Text style={styles.resultText}>{user.username}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {selectedUser && (
        <View style={tw`items-end px-4`}>
          <Text
            onPress={() => setSelectedUser(null)}
            style={tw`text-purple-700 text-sm underline`}
          >
            Clear Selection
          </Text>
        </View>
      )}

      {/* User Cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
      ) : error ? (
        <Text style={tw`text-red-500 text-center`}>{error}</Text>
      ) : (
        (selectedUser ? [selectedUser] : users).map((user) => (
          <View key={user.id} style={[styles.card, !isMobile && styles.cardWeb]}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-lg font-bold text-black`}>{user.username}</Text>
              <View style={tw`flex-row`}>
                <Pressable
                  onPress={() => router.push(`/user_pages/modifyUser`)}
                  style={tw`mr-4`}
                >
                  <Feather name="edit" size={20} color="#800080" />
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/user_pages/deleteUser`)}
                >
                  <Feather name="trash-2" size={20} color="#cc0000" />
                </Pressable>
              </View>
            </View>

            <View style={tw`flex-row items-center mt-2`}>
              <Icon name="envelope" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.email}</Text>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="phone" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.contact}</Text>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="building" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.organisation}</Text>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="briefcase" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.designation}</Text>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.location}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  searchContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  searchWeb: {
    alignSelf: 'center',
    width: 500,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInputText: {
    color: '#000',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  resultBoxWeb: {
    width: 500,
    alignSelf: 'center',
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  card: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    width: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardWeb: {
    width: 500,
  },
});

export default UserList;
