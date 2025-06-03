import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, ScrollView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { RouteProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore'; // Assuming your auth store is in this path
import { SearchBar } from 'react-native-elements';
import { axiosInstance } from '@/lib/axios';

// Define your navigation stack param list type
type RootStackParamList = {
  ModifyUser: { email: string };  // Change userId to email
};

type ModifyUserRouteProp = RouteProp<RootStackParamList, 'ModifyUser'>;

const ModifyUser = ({ route }: { route?: ModifyUserRouteProp }) => {
  const initialEmail = route?.params?.email ?? '';  // Use email from params

  const [email, setEmail] = useState(initialEmail);  // Define setEmail for email state
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState<User[]>([]);

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  // Use your auth store to handle backend call
  const { fetchUserByEmail, modifyUser } = useAuthStore();

  useEffect(() => {
    if (!email) return;
  
    const fetchUser = async () => {
      try {
        const user = await fetchUserByEmail(email);  // Fetch by email
        if (user) {
          setUsername(user.username);
          setContact(user.contact);
          setOrganisation(user.organisation);
          setDesignation(user.designation);
          setLocation(user.location);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [email]); // Fetch user on email change

  const fetchUserSearch = async (query: string) => {
    try{
      const res = await axiosInstance.get('/users', {
        params: {q: query}
      });
      setUserSearch(res.data)
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(()=> {
    if (search.length > 1) {
      fetchUserSearch(search)
    } else {
      setUserSearch([]);
    }
  }, [search]);

  const handleModifyUser = async () => {
    const updatedUser = {
      username,
      email,  // Include email here if you want to keep it updated
      contact,
      organisation,
      designation,
      location,
    };
    try {
      const response = await modifyUser(email, updatedUser);  // Pass email to modify
      console.log('Updated user:', response);
      // Handle success or show success message
    } catch (error) {
      console.error('Error updating user:', error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/0002.png')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-8 items-center justify-center`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-4xl font-bold text-white mb-5 py-10`}>Modify User</Text>
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
        {/* Input Fields */}
        {[
          { icon: 'gear', placeholder: 'Enter the email id to modify', value: email, setter: setEmail }, // Allow email input
          { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
          { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact },
          { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },
          { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
        ].map((field, idx) => (
          <View key={idx} style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
            <Icon name={field.icon} size={18} color="#999" style={tw`mr-2`} />
            <TextInput
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              value={field.value}
              onChangeText={field.setter}
              style={tw`flex-1 text-black text-base`}
            />
          </View>
        ))}

        {/* Location Picker */}
        <View style={tw`w-full mt-2 mb-2`}>
          <Text style={tw`text-white mb-1 ml-1 font-semibold`}>Location</Text>
          <View style={tw`bg-white rounded-full h-11 justify-center px-3`}>
            <Picker
              selectedValue={location}
              onValueChange={(itemValue) => setLocation(itemValue)}
              style={tw`text-black w-full`}
              dropdownIconColor="#800080"
              mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
            >
              <Picker.Item label="Select a location" value="" />
              {locations.map((loc, index) => (
                <Picker.Item key={index} label={loc} value={loc} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] rounded-full py-3 px-10 mt-5 w-full items-center`}
          onPress={handleModifyUser}
        >
          <Text style={tw`text-white font-semibold text-base`}>
            Save Changes
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  search: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20
  }
})

export default ModifyUser;
