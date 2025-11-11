// // TestManagement.responsive.tsx
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Pressable,
//   TouchableOpacity,
//   Dimensions,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   TextInput,
//   FlatList,
//   KeyboardAvoidingView,
//   useWindowDimensions,
//   Modal,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { SearchBar } from 'react-native-elements';
// import tw from 'twrnc';
// import { router } from 'expo-router';
// import { useAssessmentStore } from '@/store/useAssessmentStore';
// import { useAuthStore } from '@/store/useAuthStore';
// import { SnackHost, showSnack } from '@/components/Snack';
// import * as FileSystem from 'expo-file-system/legacy';
// import * as Sharing from 'expo-sharing';
// import XLSX from 'xlsx';

// type Assessment = {
//   _id: string;
//   title: string;
//   roles: string[];
//   questions: { text: string; options: { text: string }[] }[];
// };

// const TestManagement = () => {
//   const { width: windowWidth, height: windowHeight } = useWindowDimensions();
//   const isNarrow = windowWidth < 700; // mobile-ish threshold
//   const cardMaxWidth = isNarrow ? '94%' : Math.min(900, windowWidth - 120);

//   // --- states & logic untouched ---
//   const [tests, setTests] = useState<Assessment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState('');
//   const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
//   const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);

//   // send modal
//   const [sendModalVisible, setSendModalVisible] = useState(false);
//   const [filterType, setFilterType] = useState<'organization' | 'role' | null>(null);
//   const [filterSearchModalVisible, setFilterSearchModalVisible] = useState(false);
//   const [filterResults, setFilterResults] = useState<string[]>([]);
//   const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
//   const [filterSearch, setFilterSearch] = useState('');

//   // loading and success modal
//   const [sending, setSending] = useState(false);
//   const [successModalVisible, setSuccessModalVisible] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');

//   const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);
//   const axiosInstance = useAuthStore((state) => state.axiosInstance);

//   // Fetch tests
//   useEffect(() => {
//     const fetchTests = async () => {
//       try {
//         const res = await axiosInstance.get('/assessments');
//         setTests(res.data.reverse());
//         setError(null);
//       } catch (err: any) {
//         console.error('Error fetching tests:', err);
//         setError('Failed to load tests. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTests();
//   }, []);

//   // Search filter
//   useEffect(() => {
//     if (search.trim()) {
//       const query = search.toLowerCase();
//       setFilteredTests(
//         tests.filter(
//           (t) =>
//             t.title.toLowerCase().includes(query) ||
//             t.roles?.some((r) => r.toLowerCase().includes(query))
//         )
//       );
//     } else {
//       setFilteredTests([]);
//     }
//   }, [search, tests]);

//   const displayTests = search ? filteredTests : tests;

//   const confirmDelete = async () => {
//     if (!testToDelete) return;
//     try {
//       const confirmed = await deleteAssessmentById(testToDelete._id);
//       if (confirmed) {
//         setTests((prev) => prev.filter((t) => t._id !== testToDelete._id));
//         showSnack('Assessment deleted successfully');
//       } else {
//         showSnack('Failed to delete assessment');
//       }
//     } catch (err) {
//       console.error('Delete error:', err);
//       showSnack('Something went wrong while deleting');
//     } finally {
//       setModalVisible(false);
//       setTestToDelete(null);
//     }
//   };

//   const sanitizeFileName = (raw: string) =>
//     raw
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '') || 'assessment';

//   const handleDownloadResponses = async (assessment: Assessment) => {
//     try {
//       setSending(true);
//       const { data } = await axiosInstance.get(`/assessments/${assessment._id}/responses`);

//       if (!data || !Array.isArray(data) || data.length === 0) {
//         showSnack('No responses yet for this assessment');
//         return;
//       }

//       const formatted = data.map((resp: any, index: number) => {
//         const answerEntries = Object.entries(resp.answers || {}).reduce(
//           (acc: Record<string, string>, [questionKey, answer]: [string, any]) => {
//             const value =
//               answer?.option ??
//               answer?.text ??
//               (typeof answer === 'string' ? answer : '');
//             acc[questionKey] = value || '';
//             return acc;
//           },
//           {}
//         );

//         return {
//           '#': index + 1,
//           Name: resp.user?.name || 'Anonymous',
//           Email: resp.user?.email || '',
//           Designation: resp.user?.designation || '',
//           SubmittedAt: resp.submittedAt
//             ? new Date(resp.submittedAt).toLocaleString()
//             : '',
//           ...answerEntries,
//         };
//       });

//       const worksheet = XLSX.utils.json_to_sheet(formatted);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

