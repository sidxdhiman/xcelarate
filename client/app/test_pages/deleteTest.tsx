import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import { RFValue } from 'react-native-responsive-fontsize';
import { Pressable } from 'react-native';
import tw from 'twrnc';

const DeleteUser = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { deleteUser } = useAuthStore();
  const navigation = useNavigation();

  const handleDeleteUser = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Email is required!' });
      return;
    }

    try {
      setLoading(true);
      const response = await deleteUser(email);
      setLoading(false);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'User Deleted Successfully' });
        setEmail('');
        router.push('/user_pages/userList');
      } else {
        Toast.show({ type: 'error', text1: 'Failed to Delete User' });
      }
    } catch (error) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred. Please try again' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={()=> router.push('/test_pages/test_management')}>
          <Icon name='arrow-left' size={22} color="white"></Icon>
        </Pressable>
      </View>
      <View style={styles.headerArc}>
        <Text style={styles.headerText}>ARCHIVE{"\n"}ASSESSMENT</Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="file" size={18} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Enter Test Title or ID"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleDeleteUser}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Deleting User...' : 'Delete User'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: 'center'
  },
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    marginBottom: 10,
    width: '100%'
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    height: 44,
    width: RFValue(300)
  },
  icon: {
    marginRight: 8,
    color: 'black'
  },
  input: {
    flex: 1,
    color: 'black',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#800080',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    margin: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DeleteUser;

