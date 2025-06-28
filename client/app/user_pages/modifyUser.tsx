// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Platform,
//   Pressable,
//   useWindowDimensions,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { useRouter } from 'expo-router';
// import { useAuthStore } from '../../store/useAuthStore';
// import Toast from 'react-native-toast-message';
// import { SearchBar } from 'react-native-elements';
// import { RouteProp, useNavigation } from '@react-navigation/native';
// import { axiosInstance } from '@/lib/axios';

// type RootStackParamList = {
//   ModifyUser: { email: string };
// };

// type ModifyUserRouteProp = RouteProp<RootStackParamList, 'ModifyUser'>;

// const ModifyUser = ({ route }: { route?: ModifyUserRouteProp }) => {
//   const initialEmail = route?.params?.email ?? '';

//   const [email, setEmail] = useState(initialEmail);
//   const [username, setUsername] = useState('');
//   const [contact, setContact] = useState('');
//   const [organisation, setOrganisation] = useState('');
//   const [designation, setDesignation] = useState('');
//   const [location, setLocation] = useState('');
//   const [accessLevel, setAccessLevel] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [userSuggestions, setUserSuggestions] = useState<any[]>([]);

//   const router = useRouter();
//   const navigation = useNavigation();
//   const { modifyUser } = useAuthStore();
//   const { width } = useWindowDimensions();
//   const isMobile = width < 600;

//   const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (!search.trim()) {
//         setUserSuggestions([]);
//         return;
//       }
//       try {
//         const res = await axiosInstance.get(`/users?search=${search}`);
//         setUserSuggestions(res.data);
//       } catch (error) {
//         console.error('Failed to fetch suggestions:', error);
//       }
//     };
//     const debounce = setTimeout(fetchSuggestions, 300);
//     return () => clearTimeout(debounce);
//   }, [search]);

//   const handleUserSelect = (user: any) => {
//     setSearch(user.email);
//     setUserSuggestions([]);
//     setUsername(user.username);
//     setEmail(user.email);
//     setContact(user.contact);
//     setOrganisation(user.organisation);
//     setDesignation(user.designation);
//     setLocation(user.location);
//     setAccessLevel(user.accessLevel);
//   };

