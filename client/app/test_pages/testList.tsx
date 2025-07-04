import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuthStore } from '../../store/useAuthStore';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

type Assessment = {
  _id: string;
  title: string;
  role: string[];
  questions: { questionText: string; options: { text: string }[] }[];
};

const TestList = () => {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const navigation = useNavigation();
  const axiosInstance = useAuthStore((state) => state.axiosInstance);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get('/assessments');
        setTests(res.data.reverse());
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  useEffect(() => {
    if (search.trim().length > 0) {
      const query = search.toLowerCase();
      const filtered = tests.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.role.some(r => r.toLowerCase().includes(query))
      );
      setFilteredTests(filtered);
    } else {
      setFilteredTests([]);
    }
  }, [search, tests]);

  const displayTests = search.length > 0 ? filteredTests : tests;

  return (
    <ScrollView>
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name='arrow-left' size={22} color="white" />
        </Pressable>
      </View>

      <View style={styles.headerArc}>
        <Text style={styles.headerText}>ASSESSMENTS</Text>
      </View>

      <View style={styles.search}>
        <SearchBar
          placeholder="Search Assessments..."
          onChangeText={setSearch}
          value={search}
          platform="default"
          containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
          inputContainerStyle={{ backgroundColor: '#fff' }}
          inputStyle={{ color: '#000' }}
          round
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
      ) : error ? (
        <Text style={tw`text-red-500 text-center`}>{error}</Text>
      ) : (
        displayTests.map((test) => {
          const isExpanded = expandedTestId === test._id;
          return (
            <View key={test._id} style={styles.testCard}>
              <View style={tw`flex-row items-center justify-between w-full mb-2`}>
                <View style={tw`flex-row items-center`}>
                  <Icon name="file-text-o" size={18} color="#800080" style={tw`mr-2`} />
                  <Text style={tw`text-black text-base font-semibold`}>{test.title}</Text>
                </View>
                <Pressable onPress={() => setExpandedTestId(isExpanded ? null : test._id)}>
                  <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#800080" />
                </Pressable>
              </View>

              {isExpanded && (
                <View style={tw`mt-2`}>
                  <Text style={tw`text-black mb-1`}>
                    <Text style={tw`font-bold`}>Title:</Text> {test.title}
                  </Text>
                  <Text style={tw`text-black mb-1`}>
                    <Text style={tw`font-bold`}>Roles:</Text> {Array.isArray(test.role) ? test.role.join(', ') : 'No roles'}
                  </Text>
                  <Text style={tw`text-black mb-3`}>
                    <Text style={tw`font-bold`}>Questions:</Text> {test.questions.length}
                  </Text>

                  <Pressable
                    onPress={() => {
                      const encodedData = encodeURIComponent(JSON.stringify(test));
                      router.push({
                        pathname: '/[id]/[q]',
                        params: { id: test._id, q: '0', data: encodedData },
                      });
                    }}
                    style={tw`bg-purple-800 px-4 py-2 rounded-lg self-start mb-2`}
                  >
                    <Text style={tw`text-white font-semibold`}>Go to Assessment</Text>
                  </Pressable>

                  <Pressable
                  onPress={async () => {
                    const encodedData = encodeURIComponent(JSON.stringify(test));
                    const link = `http://localhost:8081/${test._id}/0?data=${encodedData}`;
                    await Clipboard.setStringAsync(link);
                    alert('Link copied to clipboard!');
                  }}
                  style={tw`bg-gray-700 px-4 py-2 rounded-lg self-start`}
                >
                  <Text style={tw`text-white font-semibold`}>Copy Link</Text>
                </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  testCard: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 5,
  },
  search: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
});

export default TestList;
