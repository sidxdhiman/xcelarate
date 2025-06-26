import React, { useState } from 'react';
import axios from 'axios';
import {
  View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator, StyleSheet, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import tw from 'twrnc';
// import * as XLSX from 'xlsx';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as FileSystem from "expo-file-system";


const AddBulkUsers = () => {
  const { uploadBulkUsers } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleDownload = async () => {
    try {
      const fileId = "1fYYNYzSQ5vk4Hw8vzTu8XEZLgZyAiei8";
      const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const fileName = "format_BulkUpload.xlsx";
      const downloadPath = FileSystem.documentDirectory + fileName;

      const result = await FileSystem.downloadAsync(fileUrl, downloadPath);
      console.log('File downloaded to:', result.uri);

      Alert.alert('Download Complete', `Saved to: ${result.uri}`);
    } catch (error) {
      console.error('Download Error:', error)
      Alert.alert('Download Failed', 'There was a problem downloading the file!');
    }
  };


  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);

        const base64String = file.uri.split(',')[1];
        const byteCharacters = atob(base64String); 
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: file.mimeType });

        const formData = new FormData();
        formData.append('file', blob, file.name);

        setLoading(true);

        const uploadResponse = await uploadBulkUsers(formData);
        setLoading(false);

        if (uploadResponse.success) {
          Toast.show({
            type: 'success',
            text1: 'Users Added Successfully!'
          })
        } else {
          router.push('/user_pages/userList')
          Toast.show({
            type: 'success',
            text1: 'Users Added Successfully'
          })
        }
      }
    } catch (error) {
      console.error('File picking/upload error:', error);
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Failed to upload file!'
      })
    }
  };  

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={()=> navigation.goBack()}>
          <Icon name='arrow-left' size={22} color="white"></Icon>
        </Pressable>
      </View>
      <View style={styles.headerArc}>
                <Text style={styles.headerText}>UPLOAD BULK</Text>
        </View>
      <TouchableOpacity
      style={styles.downloadButton}
      onPress={handleDownload}
      >
        <Text style={styles.downloadButtonText}>Download Xcel Sheet Format</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleFilePick}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>
            Upload Excel File
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
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
  uploadButton: {
    backgroundColor: '#800080',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: '#B300B3',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
});

export default AddBulkUsers;