//   const handleModifyUser = async () => {
//     if (!username || !email || !contact || !organisation || !designation || !accessLevel || !location) {
//       Toast.show({ type: 'error', text1: 'All fields are required!' });
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await modifyUser(email, {
//         username, email, contact, organisation, designation, location, accessLevel,
//       });
//       setLoading(false);

//       if (res.success) {
//         Toast.show({ type: 'success', text1: 'User Modified Successfully' });
//         router.push('/user_pages/userList');
//       } else {
//         Toast.show({ type: 'error', text1: 'Failed to Modify User' });
//       }
//     } catch (error) {
//       setLoading(false);
//       Toast.show({ type: 'error', text1: 'Error', text2: 'Please try again later.' });
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.backBtn}>
//         <Pressable onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={22} color="white" />
//         </Pressable>
//       </View>

//       <View style={styles.header}>
//         <Text style={styles.headerText}>MODIFY USER</Text>
//       </View>

//       <View style={[styles.searchBox, !isMobile && styles.desktopBox]}>
//         <SearchBar
//           placeholder="Search users here..."
//           value={search}
//           onChangeText={setSearch}
//           platform="default"
//           round
//           containerStyle={styles.searchBarContainer}
//           inputContainerStyle={styles.searchInputContainer}
//           inputStyle={styles.searchInput}
//         />
//       </View>

//       {userSuggestions.map((user, index) => (
//         <TouchableOpacity
//           key={index}
//           style={[styles.suggestion, !isMobile && styles.desktopBox]}
//           onPress={() => handleUserSelect(user)}
//         >
//           <Text style={styles.suggestionText}>{user.username} ({user.email})</Text>
//         </TouchableOpacity>
//       ))}

//       {[
//         { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
//         { icon: 'envelope', placeholder: 'Email', value: email, setter: setEmail },
//         { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact },
//         { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },
//         { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
//         { icon: 'lock', placeholder: 'Access Level', value: accessLevel, setter: setAccessLevel },
//       ].map((field, idx) => (
//         <View key={idx} style={[styles.inputGroup, !isMobile && styles.desktopBox]}>
//           <Icon name={field.icon} size={18} color="#999" style={styles.icon} />
//           <TextInput
//             placeholder={field.placeholder}
//             placeholderTextColor="#999"
//             value={field.value}
//             onChangeText={field.setter}
//             style={styles.input}
//           />
//         </View>
//       ))}

//       <View style={[styles.inputGroup, !isMobile && styles.desktopBox]}>
//         <Icon name="map-marker" size={18} color="#999" style={styles.icon} />
//         <Picker
//           selectedValue={location}
//           onValueChange={(itemValue) => setLocation(itemValue)}
//           style={styles.picker}
//           mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
//         >
//           <Picker.Item label="Select a location" value="" />
//           {locations.map((loc) => (
//             <Picker.Item key={loc} label={loc} value={loc} />
//           ))}
//         </Picker>
//       </View>

//       <TouchableOpacity
//         style={[styles.button, !isMobile && styles.desktopBox]}
//         onPress={handleModifyUser}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>
//           {loading ? 'Saving...' : 'Save Changes'}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     alignItems: 'center',
//     paddingBottom: 40,
//     backgroundColor: '#f2f2f2',
//     minHeight: '100%',
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     zIndex: 10,
//   },
//   header: {
//     backgroundColor: '#800080',
//     width: '100%',
//     alignItems: 'center',
//     paddingVertical: 30,
//     marginBottom: 10,
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 26,
//     fontWeight: 'bold',
//   },
//   searchBox: {
//     width: '92%',
//     marginBottom: 10,
//   },
//   desktopBox: {
//     width: 500,
//   },
//   searchBarContainer: {
//     backgroundColor: 'transparent',
//     borderTopWidth: 0,
//     borderBottomWidth: 0,
//   },
//   searchInputContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 30,
//     paddingHorizontal: 10,
//   },
//   searchInput: {
//     color: '#000',
//   },
//   suggestion: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 6,
//     marginBottom: 5,
//   },
//   suggestionText: {
//     color: 'black',
//   },
//   inputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     height: 44,
//     marginVertical: 8,
//     width: '92%',
//   },
//   icon: {
//     marginRight: 8,
//     color: 'black',
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: 'black',
//   },
//   picker: {
//     flex: 1,
//     color: 'black',
//   },
//   button: {
//     backgroundColor: '#800080',
//     borderRadius: 10,
//     paddingVertical: 12,
//     marginTop: 20,
//     alignItems: 'center',
//     width: '92%',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default ModifyUser;






import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from '@/lib/axios';

const ModifyUser = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const navigation = useNavigation();
  const router = useRouter();
  const { email } = useLocalSearchParams(); // ✅ email from route param

  const { modifyUser } = useAuthStore();

  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) return;
  
        const res = await axiosInstance.get(`/users/${email}/`);
        console.log("🚀 FULL USER RESPONSE:", res.data);
  
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
        setAccessLevel(user.accessLevel || '');
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        Toast.show({ type: 'error', text1: 'Error loading user details' });
      }
    };
  
    fetchUser();
  }, [email]);
  
  

  const handleModifyUser = async () => {
    if (!username || !email || !contact || !organisation || !designation || !accessLevel || !location) {
      Toast.show({ type: 'error', text1: 'All fields are required!' });
      return;
    }

    try {
      setLoading(true);
      const res = await modifyUser(email as string, {
        username,
        email,
        contact,
        organisation,
        designation,
        location,
        accessLevel,
      });

      setLoading(false);

      if (res.success) {
        Toast.show({ type: 'success', text1: 'User Modified Successfully' });
        router.push('/user_pages/userList');
      } else {
        Toast.show({ type: 'error', text1: 'Failed to Modify User' });
      }
    } catch (error) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please try again later.' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.backBtn}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="white" />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>MODIFY USER</Text>
      </View>

      {[
        { icon: 'user', placeholder: 'Username', value: username, setter: setUsername },
        { icon: 'envelope', placeholder: 'Email', value: email, setter: () => {} }, // Readonly
        { icon: 'phone', placeholder: 'Contact', value: contact, setter: setContact },
        { icon: 'building', placeholder: 'Organisation', value: organisation, setter: setOrganisation },
        { icon: 'briefcase', placeholder: 'Designation', value: designation, setter: setDesignation },
        { icon: 'lock', placeholder: 'Access Level', value: accessLevel, setter: setAccessLevel },
      ].map((field, idx) => (
        <View key={idx} style={[styles.inputGroup, !isMobile && styles.desktopBox]}>
          <Icon name={field.icon} size={18} color="#999" style={styles.icon} />
          <TextInput
            placeholder={field.placeholder}
            placeholderTextColor="#999"
            value={field.value?.toString()}
            onChangeText={field.setter}
            style={[styles.input, field.placeholder === 'Email' && { color: '#aaa' }]}
            editable={field.placeholder !== 'Email'}
          />
        </View>
      ))}

      {/* Location Picker */}
      <View style={[styles.inputGroup, !isMobile && styles.desktopBox]}>
        <Icon name="map-marker" size={18} color="#999" style={styles.icon} />
        <Picker
          selectedValue={location}
          onValueChange={(itemValue) => setLocation(itemValue)}
          style={styles.picker}
          dropdownIconColor="#800080"
          mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
        >
          <Picker.Item label="Select a location" value="" />
          {locations.map((loc) => (
            <Picker.Item key={loc} label={loc} value={loc} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, !isMobile && styles.desktopBox]}
        onPress={handleModifyUser}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: '#f2f2f2',
    minHeight: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  header: {
    backgroundColor: '#800080',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  desktopBox: {
    width: 500,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginVertical: 8,
    width: '92%',
  },
  icon: {
    marginRight: 8,
    color: 'black',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  picker: {
    flex: 1,
    color: 'black',
  },
  button: {
    backgroundColor: '#800080',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
    width: '92%',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ModifyUser;
