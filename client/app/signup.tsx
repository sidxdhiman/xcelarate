import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { useAuthStore } from '../store/useAuthStore'; 
import { useRouter } from 'expo-router';  // Import router from expo-router

const SignUpScreen = () => {
  const signup = useAuthStore((state: { signup: any; }) => state.signup);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();  // Use router from expo-router

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    const signupData = {
      username,
      email,
      contact,
      organisation,
      designation,
      location: selectedLocation,
      password,
    };
  
    try {
      await signup(signupData);
      router.push('/landing');  // Use router.push to navigate to landing
    } catch (error) {
      console.log('Signup error:', error);
      // If your auth store already shows toast, no need for extra alert here
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/0001.jpg')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={tw`p-8 items-center justify-center`}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={tw`text-2xl font-bold text-white mb-5`}>SIGN UP</Text>

        {/* Username Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="user" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            style={tw`flex-1 text-black text-base`}
          />
        </View>

        {/* Email Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="envelope" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Email ID"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            style={tw`flex-1 text-black text-base`}
            keyboardType="email-address"
          />
        </View>

        {/* Contact Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="phone" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Contact Details"
            placeholderTextColor="#999"
            value={contact}
            onChangeText={setContact}
            style={tw`flex-1 text-black text-base`}
            keyboardType="phone-pad"
          />
        </View>

        {/* Organisation Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="building" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Organisation"
            placeholderTextColor="#999"
            value={organisation}
            onChangeText={setOrganisation}
            style={tw`flex-1 text-black text-base`}
          />
        </View>

        {/* Designation Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="briefcase" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Designation"
            placeholderTextColor="#999"
            value={designation}
            onChangeText={setDesignation}
            style={tw`flex-1 text-black text-base`}
          />
        </View>

        {/* Location Dropdown */}
        <View style={tw`w-full mt-2 mb-2`}>
          <Text style={tw`text-white mb-1 ml-1 font-semibold`}>Location</Text>
          <View style={tw`bg-white rounded-full h-11 justify-center px-3`}>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(itemValue) => setSelectedLocation(itemValue)}
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

        {/* Create Password Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="lock" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Create Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            style={tw`flex-1 text-black text-base`}
            secureTextEntry
          />
        </View>

        {/* Confirm Password Field */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <Icon name="lock" size={18} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={tw`flex-1 text-black text-base`}
            secureTextEntry
          />
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] rounded-full py-3 px-10 mt-5 w-full items-center`}
          onPress={handleSignup}
        >
          <Text style={tw`text-white font-semibold text-base`}>
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] rounded-full py-3 px-10 mt-4 w-full items-center`}
        >
          <Text style={tw`text-white font-semibold text-base`}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default SignUpScreen;
