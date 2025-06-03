import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, ImageBackground, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuthStore } from '../../store/useAuthStore'; 
import tw from 'twrnc';
import iconSet from '@expo/vector-icons/build/Fontisto';
import { SearchBar } from 'react-native-elements';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type User = {
  id: string;
  username: string;
  email: string;
  contact: string;
  organisation: string;
  designation: string;
  location: string;
};

const userList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userSeach, setUserSearch] = useState<User[]>([]);

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
        params: {q: query}
      });
      setUserSearch(res.data)
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (search.length > 1) {
      fetchUserSearch(search);
    } else {
      setUserSearch([]);
    }
  }, [search]);

  return (
    <ImageBackground
      source={require('../../assets/images/0001.jpg')}
      style={{ width: screenWidth, height: screenHeight }}
      resizeMode="cover"
    > 
      <ScrollView contentContainerStyle={tw`p-6`}>
        
        <Text style={tw`text-white text-4xl font-bold text-center mb-6 pt-10`}>Users</Text>
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
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={tw`mt-10`} />
        ) : error ? (
          <Text style={tw`text-red-500 text-center`}>{error}</Text>
        ) : (
          users.map((user) => (
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
    </ImageBackground>
  );
};
// tw`bg-white rounded-xl p-4 mb-4 shadow-md`
const styles = StyleSheet.create({
  icons: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10
  },
  search: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
  }
});


export default userList;
