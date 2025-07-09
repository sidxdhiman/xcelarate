import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { axiosInstance } from '@/lib/axios';

interface Answer {
  questionText: string;
  selectedOption: string;
}

interface UserResponse {
  name: string;
  email: string;
  answers: Answer[];
}

interface Assessment {
  _id: string;
  title: string;
}

const TestResponses = () => {
  const [allTests, setAllTests] = useState<Assessment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Assessment[]>([]);
  const [selectedTest, setSelectedTest] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [respLoading, setRespLoading] = useState(false);

  const { getAssessmentById, getResponsesByAssessmentId } = useAssessmentStore();

  useEffect(() => {
  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/assessments');
      setAllTests(res.data.reverse());
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchTests();
}, []);


  const getAllAssessments = async () => {
  setLoading(true);
  try {
    const res = await axiosInstance.get('/assessments');
    setAllTests(res.data.reverse());
  } catch (err) {
    console.error('Error fetching assessments:', err);
    } finally {
        setLoading(false);
    }
    };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = allTests.filter((test) =>
      test.title.toLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelectAssessment = async (test: Assessment) => {
    setSelectedTest(null);
    setSearchText(test.title);
    setSuggestions([]);
    setRespLoading(true);
    try {
      const fullTest = await getAssessmentById(test._id);
      const res = await getResponsesByAssessmentId(test._id);
      setSelectedTest(fullTest);
      setResponses(res);
    } catch (err) {
      console.error('Error fetching assessment/responses:', err);
      setResponses([]);
    } finally {
      setRespLoading(false);
    }
  };

  return (
    <ScrollView style={tw`bg-white`}>
      <View style={tw`px-4 pt-4`}>
        <Pressable onPress={() => router.push('/test_pages/testList')} style={tw`mb-4`}>
          <Icon name="arrow-left" size={22} color="#800080" />
        </Pressable>

        <Text style={tw`text-2xl font-bold mb-2 text-purple-800`}>Assessment Responses</Text>

        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search assessments..."
          style={tw`border border-gray-300 rounded-lg px-4 py-2 mb-2 bg-gray-100`}
        />

        {suggestions.length > 0 && (
          <View style={tw`bg-white rounded-md shadow p-2 mb-4`}>
            {suggestions.map((sug) => (
              <Pressable key={sug._id} onPress={() => handleSelectAssessment(sug)} style={tw`py-2 border-b border-gray-200`}>
                <Text>{sug.title}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {respLoading ? (
          <ActivityIndicator size="large" color="#800080" />
        ) : selectedTest ? (
          <>
            <Text style={tw`text-lg font-semibold mt-2 mb-2`}>
              Responses for: {selectedTest.title}
            </Text>
            {responses.length === 0 ? (
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
          </>
        ) : (
          <Text style={tw`text-gray-500 mt-4`}>
            Select an assessment to view responses.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default TestResponses;
