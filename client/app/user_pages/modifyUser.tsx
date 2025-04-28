import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { RouteProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore'; // Assuming your auth store is in this path

// Define your navigation stack param list type
type RootStackParamList = {
  ModifyUser: { userId: string };
};

type ModifyUserRouteProp = RouteProp<RootStackParamList, 'ModifyUser'>;

const ModifyUser = ({ route }: { route?: ModifyUserRouteProp }) => {
  const userId = route?.params?.userId ?? '';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  // Use your auth store to handle backend call
  const { fetchUserById, modifyUser } = useAuthStore();

  useEffect(() => {
    if (!userId) return;
  
    const fetchUser = async () => {
      try {
        const user = await fetchUserById(userId);
        if (user) {
          setUsername(user.username);
          setEmail(user.email);
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
  }, [userId]);  

  const handleModifyUser = async () => {
    const updatedUser = {
      username,
      email,
      contact,
      organisation,
      designation,
      location,
    };

    try {
      const response = await modifyUser(userId, updatedUser);
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
        <Text style={tw`text-2xl font-bold text-white mb-5`}>MODIFY USER</Text>

        {/* Input Fields */}
        {[
          { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
          { icon: 'envelope', placeholder: 'Email', value: email, setter: setEmail },
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

export default ModifyUser;