//       const fileName = `${sanitizeFileName(assessment.title)}-responses.xlsx`;

//       if (Platform.OS === 'web') {
//         const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//         const blob = new Blob([wbout], {
//           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         });
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = fileName;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
//       } else {
//         const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
//         const baseDir =
//           (FileSystem.cacheDirectory ||
//             FileSystem.documentDirectory ||
//             (FileSystem as any).temporaryDirectory ||
//             '') as string;

//         if (!baseDir) {
//           showSnack('Unable to access storage. Could not determine a directory.');
//           return;
//         }

//         const fileUri = `${baseDir}${fileName}`;
//         await FileSystem.writeAsStringAsync(fileUri, wbout, {
//           encoding: 'base64',
//         });

//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(fileUri);
//         } else {
//           showSnack(`Responses saved to: ${fileUri}`);
//         }
//       }

//       showSnack('Responses exported successfully');
//     } catch (error) {
//       console.error('Download responses error:', error);
//       showSnack('Failed to export responses');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleSend = async () => {
//     if (!selectedFilter || !testToDelete || !filterType) {
//       showSnack('Please select a target before sending.');
//       return;
//     }

//     try {
//       setSending(true); // show loader

//       const payload = {
//         assessmentId: testToDelete._id,
//         filterType: filterType,
//         filterValue: selectedFilter,
//       };

//       console.log('Sending payload:', payload);
//       const response = await axiosInstance.post('/assessments/send', payload);

//       console.log('✅ Send result:', response.data);

//       // hide loader, show success prompt
//       setSending(false);
//       setSuccessMessage(
//         `Assessment "${testToDelete.title}" sent to all ${
//           filterType === 'organization' ? 'users in organization' : 'users with role'
//         } "${selectedFilter}".`
//       );
//       setSuccessModalVisible(true);
//     } catch (err) {
//       console.error('Send assessment error:', err);
//       setSending(false);
//       showSnack('Failed to send assessment');
//     } finally {
//       setFilterSearchModalVisible(false);
//       setSelectedFilter(null);
//     }
//   };

//   // small helper to open send modal and pre-populate testToDelete
//   const openSendModalForTest = (t: Assessment) => {
//     setTestToDelete(t);
//     setSendModalVisible(true);
//   };

//   // responsive layout helpers
//   const actionsLayoutIsRow = !isNarrow;

//   return (
//     <SafeAreaView style={styles.screen}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={[styles.headerArc, { paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight || 24 }]}>
//             <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
//           </View>

//           {/* Actions row */}
//           <View style={[styles.actionsBar, { width: cardMaxWidth }]}>
//             <View style={{ flex: 1 }}>
//               <SearchBar
//                 placeholder="Search assessments..."
//                 value={search}
//                 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//                 // @ts-ignore
//                 onChangeText={setSearch}
//                 round
//                 platform="default"
//                 containerStyle={styles.searchBarContainer}
//                 inputContainerStyle={styles.searchInputContainer}
//                 inputStyle={styles.searchInput}
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.primaryBtn, { marginLeft: isNarrow ? 0 : 12, marginTop: isNarrow ? 10 : 0 }]}
//               onPress={() => router.push('/test_pages/addTest')}
//             >
//               <Icon name="plus" size={16} color="#fff" />
//               <Text style={styles.primaryBtnText}>New Assessment</Text>
//             </TouchableOpacity>
//           </View>

//           {/* List */}
//           <View style={{ width: cardMaxWidth, alignSelf: 'center' }}>
//             {loading ? (
//               <ActivityIndicator size="large" color="#800080" style={{ marginTop: 20 }} />
//             ) : error ? (
//               <Text style={{ color: '#e53935', textAlign: 'center', marginTop: 20 }}>{error}</Text>
//             ) : displayTests.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Icon name="inbox" size={36} color="#c2a2e2" />
//                 <Text style={styles.emptyTitle}>No Assessments yet</Text>
//                 <Text style={styles.emptySubtitle}>Create your first assessment to start tracking responses.</Text>
//               </View>
//             ) : (
//               displayTests.map((test) => {
//                 const isExpanded = expandedTestId === test._id;
//                 return (
//                   <View key={test._id} style={[styles.testCard, { width: cardMaxWidth }]}>
//                     <View style={styles.cardHeader}>
//                       <View style={{ flex: 1 }}>
//                         <Text style={styles.cardTitle} numberOfLines={2}>
//                           {test.title}
//                         </Text>
//                         <Text style={styles.cardSubtitle}>
//                           {test.questions?.length || 0} questions • {test.roles?.length ? `${test.roles.length} roles` : 'No roles'}
//                         </Text>
//                       </View>

