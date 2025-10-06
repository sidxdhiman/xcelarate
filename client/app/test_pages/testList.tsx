import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
// ✅ Fixed default import
import {useAssessmentStore} from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';

type Assessment = {
  _id: string;
  title: string;
  roles: string[];
  questions: { text: string; options: { text: string }[] }[];
};

const TestList = () => {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);

  const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);

  const axiosInstance = useAuthStore((state) => state.axiosInstance);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        console.log('Fetching assessments from:', axiosInstance.defaults.baseURL + '/assessments');
        const res = await axiosInstance.get('/assessments');
        setTests(res.data.reverse());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tests:', err.message || err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredTests(
          tests.filter(
              (t) =>
                  t.title.toLowerCase().includes(query) ||
                  t.roles?.some((r) => r.toLowerCase().includes(query))
          )
      );
    } else {
      setFilteredTests([]);
    }
  }, [search, tests]);

  const displayTests = search ? filteredTests : tests;

  const confirmDelete = async () => {
    if (!testToDelete) return;
    try {
      const confirmed = await deleteAssessmentById(testToDelete._id);
      if (confirmed) {
        setTests((prev) => prev.filter((t) => t._id !== testToDelete._id));
        alert('Assessment deleted successfully');
      } else {
        alert('Failed to delete assessment');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Something went wrong while deleting');
    } finally {
      setModalVisible(false);
      setTestToDelete(null);
    }
  };

  return (
      <>
        <ScrollView>
          <View style={tw`absolute top-4 left-4 z-10`}>
            <Pressable onPress={() => router.push('/test_pages/test_management')}>
              <Icon name="arrow-left" size={22} color="white" />
            </Pressable>
          </View>

          <View style={styles.headerArc}>
            <Text style={styles.headerText}>ASSESSMENTS</Text>
          </View>

          <View style={styles.search}>
            <SearchBar
                placeholder="Search Assessments..."
                value={search}
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
                inputContainerStyle={{ backgroundColor: '#fff' }}
                inputStyle={{ color: '#000' }}
            />
          </View>

          {loading ? (
              <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
          ) : error ? (
              <Text style={tw`text-red-500 text-center mt-4`}>{error}</Text>
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
                            <Text style={tw`text-black mb-1`}><Text style={tw`font-bold`}>Title:</Text> {test.title}</Text>
                            <Text style={tw`text-black mb-1`}><Text style={tw`font-bold`}>Roles:</Text> {test.roles?.length > 0 ? test.roles.join(', ') : 'No roles'}</Text>
                            <Text style={tw`text-black mb-3`}><Text style={tw`font-bold`}>Questions:</Text> {test.questions.length}</Text>

                            <Pressable
                                onPress={() => {
                                  const encodedData = encodeURIComponent(JSON.stringify(test));
                                  router.push({
                                    pathname: '/[id]/disclaimer',
                                    params: { id: test._id, q: '0', data: encodedData },
                                  });
                                }}
                                style={styles.actionBtn}
                            >
                              <Text style={styles.btnText}>Go to Assessment</Text>
                            </Pressable>

                            <Pressable
                                onPress={async () => {
                                  const encodedData = encodeURIComponent(JSON.stringify(test));
                                  const fullLink = `http://localhost:8081/${test._id}/disclaimer?data=${encodedData}`;
                                  await Clipboard.setStringAsync(fullLink);
                                  alert('Link copied to clipboard!');
                                }}
                                style={styles.actionBtn2}
                            >
                              <Text style={styles.btnText}>Copy Link</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                  const encodedData = encodeURIComponent(JSON.stringify(test));
                                  router.push({
                                    pathname: '/test_pages/testResponses',
                                    params: { id: test._id, q: '0', data: encodedData },
                                  });
                                }}
                                style={styles.actionBtn}
                            >
                              <Text style={styles.btnText}>View Responses</Text>
                            </Pressable>

                            <Pressable
                                onPress={() =>
                                    router.push({
                                      pathname: '/test_pages/modifyTest',
                                      params: { id: test._id },
                                    })
                                }
                                style={styles.actionBtn}
                            >
                              <Text style={styles.btnText}>Edit</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                  setTestToDelete(test);
                                  setModalVisible(true);
                                }}
                                style={[styles.actionBtn, { backgroundColor: '#e53935' }]}
                            >
                              <Text style={[styles.btnText, { color: 'white' }]}>Delete</Text>
                            </Pressable>
                          </View>
                      )}
                    </View>
                );
              })
          )}
        </ScrollView>

        <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Delete</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete "{testToDelete?.title}"?
              </Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={confirmDelete}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
  );
};

const styles = StyleSheet.create({
  testCard: { backgroundColor: 'white', borderRadius: 10, padding: 20, margin: 5 },
  search: { flex: 1, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, paddingHorizontal: 5 },
  headerArc: { backgroundColor: '#800080', paddingVertical: 32, alignItems: 'center', marginBottom: 10 },
  headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 10, letterSpacing: 1 },
  actionBtn: { backgroundColor: '#800080', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginTop: 8 },
  actionBtn2: { backgroundColor: '#5b5b5b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginTop: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#800080' },
  modalMessage: { fontSize: 16, marginBottom: 20, color: '#333' },
  modalButtonsContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, marginLeft: 10 },
  cancelButton: { backgroundColor: '#ccc' },
  cancelButtonText: { color: '#333', fontWeight: '600' },
  deleteButton: { backgroundColor: '#e53935' },
  deleteButtonText: { color: 'white', fontWeight: '600' },
});

export default TestList;
