import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ImageBackground, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/useAuthStore';
import MobileDropdown from './MobileDropdown';

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
    const accessLevel = 1; // fixed as normal user

    const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

    const handleSignup = async () => {
        if (!username || !email || !contact || !organisation || !designation || !password) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all required fields.' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Signup Error', text2: 'Passwords do not match!' });
            return;
        }
        await signup({ username, email, contact, organisation, designation, location, password, accessLevel });
        router.push('/landing');
    };

    return (
        <ImageBackground source={require('../assets/images/0003.png')} style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Image source={require('../assets/images/title-logos/title.png')} style={styles.titleLogo} />
                <View style={styles.bottomRight}>
                    <Text style={styles.subtitle}>Powered By </Text>
                    <Image source={require('../assets/images/Xebia.png')} style={styles.logo} />
                </View>

                <Text style={styles.header}>Sign Up</Text>

                <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#999" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="Email ID" placeholderTextColor="#999" keyboardType="email-address" value={email} onChangeText={setEmail} />
                <TextInput style={styles.input} placeholder="Contact Details" placeholderTextColor="#999" keyboardType="phone-pad" value={contact} onChangeText={setContact} />
                <TextInput style={styles.input} placeholder="Organisation" placeholderTextColor="#999" value={organisation} onChangeText={setOrganisation} />
                <TextInput style={styles.input} placeholder="Designation" placeholderTextColor="#999" value={designation} onChangeText={setDesignation} />

                <View style={styles.pickerWrapper}>
                    {Platform.OS === 'web' ? (
                        <select value={location} onChange={(e) => setLocation(e.target.value)} style={styles.webSelect}>
                            <option value="" disabled>Select a location</option>
                            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    ) : (
                        <MobileDropdown
                            data={locations.map((l, i) => ({ key: i, label: l }))}
                            initValue="Select a location"
                            onChange={(option) => setLocation(option.label)}
                        />
                    )}
                </View>

                <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
                <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#999" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

                <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                    <Text style={styles.signupButtonText}>Create Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, resizeMode: 'cover', width: '100%', height: '100%' },
    container: { flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 30 },
    titleLogo: { marginTop: 60, width: RFValue(250), height: RFValue(22), resizeMode: 'cover' },
    bottomRight: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
    subtitle: { fontSize: 14, color: '#fff', marginRight: 5 },
    logo: { width: 70, height: 70, resizeMode: 'contain' },
    header: { fontSize: 20, fontWeight: 'bold', color: '#fff', alignSelf: 'center', marginBottom: 20, marginTop: 30 },
    input: { width: '100%', maxWidth: 340, height: 45, borderColor: '#fff', borderWidth: 2, borderRadius: 50, paddingHorizontal: 15, marginBottom: 15, color: '#fff' },
    pickerWrapper: { width: '100%', maxWidth: 340, marginBottom: 15 },
    webSelect: { width: '100%', height: 45, borderRadius: 50, borderWidth: 2, borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 15, fontSize: 16 },
    signupButton: { backgroundColor: '#740968', borderRadius: 50, paddingVertical: 13, paddingHorizontal: 40, marginTop: 10, marginBottom: 15 },
    signupButtonText: { fontWeight: '300', fontSize: 16, color: '#fff', textAlign: 'center' },
});

export default SignUpScreen;
