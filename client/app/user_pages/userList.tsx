import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, ImageBackground, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuthStore } from '../../store/useAuthStore'; 
import tw from 'twrnc';

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

  return (
    <ImageBackground
      source={require('../../assets/images/0001.jpg')}
      style={{ width: screenWidth, height: screenHeight }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-6`}>
        <Text style={tw`text-white text-4xl font-bold text-center mb-6 pt-10`}>Users</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={tw`mt-10`} />
        ) : error ? (
          <Text style={tw`text-red-500 text-center`}>{error}</Text>
        ) : (
          users.map((user) => (
            <View key={user.id} style={tw`bg-white rounded-xl p-4 mb-4 shadow-md`}>
              {/* <View style={tw`flex-row items-center mb-1`}>
                <Icon name="user" size={18} color="#800080" style={tw`mr-2`} />
                <Text style={tw`text-black text-base font-semibold`}>{user.username}</Text>
              </View> */}
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

export default userList;
