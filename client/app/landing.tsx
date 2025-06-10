import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').width;
const screenWidth = Dimensions.get('window').width;

const AdminPanel = ()=> {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/0001.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.topCurve}>
            <Text style={styles.headerText}>ADMIN PANEL</Text>
            {/* <Ionicons
              name="person-circle"
              size={28}
              color="#fff"
              style={styles.profileIcon}
            /> */}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/userManagement")}
          >
            <FontAwesome5 name="users" size={18} color="#000" />
            <Text style={styles.buttonText}>User Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}
            // style={styles.button}
            onPress={() => router.push('/test_pages/test_management')}
          >
            <MaterialIcons name="question-answer" size={20} color="#000" />
            <Text style={styles.buttonText}>Test Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Feather name="file-text" size={20} color="#000" />
            <Text style={styles.buttonText}>Fetch all reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}
          onPress={()=> router.push('/login')}
          >
            <Ionicons name="log-out-outline" size={20} color="#000" />
            <Text style={styles.buttonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
    width: screenWidth,
    // height: screenHeight,
  },
  headerContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 150,
  },
  topCurve: {
    backgroundColor: '#800080',
    width: '100%',
    height: 190,
    borderBottomLeftRadius: 350,
    borderBottomRightRadius: 350,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  buttonContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default AdminPanel;