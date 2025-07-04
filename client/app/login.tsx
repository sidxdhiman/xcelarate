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
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import Toast from "react-native-toast-message";
import { RFValue } from 'react-native-responsive-fontsize';
import { Dimensions } from 'react-native';
import { AxiosError } from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoggingIn } = useAuthStore(); 
    const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'Please fill all the Fields',
      });
      Alert.alert('Invalid Credentials', 'Please enter both email and password.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    try {
      const response = await login({ email, password });

      if (response?.success && response?.accessLevel !== undefined) {
        const accessLevel = response.accessLevel;

        Toast.show({
          type: 'success',
          text1: 'Login Successful!',
          text2: 'You have been logged in',
        });
        router.push('/userLanding')

        if (accessLevel === '1' || accessLevel === 1) {
          router.push('/userLanding');
        } else {
          router.push('/landing');
        }
      } else {
        console.log('Login failed response:', response);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid email or password. Please try again.',
        });
        Alert.alert('Login Failed', 'Please check your credentials and try again.');
      }
      } catch (err) {
        const error = err as AxiosError;

        console.log('Login error:', error);
        console.log('Login error response:', error.response); // now allowed

        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'There was an issue logging you in. Please try again later.',
        });

        Alert.alert('Login Failed', 'Please check your credentials and try again.');
      }
  };

  return (
    <ImageBackground source={require('../assets/images/0003.png')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* <Text style={styles.title}>XCELARATE</Text> */}
        <Image 
          source={require('../assets/images/title-logos/title.png')}
          style={styles.titleLogo}
        />
        <View style={styles.bottomRight}>
          <Text style={styles.subtitle}>Powered By </Text>
          <Image source={require('../assets/images/Xebia.png')} style={styles.logo} />
        </View>
        <Text style={styles.loginHeader}>Log in</Text>
        <TextInput
          style={styles.input}
          placeholder="Email ID"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.forgotPasswordWrapper}>
          <TouchableOpacity onPress={() => console.log('Forgot Password')}>
            <Text numberOfLines={1} style={styles.forgotPassword}>
              Forgot Your Password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
            <View style={[styles.customCheckbox, rememberMe && styles.checkedCheckbox]}>
              {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Remember for 30 Days</Text>
        </View>

        {/* Disable the button while logging in */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoggingIn}>
          <Text style={styles.loginButtonText}>{isLoggingIn ? 'Logging In...' : 'Log In'}</Text>
        </TouchableOpacity>

        <Text style={styles.newAccount}>
          New Here?{' '}
          <Text style={styles.link} onPress={() => router.push('/signup')}>
            Create an Account
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
    height: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: RFValue(30),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    textAlign: 'center',
    marginTop: 50
  },
  titleLogo: {
    marginTop: 150,
    width: RFValue(250),
    height: RFValue(22),
    resizeMode: 'cover'
  },
  bottomRight: {  // Add the 'bottomRight' style here
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row', 
    alignItems: 'center',  // Ensures the text and image are aligned
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginRight: 5
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  loginHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 100,
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
  forgotPasswordWrapper: {
    width: 340,
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    fontSize: 14,
    paddingRight: 5,
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#740968',
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  loginButtonText: {
    fontWeight: '300',
    fontSize: 16,
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#007bff',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 14,
  },
  checkboxLabel: {
    alignItems: 'center',
    fontSize: 14,
    color: '#FFFFFF',
  },
  newAccount: {
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

export default LoginScreen;