//                       <View style={[styles.iconGroup, actionsLayoutIsRow ? undefined : { marginTop: 12 }]}>
//                         <TouchableOpacity
//                           style={[styles.iconAction, { backgroundColor: '#800080' }]}
//                           onPress={() => openSendModalForTest(test)}
//                         >
//                           <Icon name="paper-plane" size={16} color="#fff" />
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[styles.iconAction, { backgroundColor: '#5b5b5b' }]}
//                           onPress={() =>
//                             router.push({
//                               pathname: '/test_pages/testResponses',
//                               params: { id: test._id },
//                             })
//                           }
//                         >
//                           <Icon name="eye" size={16} color="#fff" />
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[styles.iconAction, { backgroundColor: '#40916c' }]}
//                           onPress={() =>
//                             router.push({
//                               pathname: '/test_pages/modifyTest',
//                               params: { id: test._id },
//                             })
//                           }
//                         >
//                           <Icon name="edit" size={16} color="#fff" />
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[styles.iconAction, { backgroundColor: '#e53935' }]}
//                           onPress={() => {
//                             setTestToDelete(test);
//                             setModalVisible(true);
//                           }}
//                         >
//                           <Icon name="trash" size={16} color="#fff" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>

//                     {/* expandable area */}
//                     <View style={styles.cardBody}>
//                       <Text style={styles.sectionLabel}>Applicable Roles</Text>
//                       <View style={styles.rolesRow}>
//                         {test.roles?.length ? (
//                           test.roles.map((r) => (
//                             <View key={r} style={styles.roleChip}>
//                               <Text style={styles.roleChipText}>{r}</Text>
//                             </View>
//                           ))
//                         ) : (
//                           <Text style={styles.metaMuted}>No roles assigned</Text>
//                         )}
//                       </View>
//                       {/* <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Text style={styles.smallMeta}>Last updated: —</Text>
//                         <Pressable onPress={() => setExpandedTestId(isExpanded ? null : test._id)}>
//                           <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#800080" />
//                         </Pressable>
//                       </View> */}
//                     </View>
//                   </View>
//                 );
//               })
//             )}
//           </View>
//         </ScrollView>

//         {/* Delete Modal (responsive) */}
//         <Modal
//           visible={modalVisible}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={styles.modalBackdrop}>
//             <View style={[styles.modalBox, isNarrow ? { width: '94%', maxHeight: '78%' } : { width: 520 }]}>
//               <Text style={styles.modalTitle}>Confirm Delete</Text>
//               <Text style={styles.modalMessage}>
//                 Are you sure you want to delete "{testToDelete?.title}"? This action cannot be undone.
//               </Text>
//               <View style={styles.modalActions}>
//                 <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
//                   <Text style={styles.cancelBtnText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.modalBtn, styles.deleteBtn]} onPress={confirmDelete}>
//                   <Text style={styles.deleteBtnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Send selection modal */}
//         <Modal
//           visible={sendModalVisible}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setSendModalVisible(false)}
//         >
//           <View style={styles.modalBackdrop}>
//             <View style={[styles.modalBox, isNarrow ? { width: '94%', maxHeight: '78%' } : { width: 520 }]}>
//               <Text style={styles.modalTitle}>Send Assessment</Text>
//               <Text style={styles.modalMessage}>Choose how to send this assessment</Text>

//               <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: 10, marginTop: 8 }}>
//                 <TouchableOpacity
//                   style={[styles.fullBtn, filterType === 'organization' ? styles.fullBtnActive : {}]}
//                   onPress={() => {
//                     setFilterType('organization');
//                     setSendModalVisible(false);
//                     setFilterSearchModalVisible(true);
//                   }}
//                 >
//                   <Text style={filterType === 'organization' ? styles.fullBtnTextActive : styles.fullBtnText}>By Organization</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.fullBtn, filterType === 'role' ? styles.fullBtnActive : {}]}
//                   onPress={() => {
//                     setFilterType('role');
//                     setSendModalVisible(false);
//                     setFilterSearchModalVisible(true);
//                   }}
//                 >
//                   <Text style={filterType === 'role' ? styles.fullBtnTextActive : styles.fullBtnText}>By Role</Text>
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { marginTop: 12 }]} onPress={() => setSendModalVisible(false)}>
//                 <Text style={styles.cancelBtnText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         {/* Filter search modal */}
//         <Modal
//           visible={filterSearchModalVisible}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setFilterSearchModalVisible(false)}
//         >
//           <View style={styles.modalBackdrop}>
//             <View style={[styles.modalBox, isNarrow ? { width: '98%', height: '84%' } : { width: 700, maxHeight: '80%' }]}>
//               <Text style={styles.modalTitle}>{filterType === 'organization' ? 'Select Organization' : 'Select Role'}</Text>

