import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { KeyboardTypeOptions } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore'; // Ensure this path is correct

const AddUser = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  // Get the addUser function from your auth store
  const { addUser } = useAuthStore();

  const handleAddUser = async () => {
    // Log to check if addUser is defined
    console.log('addUser function:', addUser);

    // Validate the fields
    if (!username || !email || !contact || !organisation || !designation || !location) {
      setError('All fields are required!');
      return;
    }

    setError(''); // Clear any previous error
    setLoading(true); // Set loading to true to show spinner

    const userData = {
      username,
      email,
      contact,
      organisation,
      designation,
      location,
    };

    console.log('User to add:', userData);

    try {
      // Check if addUser is a function
      if (typeof addUser !== 'function') {
        throw new Error('addUser function is not available or not a function');
      }

      const { success } = await addUser(userData);

      if (success) {
        console.log('User added successfully');
        setLoading(false);
        // router.push('/UsersList'); // Navigate to another screen (example) //TODO
      } else {
        console.log('Failed to add user');
        setLoading(false);
        setError('Failed to add user. Please try again.');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setLoading(false);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/0001.jpg')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-8 items-center justify-center`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-4xl font-bold text-white mb-5 py-10`}>Add User</Text>

        {/* Display error message */}
        {error ? <Text style={tw`text-red-500 mb-3`}>{error}</Text> : null}

        {/* Input Fields */}
        {[
          { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
          { icon: 'envelope', placeholder: 'Email', value: email, setter: setEmail, keyboardType: 'email-address' },
          { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact, keyboardType: 'phone-pad' },
          { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },
          { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
          {icon: 'lock', placeholder: 'Access Level'},
        ].map((field, idx) => (
            <View key={idx} style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
            <Icon name={field.icon} size={18} color="#999" style={tw`mr-2`} />
            <TextInput
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              value={field.value}
              onChangeText={field.setter}
              keyboardType={(field.keyboardType || 'default') as KeyboardTypeOptions}
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
              {locations.map((loc) => (
                <Picker.Item key={loc} label={loc} value={loc} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] rounded-full py-3 px-10 mt-5 w-full items-center`}
          onPress={handleAddUser}
          disabled={loading} // Disable the button while loading
        >
          <Text style={tw`text-white font-semibold text-base`}>
            {loading ? 'Adding User...' : 'Add User'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

export default AddUser;
