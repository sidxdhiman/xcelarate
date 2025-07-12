import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Answer {
  questionText: string;
  selectedOption: string;
}

interface UserResponse {
  name: string;
  email: string;
  startedAt: string | null;
  submittedAt: string | null;
  location: { lat: number; lon: number } | null;
  answers: Answer[];
}

export default function TestResponses() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = decodeURIComponent(rawId?.trim() || '');
  console.log('Decoded and cleaned ID:', id);

  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const { getAssessmentById, getResponsesByAssessmentId } = useAssessmentStore();

  useEffect(() => {
    const fetchAssessmentAndResponses = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const assessment = await getAssessmentById(id);
        const rawResponses = await getResponsesByAssessmentId(id);

        const parsedResponses: UserResponse[] = rawResponses
          .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .map((res: any) => {
            const answers: Answer[] = Object.entries(res.answers || {}).map(
              ([questionText, answerObj]: [string, any]) => ({
                questionText,
                selectedOption: answerObj?.option || answerObj?.text || 'N/A',
              })
            );

            return {
              name: res.user?.name || 'Anonymous',
              email: res.user?.email || '',
              startedAt: res.startedAt || null,
              submittedAt: res.submittedAt || null,
              location: res.location || null,
              answers,
            };
          });

        setTitle(assessment?.title || 'Untitled');
        setResponses(parsedResponses);
      } catch (err) {
        console.error('Error loading responses:', err);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentAndResponses();
  }, [id]);

  const generatePDF = async (res: UserResponse, idx: number) => {
    const formattedAnswers = res.answers
      .map(
        (a, i) =>
          `<p><strong>Q${i + 1}:</strong> ${a.questionText}<br/><strong>A:</strong> ${a.selectedOption}</p>`
      )
      .join('');

    const htmlContent = `
      <div style="padding: 24px; font-family: Arial, sans-serif;">
        <h1 style="color: #800080; text-align: center;">Xcelarate</h1>
        <h2>User Details</h2>
        <p><strong>Name:</strong> ${res.name}</p>
        <p><strong>Email:</strong> ${res.email}</p>
        <p><strong>Started At:</strong> ${res.startedAt}</p>
        <p><strong>Submitted At:</strong> ${res.submittedAt}</p>
        <p><strong>Location:</strong> ${
          res.location
            ? `Latitude: ${res.location.lat}, Longitude: ${res.location.lon}`
            : 'null'
        }</p>

        <h2>Responses</h2>
        ${formattedAnswers}
      </div>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error('PDF generation failed:', err);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <ScrollView style={tw`bg-white`}>
      <View style={tw`px-4 pt-4`}>
        <Pressable onPress={() => router.back()} style={tw`mb-4`}>
          <Icon name="arrow-left" size={22} color="#800080" />
        </Pressable>

        <Text style={tw`text-2xl font-bold mb-4 text-purple-800`}>
          Responses for: {title}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#800080" />
        ) : responses.length === 0 ? (
          <Text style={tw`text-gray-600`}>No responses yet.</Text>
        ) : (
          responses.map((res, idx) => (
            <View key={idx} style={tw`bg-gray-100 rounded-md p-4 mb-3`}>
              <Text style={tw`text-base font-semibold text-purple-700`}>
                Name: {res.name}
              </Text>
              <Text style={tw`text-sm text-gray-700`}>
                Started At:{' '}
                {res.startedAt
                  ? new Date(res.startedAt).toLocaleString()
                  : 'null'}
              </Text>
              <Text style={tw`text-sm text-gray-700`}>
                Ended At:{' '}
                {res.submittedAt
                  ? new Date(res.submittedAt).toLocaleString()
                  : 'null'}
              </Text>
              <Text style={tw`text-sm text-gray-700 mb-2`}>
                Location:{' '}
                {res.location
                  ? `Latitude: ${res.location.lat}, Longitude: ${res.location.lon}`
                  : 'null'}
              </Text>

              {res.answers.map((ans, i) => (
                <View key={i} style={tw`mb-2`}>
                  <Text style={tw`font-medium`}>Q: {ans.questionText}</Text>
                  <Text style={tw`text-gray-700`}>
                    A: {ans.selectedOption}
                  </Text>
                </View>
              ))}

              <Pressable
                onPress={() => generatePDF(res, idx)}
                style={tw`bg-purple-800 rounded px-4 py-2 mt-2 self-start`}
              >
                <Text style={tw`text-white font-bold`}>Download as PDF</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
