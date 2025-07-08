import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import { RFValue } from 'react-native-responsive-fontsize';
import { RouteProp } from '@react-navigation/native';
// import { SearchBar } from 'react-native-elements';
import { axiosInstance } from '@/lib/axios';
import { SearchBar } from 'react-native-elements';
import { Pressable } from 'react-native';
import tw from 'twrnc';

// Define your navigation stack param list type
type RootStackParamList = {
  ModifyUser: { email: string };
};

type ModifyUserRouteProp = RouteProp<RootStackParamList, 'ModifyUser'>;



const ModifyUser = ({ route }: { route?: ModifyUserRouteProp }) => {
  const initialEmail = route?.params?.email ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { fetchUserByEmail, modifyUser } = useAuthStore();
  
  const navigation = useNavigation();

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  useEffect(() => {
    if (!email) return;

    const fetchUser = async () => {
      try {
        const user = await fetchUserByEmail(email);
        if (user) {
          setUsername(user.username);
          setContact(user.contact);
          setOrganisation(user.organisation);
          setDesignation(user.designation);
          setLocation(user.location);
          setAccessLevel(user.accessLevel);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [email]);

  const handleModifyUser = async () => {
    if (!username || !email || !contact || !organisation || !designation || !accessLevel || !location) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'All fields are required!' });
      return;
    }

    const updatedUser = {
      username,
      email,
      contact,
      organisation,
      designation,
      accessLevel,
      location,
    };

    try {
      setLoading(true);
      const response = await modifyUser(email, updatedUser);
      setLoading(false);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'User Modified Successfully' });
        router.push('/user_pages/userList');
      } else {
        Toast.show({ type: 'error', text1: 'Failed to Modify User' });
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
        <Text style={styles.headerText}>MODIFY{"\n"}ASSESSMENT</Text>
      </View>
      <View style={styles.search}>
        <SearchBar
          placeholder="Search Tests here..."
          // onChangeText={(text: string) => setSearch(text)}
          // value={search}
          platform="default"
          containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
          inputContainerStyle={{ backgroundColor: '#fff' }}
          inputStyle={{ color: '#000' }}
          round
        />
        </View>

      {[
        { icon: 'user', placeholder: 'Test Title'},
        // { icon: 'envelope', placeholder: 'Questions' },
        // { icon: 'phone', placeholder: 'Contact'},
        // { icon: 'building', placeholder: 'Organisation'},
        // { icon: 'briefcase', placeholder: 'Designation'},
        // { icon: 'lock', placeholder: 'Access Level'},
        //-------------------------------------------------------------//
        // { icon: 'user', placeholder: 'Test Title', value: testTitle, setter: setUsername },
        // { icon: 'envelope', placeholder: 'Email', value: email, setter: setEmail },
        // { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact },
        // { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },    //TODO fix this 
        // { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
        // { icon: 'lock', placeholder: 'Access Level', value: accessLevel, setter: setAccessLevel },
      ].map((field, idx) => (
        <View key={idx} style={styles.inputContainer}>
          <Icon name={field.icon} size={18} color="#999" style={styles.icon} />
          <TextInput
            placeholder={field.placeholder}
            placeholderTextColor="#999"
            value={field.value}
            onChangeText={field.setter}
            style={styles.input}
          />
        </View>
      ))}

      {/* <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => setLocation(itemValue)}
            style={styles.picker}                                                        //TODO fix the location - not needed for test modification
            dropdownIconColor="#800080"
            mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
          >
            <Picker.Item label="Select a location" value="" />
            {locations.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} />
            ))}
          </Picker>
        </View>
      </View> */}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleModifyUser}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: 'center'
  },
  search: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 5,
    paddingHorizontal: 1,
    width: RFValue(300)
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
});

export default ModifyUser;

