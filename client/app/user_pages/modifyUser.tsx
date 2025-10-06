import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Pressable, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import Toast from 'react-native-toast-message';
import MobileDropdown from '@/app/MobileDropdown';
import axiosInstance from '@/lib/axios';

const ModifyUser = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const { modifyUser } = useAuthStore();

    const [username, setUsername] = useState('');
    const [contact, setContact] = useState('');
    const [organisation, setOrganisation] = useState('');
    const [designation, setDesignation] = useState('');
    const [location, setLocation] = useState('');
    const [accessLevel, setAccessLevel] = useState(1);
    const [loading, setLoading] = useState(false);

    const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

    useEffect(() => {
        const fetchUser = async () => {
            if (!email) return;
            try {
                const res = await axiosInstance.get(`/users/${email}/`);
                const user = Array.isArray(res.data) ? res.data[0] : res.data;
                if (!user) {
                    Toast.show({ type: 'error', text1: 'No user found with this email' });
                    return;
                }
                setUsername(user.username || '');
                setContact(user.contact || '');
                setOrganisation(user.organisation || '');
                setDesignation(user.designation || '');
                setLocation(user.location || '');
                setAccessLevel(user.accessLevel || 1);
            } catch (err) {
                console.error(err);
                Toast.show({ type: 'error', text1: 'Failed to fetch user details' });
            }
        };
        fetchUser();
    }, [email]);

    const handleModifyUser = async () => {
        if (!username || !contact || !organisation || !designation || !location || !accessLevel) {
            Toast.show({ type: 'error', text1: 'All fields are required!' });
            return;
        }
        setLoading(true);
        try {
            const res = await modifyUser(email as string, {
                username, email, contact, organisation, designation, location, accessLevel,
            });
            setLoading(false);
            if (res.success) {
                Toast.show({ type: 'success', text1: 'User Modified Successfully' });
                router.push('/user_pages/userList');
            } else {
                Toast.show({ type: 'error', text1: 'Failed to modify user' });
            }
        } catch (err) {
            setLoading(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please try again later.' });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Top purple header with margin */}
            <View style={styles.headerArc}>
                <Pressable style={styles.backBtn} onPress={() => router.push('/userManagement')}>
                    <Icon name="arrow-left" size={22} color="white" />
                </Pressable>
                <Text style={styles.headerText}>Modify User</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
                {/* Input Fields */}
                {[
                    { placeholder: 'Username', value: username, setter: setUsername },
                    { placeholder: 'Email', value: email, setter: () => {}, disabled: true },
                    { placeholder: 'Contact', value: contact, setter: setContact },
                    { placeholder: 'Organisation', value: organisation, setter: setOrganisation },
                    { placeholder: 'Designation', value: designation, setter: setDesignation },
                ].map((field, idx) => (
                    <TextInput
                        key={idx}
                        style={[styles.input, field.disabled && { color: '#aaa' }]}
                        value={field.value}
                        onChangeText={field.setter}
                        placeholder={field.placeholder}
                        placeholderTextColor="#999"
                        editable={!field.disabled}
                    />
                ))}

                {/* Location Dropdown */}
                <View style={styles.pickerWrapper}>
                    {Platform.OS === 'web' ? (
                        <select value={location} onChange={(e) => setLocation(e.target.value)} style={styles.webSelect}>
                            <option value="" disabled>Select Location</option>
                            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    ) : (
                        <MobileDropdown
                            data={locations.map((l, i) => ({ key: i, label: l }))}
                            initValue={location || 'Select a location'}
                            onChange={(option) => setLocation(option.label)}
                        />
                    )}
                </View>

                {/* Access Level */}
                <View style={styles.pickerWrapper}>
                    {Platform.OS === 'web' ? (
                        <select value={accessLevel} onChange={(e) => setAccessLevel(Number(e.target.value))} style={styles.webSelect}>
                            <option value={1}>Normal User</option>
                            <option value={5}>Super Admin</option>
                        </select>
                    ) : (
                        <MobileDropdown
                            data={[{ key: 1, label: 'Normal User' }, { key: 5, label: 'Super Admin' }]}
                            initValue={accessLevel === 1 ? 'Normal User' : 'Super Admin'}
                            onChange={(option) => setAccessLevel(Number(option.key))}
                        />
                    )}
                </View>

                {/* Save button */}
                <TouchableOpacity style={styles.button} onPress={handleModifyUser} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingBottom: 30, backgroundColor: 'rgba(0,0,0,0.1)' },
    headerArc: {
        backgroundColor: '#800080',
        paddingVertical: 40,
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 50,
        width: '100%',
    },
    backBtn: { position: 'absolute', left: 20, top: 20 },
    headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    card: { width: '100%', maxWidth: 350, backgroundColor: '#fff', borderRadius: 25, padding: 20, marginTop: -20, alignSelf: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
    input: { width: '100%', height: 45, borderRadius: 50, borderWidth: 2, borderColor: '#ccc', paddingHorizontal: 15, marginBottom: 15, color: '#000' },
    pickerWrapper: { width: '100%', marginBottom: 15 },
    webSelect: { width: '100%', height: 45, borderRadius: 50, borderWidth: 2, borderColor: '#ccc', paddingHorizontal: 15, fontSize: 16 },
    button: { width: '100%', borderRadius: 50, backgroundColor: '#740968', paddingVertical: 13, marginTop: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ModifyUser;
