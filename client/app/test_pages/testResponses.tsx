import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function TestResponses() {
    const { id: rawId } = useLocalSearchParams<{ id: string }>();
    const id = decodeURIComponent(rawId?.trim() || '');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [search, setSearch] = useState('');

    const { fetchAssessmentById, downloadAssessmentPdf } = useAssessmentStore();

    useEffect(() => {
        const fetchAssessment = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const assessment = await fetchAssessmentById(id);
                setTitle(assessment?.title || 'Untitled');
            } catch (err) {
                console.error('Error fetching assessment:', err);
                Alert.alert('Error', 'Failed to load assessment info.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!id) return;
        setPdfLoading(true);
        try {
            await downloadAssessmentPdf(id);
            Alert.alert('Success', 'PDF downloaded successfully!');
        } catch (err) {
            console.error('PDF download error:', err);
            Alert.alert('Error', 'Failed to download PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <ScrollView style={tw`bg-white px-4 pt-4`}>
            <Pressable onPress={() => router.back()} style={tw`mb-4`}>
                <Icon name="arrow-left" size={22} color="#800080" />
            </Pressable>

            {loading ? (
                <ActivityIndicator size="large" color="#800080" />
            ) : (
                <>
                    <Text style={tw`text-2xl font-bold mb-4 text-purple-800`}>
                        Responses for: {title}
                    </Text>

                    <TextInput
                        placeholder="Search (not used)"
                        value={search}
                        onChangeText={setSearch}
                        style={tw`border border-gray-300 rounded-md px-3 py-2 mb-4`}
                    />

                    <Pressable
                        onPress={handleDownloadPDF}
                        style={tw`bg-purple-700 px-3 py-2 rounded-md mb-4`}
                        disabled={pdfLoading}
                    >
                        <Text style={tw`text-white font-semibold text-center`}>
                            {pdfLoading ? 'Downloading...' : 'Download All Responses PDF'}
                        </Text>
                    </Pressable>

                    <Text style={tw`text-gray-600`}>All responses will be included in the PDF.</Text>
                </>
            )}
        </ScrollView>
    );
}
