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
import { Platform, Linking } from 'react-native';


const AddBulkUsers = () => {
  const { uploadBulkUsers } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleDownload = async () => {
    const fileUrl = 'https://raw.githubusercontent.com/sidxdhiman/xcelarate/main/client/assets/format_BulkUpload.xlsx';
    const fileName = 'format_BulkUpload.xlsx';

    if (Platform.OS === 'web') {
      // Use browser's download functionality
      try {
        const anchor = document.createElement('a');
        anchor.href = fileUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        console.log('Web download triggered.');
      } catch (err) {
        console.error('Web download error:', err);
        Alert.alert('Download Failed', 'Could not download file on web.');
      }
    } else {
      // Native mobile download using expo-file-system
      try {
        const downloadPath = FileSystem.documentDirectory + fileName;
        const result = await FileSystem.downloadAsync(fileUrl, downloadPath);
        console.log('File downloaded to:', result.uri);
        Alert.alert('Download Complete', `Saved to: ${result.uri}`);
      } catch (err) {
        console.error('Native download error:', err);
        Alert.alert('Download Failed', 'Could not download file on device.');
      }
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      console.log('Selected file:', file);

      setLoading(true);

      // ✅ Web: use fetch() to get blob
      let fileData;
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('file', blob, file.name);
        fileData = formData;
      }
      // ✅ Native (mobile): use FileSystem to read the file
      else {
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fileData = formData;
      }

      // ✅ Upload via store function
      const uploadResponse = await uploadBulkUsers(fileData);
      setLoading(false);

      if (uploadResponse?.success) {
        Toast.show({
          type: 'success',
          text1: 'Users Added Successfully!',
        });
      } else {
        router.push('/user_pages/userList');
        Toast.show({
          type: 'success',
          text1: 'Users Added Successfully',
        });
      }
    } catch (error) {
      console.error('File picking/upload error:', error);
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Failed to upload file!',
      });
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
        <Text style={styles.downloadButtonText}>Download Excel Sheet Format</Text>
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
