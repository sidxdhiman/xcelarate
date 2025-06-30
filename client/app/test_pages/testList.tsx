import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuthStore } from '../../store/useAuthStore';
import { SearchBar } from 'react-native-elements';
import { Pressable } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from 'expo-router';

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
        <Pressable onPress={()=> navigation.goBack()}>
          <Icon name='arrow-left' size={22} color="white"></Icon>
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
        displayTests.map((test) => (
          <View key={test._id} style={styles.testCard}>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="file-text-o" size={18} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black text-base font-semibold`}>{test.title}</Text>
            </View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="users" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>
                {Array.isArray(test.role) ? test.role.join(', ') : 'No roles'}
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Icon name="question" size={16} color="#800080" style={tw`mr-2`} />
              <Text style={tw`text-black`}>Questions: {test.questions.length}</Text>
            </View>
          </View>
        ))
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
    paddingHorizontal: 5
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
