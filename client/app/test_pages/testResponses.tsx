import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function TestResponses() {
    const { id: rawId } = useLocalSearchParams<{ id: string }>();
    const id = decodeURIComponent(rawId?.trim() || '');
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [title, setTitle] = useState('');

    const {
        fetchAssessmentById,
        fetchAssessmentResponses,
        downloadAssessmentPdf,
        assessmentResponses
    } = useAssessmentStore();

    // Fetch assessment info + responses
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchAssessmentById(id);
                setTitle(data?.title || 'Untitled');
                await fetchAssessmentResponses(id); // fetch all responses
            } catch (err) {
                console.error('Error fetching assessment:', err);
                Alert.alert('Error', 'Failed to load assessment info.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

                    {assessmentResponses.length ? (
                        assessmentResponses.map((resp: any, idx: number) => (
                            <View key={idx} style={tw`border p-3 rounded mb-3`}>
                                <Text style={tw`font-semibold text-purple-700`}>
                                    User: {resp.user?.name || 'Anonymous'}
                                </Text>
                                <Text style={tw`text-gray-700`}>
                                    Submitted At: {new Date(resp.submittedAt).toLocaleString()}
                                </Text>
                                {Object.entries(resp.answers).map(([qKey, ans]: [string, any]) => (
                                    <View key={qKey} style={tw`mt-2`}>
                                        <Text style={tw`font-semibold`}>Q: {qKey}</Text>
                                        {ans.option && <Text>A: {ans.option}</Text>}
                                        {ans.text && <Text>A: {ans.text}</Text>}
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={tw`text-gray-600 mb-4`}>No responses yet.</Text>
                    )}

                    <Pressable
                        onPress={handleDownloadPDF}
                        style={tw`bg-purple-700 px-3 py-2 rounded-md mb-4`}
                        disabled={pdfLoading}
                    >
                        <Text style={tw`text-white font-semibold text-center`}>
                            {pdfLoading ? 'Downloading...' : 'Download All Responses PDF'}
                        </Text>
                    </Pressable>
                </>
            )}
        </ScrollView>
    );
}