//               <TextInput
//                 placeholder={`Search ${filterType === 'organization' ? 'organization' : 'role'}...`}
//                 value={filterSearch}
//                 onChangeText={(text) => {
//                   setFilterSearch(text);
//                   const base =
//                     filterType === 'organization'
//                       ? ['Google', 'Meta', 'Amazon', 'Xebia', 'Adobe', 'IBM', 'TCS', 'Infosys']
//                       : ['Developer', 'Designer', 'QA Engineer', 'Manager', 'Data Scientist', 'DevOps'];
//                   setFilterResults(base.filter((b) => b.toLowerCase().includes(text.toLowerCase())));
//                 }}
//                 style={[styles.input, { marginTop: 12 }]}
//                 autoCorrect={false}
//                 autoCapitalize="none"
//               />

//               <View style={{ marginTop: 12, flex: 1 }}>
//                 {filterResults.length === 0 ? (
//                   <Text style={{ color: '#666', paddingVertical: 8 }}>No suggestions. Type to search or enter a value.</Text>
//                 ) : (
//                   <FlatList
//                     data={filterResults}
//                     keyExtractor={(i) => i}
//                     renderItem={({ item }) => {
//                       const selected = selectedFilter === item;
//                       return (
//                         <TouchableOpacity
//                           onPress={() => {
//                             setSelectedFilter(item);
//                             setFilterSearch(item);
//                           }}
//                           style={[styles.filterOption, selected ? styles.filterOptionSelected : {}]}
//                         >
//                           <Text style={selected ? { color: '#fff', fontWeight: '700' } : { color: '#222' }}>{item}</Text>
//                         </TouchableOpacity>
//                       );
//                     }}
//                     style={{ marginBottom: 6 }}
//                   />
//                 )}
//               </View>

//               <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
//                 <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setFilterSearchModalVisible(false)}>
//                   <Text style={styles.cancelBtnText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.modalBtn, { backgroundColor: '#800080', marginLeft: 8 }]}
//                   onPress={handleSend}
//                   disabled={sending}
//                 >
//                   {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteBtnText}>Send</Text>}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Sending full-screen loader */}
//         <Modal visible={sending} transparent animationType="fade">
//           <View style={styles.loaderBackdrop}>
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={{ color: '#fff', marginTop: 12 }}>Working…</Text>
//           </View>
//         </Modal>

//         {/* Success modal */}
//         <Modal visible={successModalVisible} transparent animationType="fade">
//           <View style={styles.modalBackdrop}>
//             <View style={[styles.modalBox, { width: isNarrow ? '90%' : 480 }]}>
//               <Icon name="check-circle" size={44} color="#4CAF50" />
//               <Text style={[styles.modalTitle, { marginTop: 10 }]}>Success</Text>
//               <Text style={[styles.modalMessage]}>{successMessage}</Text>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: '#800080', marginTop: 12 }]}
//                 onPress={() => setSuccessModalVisible(false)}
//               >
//                 <Text style={[styles.deleteBtnText, { color: '#fff' }]}>OK</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         <SnackHost />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: '#f9f6ff' },
//   scrollContent: { alignItems: 'center', paddingBottom: 48, paddingTop: 8 },

//   headerArc: {
//     backgroundColor: '#800080',
//     width: '100%',
//     paddingBottom: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//   },
//   headerText: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1, paddingTop: 8 },

//   actionsBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 12,
//     alignSelf: 'center',
//   },

//   // Search
//   searchBarContainer: {
//     backgroundColor: 'transparent',
//     borderTopWidth: 0,
//     borderBottomWidth: 0,
//     padding: 0,
//     flex: 1,
//   },
//   searchInputContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: '#e0d0ef',
//     minHeight: 44,
//   },
//   searchInput: { color: '#000', fontSize: 14 },

//   // Buttons
//   primaryBtn: {
//     backgroundColor: '#800080',
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     marginLeft: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minWidth: 140,
//   },
//   primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

//   // Cards
//   testCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 14,
//     marginVertical: 8,
//     alignSelf: 'center',
//     borderWidth: 1,
//     borderColor: '#efe1fa',
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   cardTitle: { fontSize: 16, fontWeight: '700', color: '#32174d' },
//   cardSubtitle: { color: '#666', marginTop: 6, fontSize: 13 },

//   iconGroup: { flexDirection: 'row', alignItems: 'center' },
//   iconAction: {
//     padding: 10,
//     borderRadius: 10,
//     marginLeft: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   cardBody: { marginTop: 12 },
//   sectionLabel: { fontSize: 12, fontWeight: '700', color: '#6c2eb9', marginBottom: 8 },
//   rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

