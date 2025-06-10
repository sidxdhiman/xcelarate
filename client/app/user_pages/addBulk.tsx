import React, { useState } from 'react';
import axios from 'axios';
import {
  View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx'; // Import xlsx to parse Excel files
import tw from 'twrnc';
// import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const AddBulkUsers = () => {
  const { uploadBulkUsers } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      });
  
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
  
        // Convert the base64 URI into a Blob
        const base64String = file.uri.split(',')[1]; // Remove the "data:" prefix
        const byteCharacters = atob(base64String); // Decode base64 to byte string
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
  
        // Create FormData and append the file
        const formData = new FormData();
        formData.append('file', blob, file.name); // Append Blob and file name
  
        setLoading(true);
  
        // Call the store's uploadBulkUsers method
        const uploadResponse = await uploadBulkUsers(formData); // send file as FormData
        setLoading(false);
  
        if (uploadResponse.success) {
          // router.push('/user_pages/userList')
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
    <ImageBackground
      source={require('../../assets/images/0001.jpg')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-8 items-center justify-center`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-4xl font-bold text-white mb-5 py-10`}>Upload bulk users</Text>

        {/* Upload Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] flex items-center rounded-full py-3 px-10 mt-5 w-full`}
          onPress={handleFilePick}
          disabled={loading} // Disable the button while loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold text-base`}>
              Upload Excel File
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default AddBulkUsers;
