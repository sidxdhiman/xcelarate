import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuthStore } from '../../store/useAuthStore';
import tw from 'twrnc';
import { SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';

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

  const navigation = useNavigation();

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

  const fetchUserSearch = async (query: string) => {
  try {
    const res = await axiosInstance.get('/users', {
      params: { q: query },
    });
    setUserSearch(
      res.data.filter((user: User) =>
        user.username.toLowerCase().startsWith(query.toLowerCase())
      )
    );
  } catch (err) {
    console.error(err);
  }
};

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
        <Pressable onPress={()=> navigation.goBack()}>
          <Icon name='arrow-left' size={22} color="white"></Icon>
        </Pressable>
      </View>
      <View style={styles.headerArc}>
        <Text style={styles.headerText}>USERS</Text>
      </View>

      <View style={styles.search}>
        <SearchBar
          placeholder="Search users here..."
          onChangeText={(text: string) => setSearch(text)}
          value={search}
          platform="default"
          containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
          inputContainerStyle={{ backgroundColor: '#fff' }}
          inputStyle={{ color: '#000' }}
          round
        />
      </View>

      {userSeach.length > 0 && (
        <View style={tw`bg-white rounded-lg p-2 mx-2`}>
          {userSeach.map((user) => (
            <Text
              key={user.id}
              onPress={() => {
                setSelectedUser(user);
                setSearch('');
                setUserSearch([]);
              }}
              style={tw`py-2 px-2 border-b border-gray-200 text-black`}
            >
              {user.username}
            </Text>
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

      {loading ? (
        <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
      ) : error ? (
        <Text style={tw`text-red-500 text-center`}>{error}</Text>
      ) : (
        (selectedUser ? [selectedUser] : users).map((user) => (
          <View key={user.id} style={styles.icons}>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="user" size={18} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black text-base font-semibold`}>{user.username}</Text>
            </View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="envelope" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.email}</Text>
            </View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="phone" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.contact}</Text>
            </View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="building" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.organisation}</Text>
            </View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="briefcase" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>{user.designation}</Text>
            </View>
            <View style={tw`flex-row items-center`}>
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
  icons: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 5,
  },
  search: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
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
});

export default UserList;
