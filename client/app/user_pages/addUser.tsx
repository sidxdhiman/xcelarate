import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { KeyboardTypeOptions, Dimensions } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore'; 
import Toast from 'react-native-toast-message';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import MobileDropdown from '@/app/MobileDropdown';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const AddUser = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];
  const { addUser } = useAuthStore();

  const navigation = useNavigation();

  const handleAddUser = async () => {
    if (!username || !email || !contact || !organisation || !designation || !accessLevel || !location) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'All fields are required!' });
      return;
    }

    setError('');
    setLoading(true); 
    const userData = { username, email, contact, organisation, designation, accessLevel, location };

    try {
      if (typeof addUser !== 'function') throw new Error('addUser function is not available');
      const { success } = await addUser(userData);
      if (success) {
        setLoading(false);
        Toast.show({ type: 'success', text1: 'User added successfully!', text2: 'User has been added to the database' });
        router.push('/user_pages/userList');
      } else {
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Failed!', text2: 'Failed to add user. Please try again' });
      }
    } catch (err) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error!', text2: 'An error occurred. Please try again' });
    }
  };

  return (
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={tw`absolute top-4 left-4 z-10`}>
          <Pressable onPress={()=> router.push('/userManagement')}>
            <Icon style={tw`pt-10`} name='arrow-left' size={22} color='white'></Icon>
          </Pressable>
        </View>
        <View style={styles.headerArc}>
          <Text style={styles.headerText}>ADD USER</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {[
          { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
          { icon: 'envelope', placeholder: 'Email', value: email, setter: setEmail, keyboardType: 'email-address' },
          { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact, keyboardType: 'phone-pad' },
          { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },
          { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
          { icon: 'lock', placeholder: 'Access Level', value: accessLevel, setter: setAccessLevel },
        ].map((field, idx) => (
          <View key={idx} style={styles.inputContainer}>
            <Icon name={field.icon} size={18} color="#999" style={styles.icon} />
            <TextInput
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              value={field.value}
              onChangeText={field.setter}
              keyboardType={(field.keyboardType || 'default') as KeyboardTypeOptions}
              style={styles.input}
            />
          </View>
        ))}

          <View style={styles.pickerWrapper}>
              <Text style={styles.label}>Location</Text>
              {Platform.OS === 'web' ? (
                  <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={styles.webSelect}
                  >
                      <option value="">Select a location</option>
                      {locations.map((loc) => (
                          <option key={loc} value={loc}>
                              {loc}
                          </option>
                      ))}
                  </select>
              ) : (
                  <MobileDropdown
                      data={locations.map((l, i) => ({ key: i, label: l }))}
                      initValue="Select a location"
                      onChange={(option) => setLocation(option.label)}
                  />
              )}
          </View>

          <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddUser}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Adding User...' : 'Add User'}
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
    paddingTop: 70,
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
  errorText: {
    color: '#f87171',
    marginBottom: 12,
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
  pickerWrapper: {
    marginTop: 8,
    width: RFValue(300),
    marginBottom: 8,
  },
  label: {
    color: 'black',
    margin: 10,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  picker: {
    color: 'black',
    margin: 10
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
    webSelect: {
        width: RFValue(300),
        height: 44,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        paddingHorizontal: 12,
        fontSize: 16,
    },
});

export default AddUser;
