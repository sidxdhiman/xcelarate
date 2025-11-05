import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';

type Assessment = {
    _id: string;
    title: string;
    roles: string[];
    questions: { text: string; options: { text: string }[] }[];
};

const TestManagement = () => {
    const [tests, setTests] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
    const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);

    // send modal
    const [sendModalVisible, setSendModalVisible] = useState(false);
    const [filterType, setFilterType] = useState<'organization' | 'role' | null>(null);
    const [filterSearchModalVisible, setFilterSearchModalVisible] = useState(false);
    const [filterResults, setFilterResults] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [filterSearch, setFilterSearch] = useState('');

    // loading and success modal
    const [sending, setSending] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);
    const axiosInstance = useAuthStore((state) => state.axiosInstance);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await axiosInstance.get('/assessments');
                setTests(res.data.reverse());
                setError(null);
            } catch (err: any) {
                console.error('Error fetching tests:', err);
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

    const handleSend = async () => {
        if (!selectedFilter || !testToDelete || !filterType) {
            alert('Please select a target before sending.');
            return;
        }

        try {
            setSending(true); // show loader

            const payload = {
                assessmentId: testToDelete._id,
                filterType: filterType,
                filterValue: selectedFilter,
            };

            console.log("Sending payload:", payload);
            const response = await axiosInstance.post('/assessments/send', payload);

            console.log("✅ Send result:", response.data);

            // hide loader, show success prompt
            setSending(false);
            setSuccessMessage(
                `Assessment "${testToDelete.title}" sent to all ${
                    filterType === 'organization' ? 'users in organization' : 'users with role'
                } "${selectedFilter}".`
            );
            setSuccessModalVisible(true);
        } catch (err) {
            console.error('Send assessment error:', err);
            setSending(false);
            alert('Failed to send assessment');
        } finally {
            setFilterSearchModalVisible(false);
            setSelectedFilter(null);
        }
    };

    return (
        <>
            <ScrollView>
                {/* Back Button */}
                <View style={tw`absolute top-4 left-4 z-10`}>
                    <Pressable onPress={() => router.back()}>
                        <Icon style={tw`pt-10`} name="arrow-left" size={22} color="white" />
                    </Pressable>
                </View>

                {/* Header */}
                <View style={styles.headerArc}>
                    <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
                </View>

                {/* Search + Add */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <SearchBar
                            placeholder="Search Assessments..."
                            value={search}
                            onChangeText={setSearch}
                            round
                            platform="default"
                            containerStyle={{
                                backgroundColor: 'transparent',
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                                flex: 1,
                            }}
                            inputContainerStyle={{ backgroundColor: '#fff' }}
                            inputStyle={{ color: '#000' }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/test_pages/addTest')}
                        style={styles.addAssessmentBtn}
                    >
                        <Icon name="plus" size={16} color="#fff" />
                        <Text style={styles.addAssessmentText}>Add</Text>
                    </TouchableOpacity>
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
                                {/* Title */}
                                <View style={tw`flex-row items-center justify-between w-full mb-2`}>
                                    <View style={tw`flex-row items-center`}>
                                        <Icon name="file-text-o" size={18} color="#800080" style={tw`mr-2`} />
                                        <Text style={tw`text-black text-base font-semibold`}>{test.title}</Text>
                                    </View>
                                    <Pressable onPress={() => setExpandedTestId(isExpanded ? null : test._id)}>
                                        <Icon
                                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                            size={18}
                                            color="#800080"
                                        />
                                    </Pressable>
                                </View>

                                {/* Expanded */}
                                {isExpanded && (
                                    <View style={tw`mt-2`}>
                                        <Text style={tw`text-black mb-1`}>
                                            <Text style={tw`font-bold`}>Title:</Text> {test.title}
                                        </Text>
                                        <Text style={tw`text-black mb-1`}>
                                            <Text style={tw`font-bold`}>Roles:</Text>{' '}
                                            {test.roles?.length > 0 ? test.roles.join(', ') : 'No roles'}
                                        </Text>
                                        <Text style={tw`text-black mb-3`}>
                                            <Text style={tw`font-bold`}>Questions:</Text> {test.questions.length}
                                        </Text>

                                        {/* Square Icon Buttons */}
                                        <View style={styles.iconRow}>
                                            <TouchableOpacity
                                                style={[styles.iconButton, { backgroundColor: '#800080' }]}
                                                onPress={() => {
                                                    setTestToDelete(test);
                                                    setSendModalVisible(true);
                                                }}
                                            >
                                                <Icon name="paper-plane" size={26} color="#fff" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.iconButton, { backgroundColor: '#5b5b5b' }]}
                                                onPress={() =>
                                                    router.push({
                                                        pathname: '/test_pages/testResponses',
                                                        params: { id: test._id },
                                                    })
                                                }
                                            >
                                                <Icon name="eye" size={26} color="#fff" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.iconButton, { backgroundColor: '#4CAF50' }]}
                                                onPress={() =>
                                                    router.push({
                                                        pathname: '/test_pages/modifyTest',
                                                        params: { id: test._id },
                                                    })
                                                }
                                            >
                                                <Icon name="edit" size={26} color="#fff" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.iconButton, { backgroundColor: '#e53935' }]}
                                                onPress={() => {
                                                    setTestToDelete(test);
                                                    setModalVisible(true);
                                                }}
                                            >
                                                <Icon name="trash" size={26} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Delete Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
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

            {/* Send Modal */}
            <Modal visible={sendModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Pressable
                            style={{ position: 'absolute', top: 10, right: 10 }}
                            onPress={() => setSendModalVisible(false)}
                        >
                            <Icon name="close" size={20} color="#800080" />
                        </Pressable>

                        <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Send Assessment</Text>
                        <Text style={styles.modalMessage}>Choose how to send this assessment:</Text>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#800080', marginBottom: 10 }]}
                            onPress={() => {
                                setFilterType('organization');
                                setSendModalVisible(false);
                                setFilterSearchModalVisible(true);
                            }}
                        >
                            <Text style={styles.deleteButtonText}>By Organization</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#5b5b5b' }]}
                            onPress={() => {
                                setFilterType('role');
                                setSendModalVisible(false);
                                setFilterSearchModalVisible(true);
                            }}
                        >
                            <Text style={styles.deleteButtonText}>By Role</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Filter Search */}
            <Modal visible={filterSearchModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { maxHeight: '70%' }]}>
                        <Pressable
                            style={{ position: 'absolute', top: 10, right: 10 }}
                            onPress={() => setFilterSearchModalVisible(false)}
                        >
                            <Icon name="close" size={20} color="#800080" />
                        </Pressable>

                        <Text style={[styles.modalTitle, { textAlign: 'center' }]}>
                            {filterType === 'organization' ? 'Select Organization' : 'Select Role'}
                        </Text>
                        <TextInput
                            style={styles.filterInput}
                            placeholder={`Search ${filterType}...`}
                            value={filterSearch}
                            onChangeText={(text) => {
                                setFilterSearch(text);
                                const base =
                                    filterType === 'organization'
                                        ? ['Google', 'Meta', 'Amazon', 'Xebia', 'Adobe']
                                        : ['Developer', 'Designer', 'QA Engineer', 'Manager'];
                                setFilterResults(base.filter((b) => b.toLowerCase().includes(text.toLowerCase())));
                            }}
                        />

                        <FlatList
                            data={filterResults}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterOption,
                                        selectedFilter === item && { backgroundColor: '#f0e6ff' },
                                    ]}
                                    onPress={() => setSelectedFilter(item)}
                                >
                                    <Text style={{ color: '#333', fontSize: 16 }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#800080' }]}
                                onPress={handleSend}
                            >
                                <Text style={styles.deleteButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Sending Loader */}
            <Modal visible={sending} transparent animationType="fade">
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>Sending Assessments...</Text>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={successModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { alignItems: 'center' }]}>
                        <Icon name="check-circle" size={40} color="#4CAF50" />
                        <Text style={[styles.modalTitle, { textAlign: 'center', marginTop: 10 }]}>Success!</Text>
                        <Text style={[styles.modalMessage, { textAlign: 'center' }]}>{successMessage}</Text>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#800080', marginTop: 10 }]}
                            onPress={() => setSuccessModalVisible(false)}
                        >
                            <Text style={styles.deleteButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    headerArc: {
        backgroundColor: '#800080',
        paddingVertical: 32,
        alignItems: 'center',
        marginBottom: 10,
        paddingTop: 80,
    },
    headerText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        letterSpacing: 1,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 12,
        gap: 10,
    },
    searchContainer: { flex: 1 },
    addAssessmentBtn: {
        height: 50,
        backgroundColor: '#800080',
        borderRadius: 8,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    addAssessmentText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 15,
    },
    testCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 10,
        marginVertical: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    iconButton: {
        width: (width - 100) / 4,
        aspectRatio: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loaderOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#800080' },
    modalMessage: { fontSize: 16, marginBottom: 20, color: '#333' },
    modalButtonsContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, marginLeft: 10 },
    cancelButton: { backgroundColor: '#ccc' },
    cancelButtonText: { color: '#333', fontWeight: '600' },
    deleteButton: { backgroundColor: '#e53935' },
    deleteButtonText: { color: 'white', fontWeight: '600' },
    filterInput: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
        marginBottom: 10,
    },
    filterOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
});

export default TestManagement;
