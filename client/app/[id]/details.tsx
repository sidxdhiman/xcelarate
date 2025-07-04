import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

const UserDetailsScreen = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    if (!name || !designation || !email || !department || !phone) {
      alert('Please fill in all the details.');
      return;
    }

    router.push('/[q]');
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>User Details</Text>

        <View style={[styles.formContainer, { width: isMobile ? '100%' : '90%' }]}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Designation</Text>
          <TextInput
            style={styles.input}
            placeholder="Your role"
            placeholderTextColor="#aaa"
            value={designation}
            onChangeText={setDesignation}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            keyboardType="email-address"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Marketing, HR"
            placeholderTextColor="#aaa"
            value={department}
            onChangeText={setDepartment}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserDetailsScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f6efff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#800080',
    marginBottom: 10,
    textAlign: 'center',
  },
  formContainer: {
    maxWidth: 480,
  },
  label: {
    color: '#800080',
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 6,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderColor: '#800080',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#800080',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
