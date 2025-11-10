import React, { useEffect, useMemo, useState } from 'react';
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
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

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
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const axiosInstance = useAuthStore((state) => state.axiosInstance);
    const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);

    const headerPaddingTop = useMemo(() => {
        if (Platform.OS === 'ios') return 60;
        return (StatusBar.currentHeight || 24) + 24;
    }, []);

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
                Toast.show({ type: 'success', text1: 'Assessment deleted successfully' });
            } else {
                Toast.show({ type: 'error', text1: 'Failed to delete assessment' });
            }
        } catch (err) {
            console.error('Delete error:', err);
            Toast.show({ type: 'error', text1: 'Something went wrong while deleting' });
        } finally {
            setModalVisible(false);
            setTestToDelete(null);
        }
    };

    const sanitizeFileName = (raw: string) =>
        raw
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'assessment';

    const handleDownloadResponses = async (assessment: Assessment) => {
        try {
            setDownloadingId(assessment._id);
            const { data } = await axiosInstance.get(`/assessments/${assessment._id}/responses`);

            if (!data || !Array.isArray(data) || data.length === 0) {
                Toast.show({ type: 'info', text1: 'No responses yet for this assessment' });
                return;
            }

            const formatted = data.map((resp: any, index: number) => {
                const answerEntries = Object.entries(resp.answers || {}).reduce(
                    (acc: Record<string, string>, [questionKey, answer]: [string, any]) => {
                        const value =
                            answer?.option ??
                            answer?.text ??
                            (typeof answer === 'string' ? answer : '');
                        acc[questionKey] = value || '';
                        return acc;
                    },
                    {}
                );

                return {
                    '#': index + 1,
                    Name: resp.user?.name || 'Anonymous',
                    Email: resp.user?.email || '',
                    Designation: resp.user?.designation || '',
                    SubmittedAt: resp.submittedAt
                        ? new Date(resp.submittedAt).toLocaleString()
                        : '',
                    ...answerEntries,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(formatted);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

            const fileName = `${sanitizeFileName(assessment.title)}-responses.xlsx`;

            if (Platform.OS === 'web') {
                const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
                const baseDir =
                    (FileSystem.cacheDirectory ||
                        FileSystem.documentDirectory ||
                        (FileSystem as any).temporaryDirectory ||
                        '') as string;

                if (!baseDir) {
                    Toast.show({
                        type: 'error',
                        text1: 'Unable to access storage',
                        text2: 'Could not determine a directory to save the file.',
                    });
                    return;
                }

                const fileUri = `${baseDir}${fileName}`;
                await FileSystem.writeAsStringAsync(fileUri, wbout, {
                    encoding: 'base64',
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Toast.show({
                        type: 'success',
                        text1: `Responses saved to: ${fileUri}`,
                    });
                }
            }

            Toast.show({ type: 'success', text1: 'Responses exported successfully' });
        } catch (error) {
            console.error('Download responses error:', error);
            Toast.show({ type: 'error', text1: 'Failed to export responses' });
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Arc */}
                    <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Icon name="arrow-left" size={20} color="#fff" />
                        </Pressable>
                        <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
                    </View>

                    {/* Search + Actions */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <SearchBar
                                placeholder="Search assessments..."
                                value={search}
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore - react-native-elements SearchBar has conflicting type definitions
                                onChangeText={setSearch}
                                round
                                platform="default"
                                containerStyle={styles.searchBarContainer}
                                inputContainerStyle={styles.searchInputContainer}
                                inputStyle={styles.searchInput}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/test_pages/addTest')}
                            style={styles.addAssessmentBtn}
                        >
                            <Icon name="plus" size={16} color="#fff" />
                            <Text style={styles.addAssessmentText}>New Assessment</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Assessment Cards */}
                    <View style={styles.listContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : displayTests.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="inbox" size={30} color="#c2a2e2" />
                                <Text style={styles.emptyTitle}>No Assessments yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    Create your first assessment to start tracking responses.
                                </Text>
                            </View>
                        ) : (
                            displayTests.map((test) => (
                                <View key={test._id} style={styles.testCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleRow}>
                                            <View style={styles.iconPill}>
                                                <Icon name="file-text-o" size={16} color="#800080" />
                                            </View>
                                            <Text style={styles.cardTitle}>{test.title}</Text>
                                        </View>
                                        <View style={styles.metaPill}>
                                            <Icon name="question-circle" size={12} color="#800080" />
                                            <Text style={styles.metaText}>
                                                {test.questions?.length || 0} questions
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={styles.sectionLabel}>Applicable Roles</Text>
                                        <View style={styles.rolesContainer}>
                                            {test.roles?.length ? (
                                                test.roles.map((role) => (
                                                    <View key={role} style={styles.roleChip}>
                                                        <Text style={styles.roleChipText}>{role}</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.metaMuted}>No roles assigned</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            styles.actionsRow,
                                            isTablet ? styles.actionsRowTablet : undefined,
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.primaryAction]}
                                            onPress={() => Alert.alert('Send', `Send ${test.title}`)}
                                        >
                                            <Icon name="paper-plane" size={16} color="#fff" />
                                            <Text style={styles.actionText}>Send</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.secondaryAction]}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/test_pages/testResponses',
                                                    params: { id: test._id },
                                                })
                                            }
                                        >
                                            <Icon name="line-chart" size={16} color="#800080" />
                                            <Text style={styles.secondaryText}>View Summary</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.downloadAction]}
                                            onPress={() => handleDownloadResponses(test)}
                                            disabled={downloadingId === test._id}
                                        >
                                            {downloadingId === test._id ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Icon name="download" size={16} color="#fff" />
                                            )}
                                            <Text style={styles.actionText}>Download Responses</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.editAction]}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/test_pages/modifyTest',
                                                    params: { id: test._id },
                                                })
                                            }
                                        >
                                            <Icon name="edit" size={16} color="#fff" />
                                            <Text style={styles.actionText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.deleteAction]}
                                            onPress={() => {
                                                setTestToDelete(test);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Icon name="trash" size={16} color="#fff" />
                                            <Text style={styles.actionText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Delete Confirmation Modal */}
            {modalVisible && (
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIconWrapper}>
                            <Icon name="trash" size={26} color="#e53935" />
                        </View>
                        <Text style={styles.modalTitle}>Delete assessment?</Text>
                        <Text style={styles.modalMessage}>
                            This will permanently remove "{testToDelete?.title}". You cannot undo this
                            action.
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
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f9f6ff' },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    headerArc: {
        backgroundColor: '#800080',
        width: '100%',
        paddingBottom: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    headerText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    backButton: {
        position: 'absolute',
        left: 24,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '100%',
        maxWidth: 780,
        gap: 12,
    },
    searchContainer: { flex: 1 },
    searchBarContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        padding: 0,
    },
    searchInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#e0d0ef',
        minHeight: 48,
    },
    searchInput: {
        color: '#000',
        fontSize: 15,
    },
    addAssessmentBtn: {
        height: 52,
        backgroundColor: '#800080',
        borderRadius: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: '#800080',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    addAssessmentText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    listContainer: {
        width: '100%',
        maxWidth: 780,
        paddingHorizontal: 16,
    },
    testCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#efe1fa',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconPill: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#f4ebff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#32174d',
        flexShrink: 1,
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#efe1fa',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    metaText: {
        color: '#4b0082',
        fontWeight: '600',
        fontSize: 12,
    },
    cardBody: {
        marginTop: 8,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6c2eb9',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    rolesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleChip: {
        backgroundColor: '#f4ebff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    roleChipText: {
        color: '#4b0082',
        fontWeight: '600',
        fontSize: 12,
    },
    metaMuted: {
        color: '#666',
        fontSize: 13,
    },
    actionsRow: {
        flexDirection: 'column',
        gap: 10,
    },
    actionsRowTablet: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        flex: 1,
        minHeight: 48,
    },
    primaryAction: {
        backgroundColor: '#6c2eb9',
        shadowColor: '#6c2eb9',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    downloadAction: {
        backgroundColor: '#4b0082',
    },
    editAction: {
        backgroundColor: '#40916c',
    },
    deleteAction: {
        backgroundColor: '#e53935',
    },
    secondaryAction: {
        backgroundColor: '#f4ebff',
        borderWidth: 1,
        borderColor: '#e0d0ef',
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryText: {
        color: '#4b0082',
        fontWeight: '600',
        fontSize: 14,
    },
    errorText: {
        textAlign: 'center',
        color: '#e53935',
        marginTop: 24,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        borderWidth: 1,
        borderColor: '#efe1fa',
        marginTop: 24,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#32174d',
    },
    emptySubtitle: {
        marginTop: 4,
        textAlign: 'center',
        color: '#6d6d6d',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBox: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    modalIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fdecea',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3c1053',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#d0c2e8',
        backgroundColor: '#f9f6ff',
    },
    cancelButtonText: { color: '#4b0082', fontWeight: '600' },
    deleteButton: { backgroundColor: '#e53935' },
    deleteButtonText: { color: '#fff', fontWeight: '700' },
});

export default TestManagement;
