import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy'; // <- use legacy
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

const AddBulkUsers = () => {
    const { uploadBulkUsers } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleDownload = async () => {
        const fileUrl = 'https://raw.githubusercontent.com/sidxdhiman/xcelarate/main/client/assets/format_BulkUpload.xlsx';
        const fileName = 'format_BulkUpload.xlsx';
        const downloadUri = FileSystem.documentDirectory + fileName;

        if (Platform.OS === 'web') {
            try {
                const anchor = document.createElement('a');
                anchor.href = fileUrl;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
            } catch (err) {
                console.error('Web download error:', err);
                Alert.alert('Download Failed', 'Could not download file on web.');
            }
        } else {
            try {
                const result = await FileSystem.downloadAsync(fileUrl, downloadUri);
                Alert.alert('Download Complete', `Saved to: ${result.uri}`);
                console.log('File downloaded to:', result.uri);
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
            setLoading(true);

            let fileData;
            if (Platform.OS === 'web') {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('file', blob, file.name);
                fileData = formData;
            } else {
                const formData = new FormData();
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                fileData = formData;
            }

            const uploadResponse = await uploadBulkUsers(fileData);
            setLoading(false);

            if (uploadResponse?.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Users Added Successfully!',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to upload users!',
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon style={tw`pt-10`} name='arrow-left' size={22} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.headerArc}>
                <Text style={styles.headerText}>UPLOAD BULK</Text>
            </View>

            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                <Text style={styles.downloadButtonText}>Download Excel Sheet Format</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={handleFilePick} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Excel File</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    headerArc: { backgroundColor: '#800080', paddingVertical: 32, marginBottom: 10, paddingTop: 70, width: '100%' },
    headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 10, letterSpacing: 1 },
    uploadButton: { backgroundColor: '#800080', alignItems: 'center', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 40, marginTop: 20 },
    uploadButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    downloadButton: { backgroundColor: '#B300B3', alignItems: 'center', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 40, marginTop: 20 },
    downloadButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});

export default AddBulkUsers;
