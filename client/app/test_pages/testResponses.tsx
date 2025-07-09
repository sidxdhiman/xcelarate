import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';

interface Answer {
  questionText: string;
  selectedOption: string;
}

interface UserResponse {
  name: string;
  email: string;
  answers: Answer[];
}

export default function TestResponses() {
  const { id } = useLocalSearchParams<{ id: string }>();

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

        const parsedResponses: UserResponse[] = rawResponses.map((res: any) => {
          const answers: Answer[] = Object.entries(res.answers || {}).map(
            ([questionText, answerObj]: [string, any]) => ({
              questionText,
              selectedOption: answerObj?.option || 'N/A',
            })
          );

          return {
            name: res.user?.name || 'Anonymous',
            email: res.user?.email || '',
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
              <Text style={tw`text-base font-semibold text-purple-700 mb-2`}>
                Name: {res.name}
              </Text>
              {res.answers.map((ans, i) => (
                <View key={i} style={tw`mb-2`}>
                  <Text style={tw`font-medium`}>Q: {ans.questionText}</Text>
                  <Text style={tw`text-gray-700`}>A: {ans.selectedOption}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
