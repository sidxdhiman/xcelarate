import React, { useState } from 'react';
import axios from 'axios';
import {
  View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx'; // Import xlsx to parse Excel files
import tw from 'twrnc';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

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
  
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }as any);
  
        setLoading(true);
        const response = await uploadBulkUsers(formData); // send file as FormData
        setLoading(false);
  
        if (response.success) {
          toast.success('Users added successfully!');
        } else {
          toast.error('Failed to add users!');
        }
      }
    } catch (error) {
      console.error('File picking/upload error:', error);
      setLoading(false);
      toast.error('Failed to upload file!');
    }
  };
  

  return (
    <ImageBackground
      source={require('../../assets/images/0001.jpg')}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`p-8 items-center justify-center`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-2xl font-bold text-white mb-5`}>UPLOAD BULK USERS</Text>

        {/* Upload Button */}
        <TouchableOpacity
          style={tw`bg-[#800080] rounded-full py-3 px-10 mt-5 w-full items-center`}
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
