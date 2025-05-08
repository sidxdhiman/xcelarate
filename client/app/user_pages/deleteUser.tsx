import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView,
} from 'react-native';
import tw from 'twrnc';
import { useAuthStore } from '../../store/useAuthStore'; // Assuming your auth store is in this path

const DeleteUser = () => {
  const [email, setEmail] = useState(''); // Store email here
  const [loading, setLoading] = useState(false);

  const { deleteUser } = useAuthStore(); // Using deleteUser from your store

  const handleDeleteUser = async () => {
    if (!email) {
      alert("Please enter the user email.");
      return;
    }

    setLoading(true);
    try {
      const response = await deleteUser(email); // Pass email to deleteUser
      if (response.success) {
        console.log('User deleted successfully');
        alert("User deleted successfully.");
        setEmail(''); // Clear input field after successful deletion
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Error deleting user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/0002.png')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-8 items-center justify-center`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-4xl font-bold text-white mb-5 py-10`}>Delete User</Text>

        {/* Email Input */}
        <View style={tw`flex-row bg-white rounded-full px-4 items-center my-2 h-11 w-full`}>
          <TextInput
            placeholder="Enter User Email"
            placeholderTextColor="#999"
            value={email} // Using email instead of userId
            onChangeText={setEmail} // Update email state
            style={tw`flex-1 text-black text-base`}
          />
        </View>

        {/* Confirm Delete Button */}
        <TouchableOpacity
          style={tw`bg-red-600 rounded-full py-3 px-10 mt-5 w-full items-center`}
          onPress={handleDeleteUser}
          disabled={loading}
        >
          <Text style={tw`text-white font-semibold text-base`}>
            {loading ? 'Deleting...' : 'Delete User'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

export default DeleteUser;