//   roleChip: {
//     backgroundColor: '#f4ebff',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999,
//     marginRight: 6,
//     marginTop: 6,
//   },
//   roleChipText: { color: '#4b0082', fontWeight: '600' },
//   metaMuted: { color: '#666' },

//   // empty state
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 28,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#efe1fa',
//   },
//   emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '700', color: '#32174d' },
//   emptySubtitle: { marginTop: 6, color: '#6d6d6d' },

//   // Modals
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   modalBox: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     maxHeight: '90%',
//   },
//   modalTitle: { fontSize: 18, fontWeight: '700', color: '#800080', marginBottom: 6 },
//   modalMessage: { fontSize: 14, color: '#333', marginBottom: 8 },

//   modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
//   modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
//   cancelBtn: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
//   cancelBtnText: { color: '#666', fontWeight: '600' },
//   deleteBtn: { backgroundColor: '#e53935' },
//   deleteBtnText: { color: '#fff', fontWeight: '700' },

//   fullBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f3f0fa',
//   },
//   fullBtnActive: { backgroundColor: '#6c2eb9' },
//   fullBtnText: { color: '#4b0082', fontWeight: '700' },
//   fullBtnTextActive: { color: '#fff', fontWeight: '700' },

//   loaderBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },

//   input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },

//   filterOption: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
//   filterOptionSelected: { backgroundColor: '#6c2eb9' },

//   smallMeta: { color: '#888', fontSize: 12 },
// });

// export default TestManagement;


// TestManagement.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  TextInput,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import tw from "twrnc";
import { router } from "expo-router";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { useAuthStore } from "@/store/useAuthStore";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";

