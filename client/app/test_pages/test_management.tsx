import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    Dimensions,
    Alert,
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

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const iconSize = isTablet ? 22 : 20;

const TestManagement = () => {
    const [tests, setTests] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);

    const axiosInstance = useAuthStore((state) => state.axiosInstance);
    const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);

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
                Alert.alert('Success', 'Assessment deleted successfully');
            } else {
                Alert.alert('Error', 'Failed to delete assessment');
            }
        } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'Something went wrong while deleting');
        } finally {
            setModalVisible(false);
            setTestToDelete(null);
        }
    };

    return (
        <>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                {/* Header Arc */}
                <View style={styles.headerArc}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ position: 'absolute', top: 60, left: 20 }}
                    >
                        <Icon name="arrow-left" size={22} color="white" />
                    </Pressable>
                    <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
                </View>

                {/* Search + Add */}
                <View style={[styles.searchRow, { width: '100%', maxWidth: 700 }]}>
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

                {/* Assessment Cards */}
                <View style={{ width: '100%', maxWidth: 700 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
                    ) : error ? (
                        <Text style={tw`text-red-500 text-center mt-4`}>{error}</Text>
                    ) : (
                        displayTests.map((test) => (
                            <View key={test._id} style={styles.testCard}>
                                {/* Responsive Row: Info + Actions (side by side or stacked) */}
                                <View
                                    style={[
                                        styles.testRow,
                                        { flexDirection: isTablet ? 'row' : 'column' },
                                    ]}
                                >
                                    {/* Left Side — Info */}
                                    <View style={[styles.testInfo, { flex: 1 }]}>
                                        <View style={tw`flex-row items-center mb-2`}>
                                            <Icon
                                                name="file-text-o"
                                                size={18}
                                                color="#800080"
                                                style={tw`mr-2`}
                                            />
                                            <Text style={tw`text-black text-base font-semibold`}>
                                                {test.title}
                                            </Text>
                                        </View>

                                        <Text style={tw`text-black`}>
                                            <Text style={tw`font-bold`}>Roles:</Text>{' '}
                                            {test.roles?.length > 0 ? test.roles.join(', ') : 'No roles'}
                                        </Text>
                                        <Text style={tw`text-black mt-1`}>
                                            <Text style={tw`font-bold`}>Questions:</Text>{' '}
                                            {test.questions?.length || 0}
                                        </Text>
                                    </View>

                                    {/* Right Side — Actions */}
                                    <View
                                        style={[
                                            styles.iconRow,
                                            isTablet
                                                ? { flexDirection: 'row', width: 200, justifyContent: 'space-between' }
                                                : { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: '#800080' }]}
                                            onPress={() => Alert.alert('Send', `Send ${test.title}`)}
                                        >
                                            <Icon name="paper-plane" size={iconSize} color="#fff" />
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
                                            <Icon name="eye" size={iconSize} color="#fff" />
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
                                            <Icon name="edit" size={iconSize} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: '#e53935' }]}
                                            onPress={() => {
                                                setTestToDelete(test);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Icon name="trash" size={iconSize} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            {modalVisible && (
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
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
            )}
        </>
    );
};

const styles = StyleSheet.create({
    headerArc: {
        backgroundColor: '#800080',
        width: '100%',
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
        marginVertical: 8,
        marginHorizontal: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    testRow: {
        alignItems: 'flex-start',
    },
    testInfo: {
        flexShrink: 1,
    },
    iconRow: {
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    iconButton: {
        width: 45,
        height: 45,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '85%',
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
});

export default TestManagement;
