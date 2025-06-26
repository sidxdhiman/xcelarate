import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RFValue } from 'react-native-responsive-fontsize';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';

// Adjust the import path to match your project structure
import { useAuthStore } from '@/store/useAuthStore';

const SignUpScreen = () => {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  const handleSignup = async () => {
    // Validation
    if (!username || !email || !contact || !organisation || !designation || !password) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all required fields.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Signup Error', text2: 'Passwords do not match!' });
      return;
    }

    const signupData = { username, email, contact, organisation, designation, location, password };

    try {
      await signup(signupData);
      Toast.show({ type: 'success', text1: 'Signup Successful', text2: 'Welcome aboard!' });
      router.push('/landing');
    } catch (err) {
      const error = err as AxiosError;
      console.log('Signup error:', error);
      Toast.show({ type: 'error', text1: 'Signup Failed', text2: 'Something went wrong. Try again.' });
      Alert.alert('Signup Failed', 'Please try again later.');
    }
  };

  return (
    <ImageBackground source={require('../assets/images/0003.png')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Title Logo */}
        <Image source={require('../assets/images/title-logos/title.png')} style={styles.titleLogo} />

        {/* Powered By */}
        <View style={styles.bottomRight}>
          <Text style={styles.subtitle}>Powered By </Text>
          <Image source={require('../assets/images/Xebia.png')} style={styles.logo} />
        </View>

        <Text style={styles.header}>Sign Up</Text>

        {/* Username */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email ID"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Contact */}
        <TextInput
          style={styles.input}
          placeholder="Contact Details"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />

        {/* Organisation */}
        <TextInput
          style={styles.input}
          placeholder="Organisation"
          placeholderTextColor="#999"
          value={organisation}
          onChangeText={setOrganisation}
        />

        {/* Designation */}
        <TextInput
          style={styles.input}
          placeholder="Designation"
          placeholderTextColor="#999"
          value={designation}
          onChangeText={setDesignation}
        />

        {/* Location Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => setLocation(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
            mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
          >
            <Picker.Item label="Select a location" value="" color="#999" />
            {locations.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} color="#000" />
            ))}
          </Picker>
        </View>

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Create Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password */}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Login redirect */}
        <Text style={styles.haveAccount}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>
            Log in
          </Text>
        </Text>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  titleLogo: {
    marginTop: 120,
    width: RFValue(250),
    height: RFValue(22),
    resizeMode: 'cover',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginRight: 5,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  input: {
    width: 340,
    height: 45,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
  },
  pickerWrapper: {
    width: 340,
    height: 45,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 50,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 0,
    marginBottom: 15,
    justifyContent: 'center',
  },
  picker: {
    borderRadius: 50,
    // color: '',
    width: '100%',
    height: '100%',
  },
  signupButton: {
    backgroundColor: '#740968',
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 15,
  },
  signupButtonText: {
    fontWeight: '300',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  haveAccount: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  link: {
    color: 'white',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
