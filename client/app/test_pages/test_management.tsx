// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { router, useNavigation } from 'expo-router';
// import { Pressable } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import tw from 'twrnc';
//
// export default function TestManagement() {
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();
//   const isMobile = width < 600;
//
//   const cardWidth = isMobile ? (width - 48) / 2 : width / 5.5;
//   const cardHeight = cardWidth;
//
//   const cards = [
//     {
//       icon: <FontAwesome5 name="list" size={42} color="#800080" />,
//       text: 'Assessment List',
//       path: '/test_pages/testList',
//     },
//     {
//       icon: <FontAwesome5 name="paperclip" size={42} color="#800080" />,
//       text: 'Add Assessment',
//       path: '/test_pages/addTest',
//     },
//     // {
//     //   icon: <Ionicons name="trash-bin-outline" size={44} color="#800080" />,
//     //   text: 'Archive',
//     //   path: '/test_pages/deleteTest',
//     // },
//   ];
//
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={tw`absolute top-4 left-4 z-10`}>
//         <Pressable onPress={()=> router.push('/landing')}>
//           <Icon style={tw`pt-10`} name='arrow-left' size={22} color="white"></Icon>
//         </Pressable>
//       </View>
//       <View style={styles.headerArc}>
//         <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
//       </View>
//
//       <View
//         style={[
//           styles.cardGrid,
//           {
//             flexWrap: isMobile ? 'wrap' : 'nowrap',
//             justifyContent: isMobile ? 'space-between' : 'center',
//           },
//         ]}
//       >
//         {cards.map((card, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => router.push(card.path)}
//             style={[
//               styles.card,
//               {
//                 width: cardWidth,
//                 height: cardHeight,
//                 marginRight:
//                   !isMobile && index !== cards.length - 1 ? 16 : 0,
//                 marginBottom: isMobile ? 16 : 0,
//               },
//             ]}
//           >
//             {card.icon}
//             <Text style={styles.cardText}>{card.text}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7f3ff',
//   },
//   headerArc: {
//     backgroundColor: '#800080',
//     paddingVertical: 32,
//     alignItems: 'center',
//     marginBottom: 40,
//     paddingTop: 50
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 10,
//     letterSpacing: 1,
//   },
//   cardGrid: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     flex: 1,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   cardText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#4b0082',
//     textAlign: 'center',
//   },
// });


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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
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

    const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);
    const axiosInstance = useAuthStore((state) => state.axiosInstance);

    // Fetch assessments
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

    // Search filtering
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
                {/* Back Button */}
                <View style={tw`absolute top-4 left-4 z-10`}>
                    <Pressable onPress={() => router.push('/landing')}>
                        <Icon style={tw`pt-10`} name="arrow-left" size={22} color="white" />
                    </Pressable>
                </View>

                {/* Header */}
                <View style={styles.headerArc}>
                    <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
                </View>

                {/* Search + Add Assessment aligned */}
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

                    {/* Add Assessment Button (same height as search) */}
                    <TouchableOpacity
                        onPress={() => router.push('/test_pages/addTest')}
                        style={styles.addAssessmentBtn}
                    >
                        <Icon name="plus" size={16} color="#fff" />
                        <Text style={styles.addAssessmentText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading / Error */}
                {loading ? (
                    <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
                ) : error ? (
                    <Text style={tw`text-red-500 text-center mt-4`}>{error}</Text>
                ) : (
                    displayTests.map((test) => {
                        const isExpanded = expandedTestId === test._id;
                        return (
                            <View key={test._id} style={styles.testCard}>
                                {/* Title Row */}
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

                                {/* Expanded Info */}
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

                                        {/* Keep original action buttons */}
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
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/test_pages/testResponses',
                                                    params: { id: test._id },
                                                })
                                            }
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

            {/* Delete Confirmation Modal */}
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
        </>
    );
};

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
    searchContainer: {
        flex: 1,
    },
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
    actionBtn: {
        backgroundColor: '#800080',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginTop: 8,
    },
    actionBtn2: {
        backgroundColor: '#5b5b5b',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginTop: 8,
    },
    btnText: { color: 'white', fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
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
});

export default TestManagement;