type Assessment = {
  _id: string;
  title: string;
  roles: string[];
  questions: { text: string; options: { text: string }[] }[];
};

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function TestManagement() {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // send modal state
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [filterType, setFilterType] = useState<"role" | "organisation" | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const axiosInstance = useAuthStore((s) => s.axiosInstance);
  const deleteAssessmentById = useAssessmentStore((s) => s.deleteAssessmentById);

  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 60;
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get("/assessments");
        setTests(res.data.reverse());
        setError(null);
      } catch (err: any) {
        console.error("Error fetching tests:", err);
        setError("Failed to load tests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [axiosInstance]);

  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFilteredTests(
        tests.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.roles?.some((r) => r.toLowerCase().includes(q))
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
        Toast.show({ type: "success", text1: "Assessment deleted successfully" });
      } else {
        Toast.show({ type: "error", text1: "Failed to delete assessment" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      Toast.show({ type: "error", text1: "Something went wrong while deleting" });
    } finally {
      setModalVisible(false);
      setTestToDelete(null);
    }
  };

  const sanitizeFileName = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "assessment";

  // remove: import XLSX from 'xlsx';

const handleDownloadResponses = async (assessment: Assessment) => {
  try {
    setDownloadingId(assessment._id);

    // fetch responses (same as before)
    const { data } = await axiosInstance.get(`/assessments/${assessment._id}/responses`);

    if (!data || !Array.isArray(data) || data.length === 0) {
      Toast.show({ type: 'info', text1: 'No responses yet for this assessment' });
      return;
    }

    // dynamic import to avoid XLSX.default undefined issues
    let mod: any;
    try {
      mod = await import('xlsx');
    } catch (impErr) {
      console.error('Failed to import xlsx dynamically:', impErr);
      Toast.show({ type: 'error', text1: 'Missing dependency: xlsx', text2: 'Install xlsx and restart the app' });
      return;
    }
    const XLSXLib = mod?.default || mod;
    if (!XLSXLib || !XLSXLib.utils) {
      console.error('XLSX loaded but utils missing', mod);
      Toast.show({ type: 'error', text1: 'xlsx module loaded incorrectly' });
      return;
    }

    // normalize responses
    let rowsData = data;
    if (rowsData.items && Array.isArray(rowsData.items)) rowsData = rowsData.items;

    // collect question keys
    const keys = new Set<string>();
    rowsData.forEach((r: any) => {
      const answers = r.answers || {};
      Object.keys(answers).forEach((k) => keys.add(k));
    });
    const questionKeys = Array.from(keys);

    // build rows for sheet
    const rows = rowsData.map((respRow: any, idx: number) => {
      const base: Record<string, any> = {
        '#': idx + 1,
        Name: respRow.user?.name || respRow.user?.username || 'Anonymous',
        Email: respRow.user?.email || '',
        Designation: respRow.user?.designation || '',
        SubmittedAt: respRow.submittedAt ? new Date(respRow.submittedAt).toLocaleString() : '',
      };
      questionKeys.forEach((qk) => {
        const ans = (respRow.answers && respRow.answers[qk]) || '';
        base[qk] =
          ans && typeof ans === 'object'
            ? (ans.option ?? ans.text ?? '')
            : (typeof ans === 'string' ? ans : '');
      });
      return base;
    });

    // create workbook
    const worksheet = XLSXLib.utils.json_to_sheet(rows, {
      header: ['#', 'Name', 'Email', 'Designation', 'SubmittedAt', ...questionKeys],
    });
    const workbook = XLSXLib.utils.book_new();
    XLSXLib.utils.book_append_sheet(workbook, worksheet, 'Responses');

    // filename safe
    const safe = (s: string) =>
      s?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'assessment';
    const fileName = `${safe(assessment.title)}-responses.xlsx`;

    // download / save
    if (Platform.OS === 'web') {
      const wbout = XLSXLib.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      Toast.show({ type: 'success', text1: 'Downloaded responses' });
      return;
    }

    // native: write base64 and share
    const wbbase64 = XLSXLib.write(workbook, { bookType: 'xlsx', type: 'base64' });
    const baseDir =
      FileSystem.documentDirectory || FileSystem.cacheDirectory || (FileSystem as any).temporaryDirectory || '';
    if (!baseDir) {
      Toast.show({ type: 'error', text1: 'Unable to access storage' });
      return;
    }
    const fileUri = `${baseDir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, wbbase64, { encoding: FileSystem.EncodingType.Base64 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Toast.show({ type: 'success', text1: 'Saved responses', text2: fileUri });
    }
  } catch (error: any) {
    console.error('Download responses error:', error);
    const status = error?.response?.status;
    if (status === 404) {
      Toast.show({
        type: 'error',
        text1: 'Responses endpoint not found (404)',
        text2: 'Check server routes: expected /assessments/:id/responses',
      });
    } else {
      Toast.show({ type: 'error', text1: 'Failed to export responses', text2: error?.message || '' });
    }
  } finally {
    setDownloadingId(null);
  }
};

  // ----------------------
  // Send modal helpers
  // ----------------------
  const openSendModal = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setFilterType(null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue(null);
    setSendModalVisible(true);
  };

  const closeSendModal = () => {
    setSendModalVisible(false);
    setActiveAssessment(null);
    setFilterType(null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  // debounced suggestion fetching
  useEffect(() => {
    if (!filterType) {
      setSuggestions([]);
      return;
    }

    // show local quick suggestions when query empty
    if (!filterQuery || filterQuery.trim().length === 0) {
      if (filterType === "role" && activeAssessment?.roles?.length) {
        setSuggestions(activeAssessment.roles.slice(0, 8));
      } else {
        setSuggestions([]);
      }
      return;
    }

    setLoadingSuggestions(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // debounce 300ms
    debounceRef.current = (setTimeout(async () => {
      try {
        let resp = null;
        const qTrim = filterQuery.trim();

        // Try unified endpoint first
        try {
          resp = await axiosInstance.get("/search/filters", { params: { type: filterType, q: qTrim } });
        } catch (e1) {
          // fallback to specific endpoints
          try {
            if (filterType === "role") {
              resp = await axiosInstance.get("/roles", { params: { q: qTrim } });
            } else {
              // organisation spelled with s? using 'organisations' as you used earlier
              resp = await axiosInstance.get("/organisations", { params: { q: qTrim } });
            }
          } catch (e2) {
            resp = null;
          }
        }

        let items: string[] = [];
        if (resp && resp.data) {
          if (Array.isArray(resp.data)) {
            items = resp.data.map((it: any) => (typeof it === "string" ? it : it.name || it.title || it.organisation || it.value)).filter(Boolean);
          } else if (Array.isArray(resp.data.items)) {
            items = resp.data.items.map((it: any) => it.name || it.title || it.value).filter(Boolean);
          }
        }

        // fallback to roles from activeAssessment + all tests
        if ((!items || items.length === 0) && filterType === "role") {
          const pool = new Set<string>();
          activeAssessment?.roles?.forEach((r) => pool.add(r));
          tests.forEach((t) => t.roles?.forEach((r) => pool.add(r)));
          items = Array.from(pool).filter((r) => r.toLowerCase().includes(qTrim.toLowerCase()));
        }

        setSuggestions(items.slice(0, 25));
      } catch (err) {
        console.warn("Suggestion fetch failed", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
        debounceRef.current = null;
      }
    }, 300) as unknown) as number;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [filterQuery, filterType, activeAssessment, axiosInstance, tests]);

  const confirmSendFromModal = async () => {
    if (!activeAssessment) return;
    if (!filterType) {
      Toast.show({ type: "info", text1: "Choose a filter type (Role or organisation)" });
      return;
    }
    if (!selectedFilterValue) {
      Toast.show({ type: "info", text1: "Select a role or organisation from suggestions" });
      return;
    }

    // Build payload - keep filterType values as 'role' | 'organisation' (matches UI)
    const payload = {
      assessmentId: activeAssessment._id,
      filterType: filterType, // 'role' or 'organisation'
      filterValue: selectedFilterValue,
    };

    try {
      Toast.show({ type: "info", text1: "Sending assessments..." });
      const res = await axiosInstance.post("/assessments/send", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("[SEND OK]", res.status, res.data);
      Toast.show({ type: "success", text1: "Assessment sent" });
      closeSendModal();
    } catch (err: any) {
      console.warn("[SEND FAIL]", err?.response?.data || err?.message || err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || null;

      if (status === 400 && serverMsg && /no users found/i.test(serverMsg)) {
        Toast.show({ type: "error", text1: "No users found for selected filter" });
      } else if (serverMsg) {
        Toast.show({ type: "error", text1: "Send failed", text2: serverMsg });
      } else {
        Toast.show({ type: "error", text1: "Send failed", text2: err?.message || String(err) });
      }
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Arc */}
          <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
            {/* <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </Pressable> */}
            <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
          </View>

          {/* Search + Actions */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <SearchBar
                placeholder="Search assessments..."
                value={search}
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
              />
            </View>

            <TouchableOpacity onPress={() => router.push("/test_pages/addTest")} style={styles.addAssessmentBtn}>
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
                <Text style={styles.emptySubtitle}>Create your first assessment to start tracking responses.</Text>
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
                      <Text style={styles.metaText}>{test.questions?.length || 0} questions</Text>
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

                  <View style={[styles.actionsRow, isTablet ? styles.actionsRowTablet : undefined]}>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={() => openSendModal(test)}>
                      <Icon name="paper-plane" size={16} color="#fff" />
                      <Text style={styles.actionText}>Send</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryAction]}
                      onPress={() =>
                        router.push({
                          pathname: "/test_pages/testResponses",
                          params: { id: test._id },
                        })
                      }
                    >
                      <Icon name="line-chart" size={16} color="#800080" />
                      <Text style={styles.secondaryText}>View Summary</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={[styles.actionButton, styles.downloadAction]} onPress={() => handleDownloadResponses(test)} disabled={downloadingId === test._id}>
                      {downloadingId === test._id ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={16} color="#fff" />}
                      <Text style={styles.actionText}>Download Responses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.editAction]} onPress={() => router.push({ pathname: "/test_pages/modifyTest", params: { id: test._id } })}>
                      <Icon name="edit" size={16} color="#fff" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.deleteAction]} onPress={() => { setTestToDelete(test); setModalVisible(true); }}>
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
            <Text style={styles.modalMessage}>This will permanently remove "{testToDelete?.title}". You cannot undo this action.</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Send Modal */}
      {sendModalVisible && activeAssessment && (
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 700 }]}>
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Send "{activeAssessment.title}"</Text>

            <Text style={{ marginBottom: 8, color: "#444", fontWeight: "600" }}>Choose filter type</Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setFilterType("role");
                  setSelectedFilterValue(null);
                  setFilterQuery("");
                }}
                style={[styles.pillToggle, filterType === "role" ? styles.pillToggleActive : undefined]}
              >
                <Text style={filterType === "role" ? styles.pillToggleTextActive : styles.pillToggleText}>By Role</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFilterType("organisation");
                  setSelectedFilterValue(null);
                  setFilterQuery("");
                }}
                style={[styles.pillToggle, filterType === "organisation" ? styles.pillToggleActive : undefined]}
              >
                <Text style={filterType === "organisation" ? styles.pillToggleTextActive : styles.pillToggleText}>By organisation</Text>
              </TouchableOpacity>
            </View>

            {filterType && (
              <>
                <Text style={{ color: "#444", marginBottom: 6, fontWeight: "600" }}>{`Search ${filterType === "role" ? "role" : "organisation"}`}</Text>

                <View style={{ width: "100%", marginBottom: 8 }}>
                  <TextInput
                    placeholder={filterType === "role" ? "Type role name..." : "Type organisation name..."}
                    value={filterQuery}
                    onChangeText={(t) => {
                      setFilterQuery(t);
                      setSelectedFilterValue(null);
                    }}
                    style={styles.inlineSearchInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ width: "100%", maxHeight: 180 }}>
                  {loadingSuggestions ? (
                    <ActivityIndicator style={{ marginTop: 8 }} />
                  ) : (
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => {
                        const isSelected = selectedFilterValue === item;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedFilterValue(item);
                              setFilterQuery(item);
                            }}
                            style={[styles.suggestionRow, isSelected ? styles.suggestionRowSelected : undefined]}
                          >
                            <Text style={isSelected ? { color: "#fff", fontWeight: "700" } : { color: "#222" }}>{item}</Text>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={() => <Text style={{ color: "#666", paddingVertical: 8 }}>No suggestions. Type to search or enter a value.</Text>}
                    />
                  )}
                </View>
              </>
            )}

            <View style={[styles.modalButtonsContainer, { marginTop: 16 }]}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeSendModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryAction, { paddingVertical: 12 }]} onPress={confirmSendFromModal}>
                <Text style={[styles.deleteButtonText, { color: "#fff" }]}>Send Assessment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
}

/* Styles - reuse your styles and add pill/suggestion styles used above */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9f6ff" },
  scrollContent: { alignItems: "center", paddingBottom: 40 },
  headerArc: {
    backgroundColor: "#800080",
    width: "100%",
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    // borderBottomLeftRadius: 40,
    // borderBottomRightRadius: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerText: { color: "#fff", fontSize: 28, fontWeight: "bold", textAlign: "center", letterSpacing: 1 },
  backButton: { position: "absolute", left: 24, top: 0, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)" },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16, width: "100%", maxWidth: 780, gap: 12 },
  searchContainer: { flex: 1 },
  searchBarContainer: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0, padding: 0 },
  searchInputContainer: { backgroundColor: "#fff", borderRadius: 30, borderWidth: 1, borderColor: "#e0d0ef", minHeight: 48 },
  searchInput: { color: "#000", fontSize: 15 },
  addAssessmentBtn: { height: 52, backgroundColor: "#800080", borderRadius: 16, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 4 },
  addAssessmentText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  listContainer: { width: "100%", maxWidth: 780, paddingHorizontal: 16 },
  testCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginVertical: 10, borderWidth: 1, borderColor: "#efe1fa", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconPill: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f4ebff", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#32174d", flexShrink: 1 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#efe1fa", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  metaText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  cardBody: { marginTop: 8, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#6c2eb9", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  rolesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: { backgroundColor: "#f4ebff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  roleChipText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  metaMuted: { color: "#666", fontSize: 13 },
  actionsRow: { flexDirection: "column", gap: 10 },
  actionsRowTablet: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, flex: 1, minHeight: 48 },
  primaryAction: { backgroundColor: "#6c2eb9", shadowColor: "#6c2eb9", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  downloadAction: { backgroundColor: "#4b0082" },
  editAction: { backgroundColor: "#40916c" },
  deleteAction: { backgroundColor: "#e53935" },
  secondaryAction: { backgroundColor: "#f4ebff", borderWidth: 1, borderColor: "#e0d0ef" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryText: { color: "#4b0082", fontWeight: "600", fontSize: 14 },
  errorText: { textAlign: "center", color: "#e53935", marginTop: 24, fontWeight: "600" },
  emptyState: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 20, padding: 32, borderWidth: 1, borderColor: "#efe1fa", marginTop: 24 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "700", color: "#32174d" },
  emptySubtitle: { marginTop: 4, textAlign: "center", color: "#6d6d6d" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalBox: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  modalIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fdecea", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#3c1053", marginBottom: 8, textAlign: "center" },
  modalMessage: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  modalButtonsContainer: { flexDirection: "row", gap: 12, width: "100%" },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelButton: { borderWidth: 1, borderColor: "#d0c2e8", backgroundColor: "#f9f6ff" },
  cancelButtonText: { color: "#4b0082", fontWeight: "600" },
  deleteButton: { backgroundColor: "#e53935" },
  deleteButtonText: { color: "#fff", fontWeight: "700" },

  /* send modal specific */
  pillToggle: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e6d9f2", backgroundColor: "#fff" },
  pillToggleActive: { backgroundColor: "#6c2eb9", borderColor: "#6c2eb9" },
  pillToggleText: { color: "#4b0082", fontWeight: "700" },
  pillToggleTextActive: { color: "#fff", fontWeight: "700" },
  inlineSearchInput: { borderWidth: 1, borderColor: "#e6d9f2", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, width: "100%", backgroundColor: "#fff" },
  suggestionRow: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f0e9fb", backgroundColor: "#fff" },
  suggestionRowSelected: { backgroundColor: "#6c2eb9" },
});
