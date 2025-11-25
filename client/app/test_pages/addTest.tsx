// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';
// import React, { useState, useEffect, useMemo } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     ScrollView,
//     FlatList,
//     Pressable,
//     Alert,
//     SafeAreaView,
//     StatusBar,
//     Platform,
//     ActivityIndicator,
// } from 'react-native';
// import { router } from 'expo-router';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import * as Clipboard from 'expo-clipboard';
// import { Dropdown } from 'react-native-element-dropdown';
// import Checkbox from 'expo-checkbox';
// import { useAssessmentStore } from '@/store/useAssessmentStore';
// import { useAuthStore } from '@/store/useAuthStore';
// import { SnackHost, showSnack } from '@/components/Snack';
// import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from "expo-file-system/legacy";
//
// interface Option {
//     id: string;
//     text: string;
// }
// interface Question {
//     id: string;
//     text: string;
//     options: Option[];
// }
// interface Assessment {
//     _id: string;
//     title: string;
//     roles: string[];
//     questions: Question[];
// }
//
// export default function AddAssessment() {
//     const { addAssessment, isAddingAssessment } = useAssessmentStore();
//     const axiosInstance = useAuthStore((state) => state.axiosInstance);
//
//     const [title, setTitle] = useState('');
//     const [roles, setRoles] = useState<string[]>([]);
//     const [allRoles, setAllRoles] = useState<string[]>([]);
//     const [questions, setQuestions] = useState<Question[]>([]);
//     const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
//     const [assessments, setAssessments] = useState<Assessment[]>([]);
//     const [search, setSearch] = useState('');
//     const [promptVisible, setPromptVisible] = useState<'copy' | 'clone' | null>(null);
//     const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
//     const [copySelectedQuestions, setCopySelectedQuestions] = useState<string[]>([]);
//     const [addingRole, setAddingRole] = useState(false);
//     const [newRole, setNewRole] = useState('');
//     const [deadline, setDeadline] = useState("");
//     const [bulkModalVisible, setBulkModalVisible] = useState(false);
//     const [bulkLoading, setBulkLoading] = useState(false);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const res = await axiosInstance.get('/assessments');
//                 setAssessments(res.data.reverse());
//             } catch (err) {
//                 console.error(err);
//             }
//         };
//         fetchData();
//     }, []);
//
//     useEffect(() => {
//         const fetchRoles = async () => {
//             try {
//                 const res = await axiosInstance.get('/roles');
//                 setAllRoles(res.data);
//             } catch {
//                 setAllRoles(['Developer', 'Product Manager']);
//             }
//         };
//         fetchRoles();
//     }, []);
//
//     const addQuestion = () => {
//         const newQ = {
//             id: uuidv4(),
//             text: '',
//             options: Array.from({ length: 5 }, () => ({ id: uuidv4(), text: '' })),
//         };
//         setQuestions((prev) => [...prev, newQ]);
//     };
//
//     const updateQuestionText = (id: string, text: string) => {
//         setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
//     };
//
//     const updateOptionText = (qid: string, oid: string, text: string) => {
//         setQuestions((prev) =>
//             prev.map((q) =>
//                 q.id === qid
//                     ? {
//                         ...q,
//                         options: q.options.map((opt) => (opt.id === oid ? { ...opt, text } : opt)),
//                     }
//                     : q
//             )
//         );
//     };
//
//     const handleAddNewRole = async () => {
//         if (!newRole.trim()) return;
//         const role = newRole.trim();
//         if (!allRoles.includes(role)) {
//             setAllRoles((prev) => [...prev, role]);
//             try {
//                 await axiosInstance.post('/roles', { name: role });
//             } catch {}
//         }
//         setRoles((prev) => [...prev, role]);
//         setNewRole('');
//         setAddingRole(false);
//     };
//
//     const handleCopyQuestions = () => {
//         if (!selectedAssessment) return;
//         const selectedQs = selectedAssessment.questions.filter((q) =>
//             copySelectedQuestions.includes(q.id)
//         );
//         if (selectedQs.length === 0) {
//             showSnack('No questions selected to copy');
//             return;
//         }
//         setQuestions((prev) => [...prev, ...selectedQs]);
//         setPromptVisible(null);
//         setCopySelectedQuestions([]);
//         setSelectedAssessment(null);
//         showSnack('Questions copied successfully');
//     };
//
//     const handleCloneAssessment = (assessment: Assessment) => {
//         setQuestions(assessment.questions);
//         setPromptVisible(null);
//         showSnack('Assessment cloned');
//     };
//
//     const handleSubmit = async () => {
//         const finalQuestions = questions.filter((q) => selectedQuestions.includes(q.id));
//         if (!title || roles.length === 0 || finalQuestions.length === 0) {
//             Alert.alert('Error', 'Please fill all fields and select at least one question.');
//             return;
//         }
//         try {
//             const response = await addAssessment({
//                 title,
//                 roles,
//                 questions: finalQuestions,
//                 deadline: deadline || null, // This is correct!
//             });
//
//             if (response?._id) {
//                 const id = response._id;
//                 const link = `http://localhost:8081/user_pages/${id}`;
//                 await Clipboard.setStringAsync(link);
//                 showSnack('Assessment created! Link copied to clipboard');
//                 router.back();
//             }
//         } catch (err) {
//             console.error(err);
//             showSnack('Error adding assessment');
//         }
//     };
//
//     const filteredAssessments = assessments.filter((a) =>
//         a.title.toLowerCase().includes(search.toLowerCase())
//     );
//
//     const headerPaddingTop = useMemo(
//         () => (Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 24),
//         []
//     );
//
//     return (
//         <View style={styles.screen}>
//             <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
//             <SafeAreaView style={{ flex: 1 }}>
//                 <ScrollView contentContainerStyle={styles.container}>
//                     {/* Header */}
//                     <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
//                         <Text style={styles.headerText}>CREATE NEW ASSESSMENT</Text>
//                     </View>
//
//                     {/* Main Centered Content */}
//                     <View style={styles.centeredContent}>
//                         <View style={styles.sectionCard}>
//                             <Text style={styles.sectionTitle}>Assessment Details</Text>
//                             <Text style={styles.sectionSubtitle}>
//                                 Set up the foundation of your assessment with a title and target roles.
//                             </Text>
//
//                             <TextInput
//                                 placeholder="Assessment title"
//                                 style={styles.input}
//                                 value={title}
//                                 onChangeText={setTitle}
//                                 placeholderTextColor="#8b7ca5"
//                             />
//
//                             <Text style={styles.label}>Deadline (Optional)</Text>
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="YYYY-MM-DD"
//                                 value={deadline}
//                                 onChangeText={setDeadline}
//                                 // This makes it a date picker on web
//                                 {...(Platform.OS === 'web' && { type: 'date' })}
//                                 placeholderTextColor="#8b7ca5"
//                             />
//
//                             {/* Copy / Clone Buttons */}
//                             <View style={styles.cloneRow}>
//                                 <TouchableOpacity
//                                     style={[styles.actionBtn, styles.secondaryAction]}
//                                     onPress={() => setPromptVisible('copy')}
//                                 >
//                                     <Icon name="copy" size={16} color="#800080" />
//                                     <Text style={styles.secondaryActionText}>Copy Existing</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity
//                                     style={[styles.actionBtn, styles.primaryAction]}
//                                     onPress={() => setPromptVisible('clone')}
//                                 >
//                                     <Icon name="clone" size={16} color="white" />
//                                     <Text style={styles.primaryActionText}>Clone Existing</Text>
//                                 </TouchableOpacity>
//                             </View>
//
//                             {/* Role Selection */}
//                             <Text style={styles.label}>Applicable Roles</Text>
//                             <View style={styles.roleRow}>
//                                 <View style={{ flex: 1 }}>
//                                     <Dropdown
//                                         style={styles.dropdown}
//                                         data={allRoles.map((r) => ({ label: r, value: r }))}
//                                         search
//                                         labelField="label"
//                                         valueField="value"
//                                         placeholder="Select role"
//                                         value={roles[0]}
//                                         onChange={(item) => setRoles([item.value])}
//                                     />
//                                 </View>
//                                 <TouchableOpacity
//                                     style={styles.addRoleIcon}
//                                     onPress={() => setAddingRole(!addingRole)}
//                                 >
//                                     <Icon name="plus" size={18} color="white" />
//                                 </TouchableOpacity>
//                             </View>
//
//                             {addingRole && (
//                                 <View style={styles.addRoleInline}>
//                                     <TextInput
//                                         placeholder="New role name"
//                                         value={newRole}
//                                         onChangeText={setNewRole}
//                                         style={styles.addRoleInput}
//                                         placeholderTextColor="#8b7ca5"
//                                     />
//                                     <TouchableOpacity style={styles.addRoleConfirm} onPress={handleAddNewRole}>
//                                         <Text style={styles.addRoleConfirmText}>Add Role</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             )}
//                         </View>
//
//                         {/* Questions Section */}
//                         <View style={[styles.sectionCard, styles.questionsBlock]}>
//                             <Text style={styles.sectionTitle}>Questions</Text>
//                             <Text style={styles.sectionSubtitle}>
//                                 Select the questions that should be part of the final assessment. Tick the checkbox to include each question.
//                             </Text>
//
//                             {questions.length === 0 && (
//                                 <View style={styles.emptyQuestions}>
//                                     <Icon name="question-circle-o" size={32} color="#c2a2e2" />
//                                     <Text style={styles.emptyTitle}>No Questions Yet</Text>
//                                     <Text style={styles.emptyDescription}>
//                                         Add your first question to start building the assessment experience.
//                                     </Text>
//                                 </View>
//                             )}
//
//                             {questions.map((q, qIdx) => (
//                                 <View key={q.id} style={styles.questionCard}>
//                                     <View style={styles.questionHeader}>
//                                         <View style={styles.questionLeft}>
//                                             <Checkbox
//                                                 value={selectedQuestions.includes(q.id)}
//                                                 onValueChange={(checked) =>
//                                                     setSelectedQuestions((prev) =>
//                                                         checked ? [...prev, q.id] : prev.filter((id) => id !== q.id)
//                                                     )
//                                                 }
//                                                 color={selectedQuestions.includes(q.id) ? '#800080' : undefined}
//                                             />
//                                             <View>
//                                                 <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
//                                                 <Text style={styles.questionHint}>Tick to include in assessment</Text>
//                                             </View>
//                                         </View>
//                                         <TouchableOpacity
//                                             style={styles.deleteIconBtn}
//                                             onPress={() => setQuestions(questions.filter((x) => x.id !== q.id))}
//                                         >
//                                             <Icon name="trash" size={16} color="#e53935" />
//                                         </TouchableOpacity>
//                                     </View>
//
//                                     <TextInput
//                                         placeholder="Question text"
//                                         style={styles.inputDark}
//                                         value={q.text}
//                                         onChangeText={(text) => updateQuestionText(q.id, text)}
//                                         placeholderTextColor="#8b7ca5"
//                                     />
//
//                                     <Text style={styles.optionsLabel}>Answer Options</Text>
//                                     <View style={styles.optionsBox}>
//                                         {q.options.map((opt, i) => (
//                                             <TextInput
//                                                 key={opt.id}
//                                                 placeholder={`Option ${i + 1}`}
//                                                 style={styles.optionInput}
//                                                 value={opt.text}
//                                                 onChangeText={(text) => updateOptionText(q.id, opt.id, text)}
//                                                 placeholderTextColor="#8b7ca5"
//                                             />
//                                         ))}
//                                     </View>
//                                 </View>
//                             ))}
//
//                             <TouchableOpacity
//                                 style={[styles.fullButton, styles.secondaryAction]}
//                                 onPress={addQuestion}
//                             >
//                                 <Text style={styles.secondaryActionText}>+ Add Question</Text>
//                             </TouchableOpacity>
//                         </View>
//
//                         <TouchableOpacity
//                             style={[styles.fullButton, styles.primaryAction]}
//                             onPress={handleSubmit}
//                         >
//                             <Text style={styles.primaryActionText}>
//                                 {isAddingAssessment ? 'Submitting...' : 'Create Assessment'}
//                             </Text>
//                         </TouchableOpacity>
//                     </View>
//                 </ScrollView>
//             </SafeAreaView>
//
//             {/* Copy / Clone Modal */}
//             {promptVisible && (
//                 <View style={styles.overlay}>
//                     <View style={styles.modalBox}>
//                         <Pressable style={styles.closeIcon} onPress={() => setPromptVisible(null)}>
//                             <Icon name="times" size={18} color="#800080" />
//                         </Pressable>
//
//                         {!selectedAssessment ? (
//                             <>
//                                 <Text style={styles.modalTitle}>
//                                     {promptVisible === 'copy' ? 'Copy from assessment' : 'Clone assessment'}
//                                 </Text>
//                                 <Text style={styles.modalSubtitle}>
//                                     Bring in existing content from another assessment to save time.
//                                 </Text>
//                                 <TextInput
//                                     style={styles.searchInput}
//                                     placeholder="Search assessments..."
//                                     placeholderTextColor="#8b7ca5"
//                                     value={search}
//                                     onChangeText={setSearch}
//                                 />
//                                 <FlatList
//                                     data={filteredAssessments}
//                                     keyExtractor={(item) => item._id}
//                                     style={styles.modalList}
//                                     renderItem={({ item }) => (
//                                         <TouchableOpacity
//                                             style={styles.assessmentItem}
//                                             onPress={() =>
//                                                 promptVisible === 'copy'
//                                                     ? setSelectedAssessment(item)
//                                                     : handleCloneAssessment(item)
//                                             }
//                                         >
//                                             <Icon name="file-text-o" size={16} color="#800080" />
//                                             <View style={{ flex: 1 }}>
//                                                 <Text style={styles.assessmentTitle}>{item.title}</Text>
//                                                 <Text style={styles.assessmentMeta}>
//                                                     {item.questions.length} questions · {item.roles.join(', ')}
//                                                 </Text>
//                                             </View>
//                                             <Icon name="angle-right" size={18} color="#c2a2e2" />
//                                         </TouchableOpacity>
//                                     )}
//                                     ListEmptyComponent={
//                                         <View style={styles.emptyAssessments}>
//                                             <Text style={styles.emptyTitle}>No Matching Assessments</Text>
//                                             <Text style={styles.emptyDescription}>
//                                                 Try a different keyword or build questions manually.
//                                             </Text>
//                                         </View>
//                                     }
//                                 />
//                             </>
//                         ) : (
//                             <>
//                                 <View style={styles.modalHeader}>
//                                     <TouchableOpacity
//                                         style={styles.backIcon}
//                                         onPress={() => {
//                                             setSelectedAssessment(null);
//                                             setCopySelectedQuestions([]);
//                                         }}
//                                     >
//                                         <Icon name="arrow-left" size={16} color="#800080" />
//                                     </TouchableOpacity>
//                                     <Text style={styles.modalTitle}>{selectedAssessment.title}</Text>
//                                 </View>
//
//                                 <Text style={styles.modalSubtitle}>
//                                     Select the questions you would like to copy into this assessment.
//                                 </Text>
//
//                                 <ScrollView style={styles.questionScroll}>
//                                     {selectedAssessment.questions.map((q) => (
//                                         <View key={q.id} style={styles.copyRow}>
//                                             <Checkbox
//                                                 value={copySelectedQuestions.includes(q.id)}
//                                                 onValueChange={(checked) =>
//                                                     setCopySelectedQuestions((prev) =>
//                                                         checked
//                                                             ? [...prev, q.id]
//                                                             : prev.filter((id) => id !== q.id)
//                                                     )
//                                                 }
//                                                 color={
//                                                     copySelectedQuestions.includes(q.id) ? '#800080' : undefined
//                                                 }
//                                             />
//                                             <Text style={styles.copyQuestionText}>{q.text}</Text>
//                                         </View>
//                                     ))}
//                                 </ScrollView>
//
//                                 <TouchableOpacity
//                                     style={[styles.fullButton, styles.primaryAction]}
//                                     onPress={handleCopyQuestions}
//                                 >
//                                     <Text style={styles.primaryActionText}>Copy Selected</Text>
//                                 </TouchableOpacity>
//                             </>
//                         )}
//                     </View>
//                 </View>
//             )}
//             <SnackHost />
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     screen: { flex: 1, backgroundColor: '#f9f6ff' },
//     container: { paddingBottom: 120, alignItems: 'center' },
//     headerArc: {
//         backgroundColor: '#800080',
//         width: '100%',
//         paddingBottom: 36,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 20,
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOpacity: 0.15,
//         shadowRadius: 6,
//         shadowOffset: { width: 0, height: 4 },
//     },
//     backButton: {
//         display: 'none',
//     },
//     headerText: {
//         color: '#fff',
//         fontSize: 26,
//         fontWeight: 'bold',
//         letterSpacing: 1,
//         textAlign: 'center',
//         paddingHorizontal: 24,
//     },
//     centeredContent: {
//         width: '100%',
//         maxWidth: 780,
//         alignSelf: 'center',
//         paddingHorizontal: 16,
//         gap: 16,
//     },
//     sectionCard: {
//         backgroundColor: '#fff',
//         borderRadius: 20,
//         padding: 20,
//         borderWidth: 1,
//         borderColor: '#efe1fa',
//         shadowColor: '#000',
//         shadowOpacity: 0.08,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//         elevation: 3,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#32174d',
//         marginBottom: 6,
//     },
//     sectionSubtitle: {
//         color: '#6d6d6d',
//         marginBottom: 20,
//         lineHeight: 20,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//         backgroundColor: '#fff',
//         padding: 14,
//         borderRadius: 14,
//         marginBottom: 20,
//         color: 'black',
//         fontSize: 15,
//         shadowColor: '#000',
//         shadowOpacity: 0.06,
//         shadowRadius: 6,
//         shadowOffset: { width: 0, height: 3 },
//         elevation: 2,
//     },
//     cloneRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 24,
//         gap: 12,
//     },
//     actionBtn: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderRadius: 12,
//         paddingVertical: 14,
//         justifyContent: 'center',
//         flex: 1,
//         gap: 10,
//     },
//     secondaryAction: {
//         backgroundColor: '#f4ebff',
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//     },
//     primaryAction: {
//         backgroundColor: '#6c2eb9',
//         shadowColor: '#6c2eb9',
//         shadowOpacity: 0.25,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//         elevation: 4,
//     },
//     secondaryActionText: { color: '#4b0082', fontWeight: '600', fontSize: 14 },
//     primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
//     label: { color: '#4b0082', fontWeight: '700', fontSize: 14, marginBottom: 10, letterSpacing: 0.5 },
//     roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
//     dropdown: {
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//         borderRadius: 12,
//         paddingHorizontal: 12,
//         height: 52,
//         backgroundColor: '#fff',
//     },
//     addRoleIcon: {
//         backgroundColor: '#800080',
//         width: 52,
//         height: 52,
//         borderRadius: 14,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginLeft: 12,
//         elevation: 3,
//         shadowColor: '#800080',
//         shadowOpacity: 0.25,
//         shadowRadius: 6,
//         shadowOffset: { width: 0, height: 4 },
//     },
//     addRoleInline: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     addRoleInput: {
//         flex: 1,
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//         borderRadius: 12,
//         paddingHorizontal: 12,
//         height: 52,
//         marginRight: 12,
//         color: 'black',
//         backgroundColor: '#fff',
//     },
//     addRoleConfirm: {
//         backgroundColor: '#6c2eb9',
//         paddingHorizontal: 20,
//         paddingVertical: 14,
//         borderRadius: 12,
//         elevation: 3,
//         shadowColor: '#6c2eb9',
//         shadowOpacity: 0.25,
//         shadowRadius: 6,
//         shadowOffset: { width: 0, height: 4 },
//     },
//     addRoleConfirmText: { color: '#fff', fontWeight: '700' },
//     questionsBlock: { gap: 12 },
//     emptyQuestions: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#fdfbff',
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: '#efe1fa',
//         padding: 24,
//         marginBottom: 16,
//     },
//     emptyTitle: { fontSize: 16, fontWeight: '700', color: '#32174d', marginTop: 10 },
//     emptyDescription: { color: '#6d6d6d', textAlign: 'center', marginTop: 6 },
//     questionCard: {
//         backgroundColor: '#fff',
//         borderRadius: 16,
//         padding: 18,
//         marginBottom: 18,
//         borderWidth: 1,
//         borderColor: '#efe1fa',
//         shadowColor: '#000',
//         shadowOpacity: 0.05,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//         elevation: 2,
//     },
//     questionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 12,
//     },
//     questionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//     questionTitle: { color: '#32174d', fontWeight: '700', fontSize: 15 },
//     questionHint: { color: '#8b7ca5', fontSize: 12 },
//     deleteIconBtn: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#fdecea',
//     },
//     inputDark: {
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 12,
//         color: 'black',
//         marginBottom: 12,
//         fontSize: 15,
//         shadowColor: '#000',
//         shadowOpacity: 0.04,
//         shadowRadius: 5,
//         shadowOffset: { width: 0, height: 3 },
//         elevation: 2,
//     },
//     optionsLabel: {
//         fontWeight: '600',
//         color: '#800080',
//         marginTop: 6,
//         marginBottom: 8,
//     },
//     optionsBox: {
//         backgroundColor: '#f9f3ff',
//         borderRadius: 12,
//         padding: 12,
//         borderWidth: 1,
//         borderColor: '#efe1fa',
//         gap: 10,
//     },
//     optionInput: {
//         borderWidth: 1,
//         borderColor: '#dfc9f6',
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 12,
//         color: 'black',
//         fontSize: 14,
//     },
//     fullButton: {
//         borderRadius: 14,
//         paddingVertical: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 4,
//     },
//     overlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.45)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 24,
//     },
//     modalBox: {
//         backgroundColor: 'white',
//         borderRadius: 20,
//         width: '100%',
//         maxWidth: 520,
//         padding: 24,
//         shadowColor: '#000',
//         shadowOpacity: 0.2,
//         shadowRadius: 12,
//         shadowOffset: { width: 0, height: 8 },
//         elevation: 6,
//     },
//     closeIcon: {
//         position: 'absolute',
//         top: 16,
//         right: 16,
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#f5ecff',
//     },
//     modalTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#32174d',
//         marginBottom: 6,
//         paddingRight: 32,
//     },
//     modalSubtitle: {
//         fontSize: 14,
//         color: '#6d6d6d',
//         marginBottom: 16,
//         paddingRight: 32,
//     },
//     searchInput: {
//         borderWidth: 1,
//         borderColor: '#e0d0ef',
//         borderRadius: 12,
//         paddingHorizontal: 12,
//         height: 50,
//         marginBottom: 14,
//         backgroundColor: '#fff',
//     },
//     modalList: { maxHeight: 320 },
//     assessmentItem: {
//         paddingVertical: 14,
//         paddingHorizontal: 12,
//         borderWidth: 1,
//         borderColor: '#efe1fa',
//         borderRadius: 14,
//         marginVertical: 6,
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//         backgroundColor: '#fdfbff',
//     },
//     assessmentTitle: { fontSize: 15, color: '#32174d', fontWeight: '600' },
//     assessmentMeta: { fontSize: 12, color: '#8b7ca5', marginTop: 2 },
//     emptyAssessments: {
//         padding: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     modalHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//         marginBottom: 12,
//     },
//     backIcon: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         backgroundColor: '#f5ecff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     questionScroll: { maxHeight: 320, marginBottom: 12 },
//     copyRow: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: 12,
//         marginVertical: 8,
//     },
//     copyQuestionText: { color: '#32174d', flexShrink: 1 },
// });
//


import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Pressable,
    Alert,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    Modal, // <--- THIS WAS MISSING. I ADDED IT HERE.
} from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { Dropdown } from 'react-native-element-dropdown';
import Checkbox from 'expo-checkbox';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SnackHost, showSnack } from '@/components/Snack';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system"; // Changed from /legacy to standard for newer Expo versions

interface Option {
    id: string;
    text: string;
}
interface Question {
    id: string;
    text: string;
    options: Option[];
}
interface Assessment {
    _id: string;
    title: string;
    roles: string[];
    questions: Question[];
}

export default function AddAssessment() {
    const { addAssessment, isAddingAssessment } = useAssessmentStore();

    // @ts-ignore
    const parseBulkQuestions = useAssessmentStore((s) => s.parseBulkQuestions);

    const axiosInstance = useAuthStore((state) => state.axiosInstance);

    const [title, setTitle] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [search, setSearch] = useState('');
    const [promptVisible, setPromptVisible] = useState<'copy' | 'clone' | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [copySelectedQuestions, setCopySelectedQuestions] = useState<string[]>([]);
    const [addingRole, setAddingRole] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [deadline, setDeadline] = useState("");

    // Bulk Upload States
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get('/assessments');
                setAssessments(res.data.reverse());
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axiosInstance.get('/roles');
                setAllRoles(res.data);
            } catch {
                setAllRoles(['Developer', 'Product Manager']);
            }
        };
        fetchRoles();
    }, []);

    const addQuestion = () => {
        const newQ = {
            id: uuidv4(),
            text: '',
            options: Array.from({ length: 5 }, () => ({ id: uuidv4(), text: '' })),
        };
        setQuestions((prev) => [...prev, newQ]);
        // Auto select the new manually added question
        setSelectedQuestions((prev) => [...prev, newQ.id]);
    };

    const updateQuestionText = (id: string, text: string) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
    };

    const updateOptionText = (qid: string, oid: string, text: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid
                    ? {
                        ...q,
                        options: q.options.map((opt) => (opt.id === oid ? { ...opt, text } : opt)),
                    }
                    : q
            )
        );
    };

    const handleAddNewRole = async () => {
        if (!newRole.trim()) return;
        const role = newRole.trim();
        if (!allRoles.includes(role)) {
            setAllRoles((prev) => [...prev, role]);
            try {
                await axiosInstance.post('/roles', { name: role });
            } catch {}
        }
        setRoles((prev) => [...prev, role]);
        setNewRole('');
        setAddingRole(false);
    };

    const handleCopyQuestions = () => {
        if (!selectedAssessment) return;
        const selectedQs = selectedAssessment.questions.filter((q) =>
            copySelectedQuestions.includes(q.id)
        );
        if (selectedQs.length === 0) {
            showSnack('No questions selected to copy');
            return;
        }
        setQuestions((prev) => [...prev, ...selectedQs]);

        // Auto select copied questions
        const newIds = selectedQs.map(q => q.id);
        setSelectedQuestions(prev => [...prev, ...newIds]);

        setPromptVisible(null);
        setCopySelectedQuestions([]);
        setSelectedAssessment(null);
        showSnack('Questions copied successfully');
    };

    const handleCloneAssessment = (assessment: Assessment) => {
        setQuestions(assessment.questions);
        // Auto select all cloned questions
        const allIds = assessment.questions.map(q => q.id);
        setSelectedQuestions(allIds);

        setPromptVisible(null);
        showSnack('Assessment cloned');
    };

    // --- BULK UPLOAD LOGIC ---
    const handleDownloadFormat = async () => {
        // Replace this URL with your hosted excel file link if available
        const fileUrl = "https://github.com/sidxdhiman/xcelarate/raw/main/client/assets/format_QuestionsUpload.xlsx";
        const fileName = "format_QuestionsUpload.xlsx";

        if (Platform.OS === "web") {
            const anchor = document.createElement("a");
            anchor.href = fileUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        } else {
            const downloadUri = FileSystem.documentDirectory + fileName;
            try {
                const result = await FileSystem.downloadAsync(fileUrl, downloadUri);
                Alert.alert("Download Complete", `Saved to: ${result.uri}`);
            } catch (e) {
                showSnack("Error downloading format file");
            }
        }
    };

    const handleBulkUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel",
                ],
                copyToCacheDirectory: false,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const file = result.assets[0];
            const formData = new FormData();

            if (Platform.OS === "web") {
                if (file.file) {
                    formData.append("file", file.file);
                } else {
                    const response = await fetch(file.uri);
                    const blob = await response.blob();
                    formData.append("file", blob, file.name);
                }
            } else {
                // @ts-ignore
                formData.append("file", {
                    uri: file.uri,
                    name: file.name,
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            }

            setBulkLoading(true);

            // Call the backend to parse
            const response = await parseBulkQuestions(formData);

            if (response.success && response.data) {
                const newQuestions = response.data;

                // Add new questions to state
                setQuestions((prev) => [...prev, ...newQuestions]);

                // Auto-select the uploaded questions
                const newIds = newQuestions.map((q: any) => q.id);
                setSelectedQuestions((prev) => [...prev, ...newIds]);

                showSnack(`${newQuestions.length} questions added!`);
                setBulkModalVisible(false);
            } else {
                showSnack(response.message || "Failed to parse questions");
            }
        } catch (err) {
            console.error(err);
            showSnack("Error uploading file");
        } finally {
            setBulkLoading(false);
        }
    };
    // -------------------------

    const handleSubmit = async () => {
        const finalQuestions = questions.filter((q) => selectedQuestions.includes(q.id));
        if (!title || roles.length === 0 || finalQuestions.length === 0) {
            Alert.alert('Error', 'Please fill all fields and select at least one question.');
            return;
        }
        try {
            const response = await addAssessment({
                title,
                roles,
                questions: finalQuestions,
                deadline: deadline || null,
            });

            if (response?._id) {
                const id = response._id;
                const link = `https://xcelarate-client.onrender.com/assessment/${id}`;
                await Clipboard.setStringAsync(link);
                showSnack('Assessment created! Link copied to clipboard');
                router.back();
            }
        } catch (err) {
            console.error(err);
            showSnack('Error adding assessment');
        }
    };

    const filteredAssessments = assessments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    const headerPaddingTop = useMemo(
        () => (Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 24),
        []
    );

    return (
        <View style={styles.screen}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Header */}
                    <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
                        <Text style={styles.headerText}>CREATE NEW ASSESSMENT</Text>
                    </View>

                    {/* Main Centered Content */}
                    <View style={styles.centeredContent}>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Assessment Details</Text>
                            <Text style={styles.sectionSubtitle}>
                                Set up the foundation of your assessment with a title and target roles.
                            </Text>

                            <TextInput
                                placeholder="Assessment title"
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholderTextColor="#8b7ca5"
                            />

                            <Text style={styles.label}>Deadline (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={deadline}
                                onChangeText={setDeadline}
                                {...(Platform.OS === 'web' && { type: 'date' })}
                                placeholderTextColor="#8b7ca5"
                            />

                            {/* Copy / Clone Buttons */}
                            <View style={styles.cloneRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.secondaryAction]}
                                    onPress={() => setPromptVisible('copy')}
                                >
                                    <Icon name="copy" size={16} color="#800080" />
                                    <Text style={styles.secondaryActionText}>Copy Existing</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.primaryAction]}
                                    onPress={() => setPromptVisible('clone')}
                                >
                                    <Icon name="clone" size={16} color="white" />
                                    <Text style={styles.primaryActionText}>Clone Existing</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Role Selection */}
                            <Text style={styles.label}>Applicable Roles</Text>
                            <View style={styles.roleRow}>
                                <View style={{ flex: 1 }}>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={allRoles.map((r) => ({ label: r, value: r }))}
                                        search
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select role"
                                        value={roles[0]}
                                        onChange={(item) => setRoles([item.value])}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.addRoleIcon}
                                    onPress={() => setAddingRole(!addingRole)}
                                >
                                    <Icon name="plus" size={18} color="white" />
                                </TouchableOpacity>
                            </View>

                            {addingRole && (
                                <View style={styles.addRoleInline}>
                                    <TextInput
                                        placeholder="New role name"
                                        value={newRole}
                                        onChangeText={setNewRole}
                                        style={styles.addRoleInput}
                                        placeholderTextColor="#8b7ca5"
                                    />
                                    <TouchableOpacity style={styles.addRoleConfirm} onPress={handleAddNewRole}>
                                        <Text style={styles.addRoleConfirmText}>Add Role</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Questions Section */}
                        <View style={[styles.sectionCard, styles.questionsBlock]}>
                            <Text style={styles.sectionTitle}>Questions</Text>
                            <Text style={styles.sectionSubtitle}>
                                Select the questions that should be part of the final assessment. Tick the checkbox to include each question.
                            </Text>

                            {questions.length === 0 && (
                                <View style={styles.emptyQuestions}>
                                    <Icon name="question-circle-o" size={32} color="#c2a2e2" />
                                    <Text style={styles.emptyTitle}>No Questions Yet</Text>
                                    <Text style={styles.emptyDescription}>
                                        Add your first question manually or use Bulk Upload.
                                    </Text>
                                </View>
                            )}

                            {questions.map((q, qIdx) => (
                                <View key={q.id} style={styles.questionCard}>
                                    <View style={styles.questionHeader}>
                                        <View style={styles.questionLeft}>
                                            <Checkbox
                                                value={selectedQuestions.includes(q.id)}
                                                onValueChange={(checked) =>
                                                    setSelectedQuestions((prev) =>
                                                        checked ? [...prev, q.id] : prev.filter((id) => id !== q.id)
                                                    )
                                                }
                                                color={selectedQuestions.includes(q.id) ? '#800080' : undefined}
                                            />
                                            <View>
                                                <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
                                                <Text style={styles.questionHint}>Tick to include in assessment</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.deleteIconBtn}
                                            onPress={() => setQuestions(questions.filter((x) => x.id !== q.id))}
                                        >
                                            <Icon name="trash" size={16} color="#e53935" />
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput
                                        placeholder="Question text"
                                        style={styles.inputDark}
                                        value={q.text}
                                        onChangeText={(text) => updateQuestionText(q.id, text)}
                                        placeholderTextColor="#8b7ca5"
                                    />

                                    <Text style={styles.optionsLabel}>Answer Options</Text>
                                    <View style={styles.optionsBox}>
                                        {q.options.map((opt, i) => (
                                            <TextInput
                                                key={opt.id}
                                                placeholder={`Option ${i + 1}`}
                                                style={styles.optionInput}
                                                value={opt.text}
                                                onChangeText={(text) => updateOptionText(q.id, opt.id, text)}
                                                placeholderTextColor="#8b7ca5"
                                            />
                                        ))}
                                    </View>
                                </View>
                            ))}

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    style={[styles.fullButton, styles.secondaryAction, { flex: 1 }]}
                                    onPress={addQuestion}
                                >
                                    <Text style={styles.secondaryActionText}>+ Add Manual</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.fullButton, { backgroundColor: '#9b59b6', flex: 1 }]}
                                    onPress={() => setBulkModalVisible(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                        <Icon name="upload" size={16} color="white" />
                                        <Text style={{ color: 'white', fontWeight: '700' }}>Bulk Upload</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.fullButton, styles.primaryAction]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.primaryActionText}>
                                {isAddingAssessment ? 'Submitting...' : 'Create Assessment'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Copy / Clone Modal */}
            {promptVisible && (
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Pressable style={styles.closeIcon} onPress={() => setPromptVisible(null)}>
                            <Icon name="times" size={18} color="#800080" />
                        </Pressable>

                        {!selectedAssessment ? (
                            <>
                                <Text style={styles.modalTitle}>
                                    {promptVisible === 'copy' ? 'Copy from assessment' : 'Clone assessment'}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Bring in existing content from another assessment to save time.
                                </Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search assessments..."
                                    placeholderTextColor="#8b7ca5"
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                <FlatList
                                    data={filteredAssessments}
                                    keyExtractor={(item) => item._id}
                                    style={styles.modalList}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.assessmentItem}
                                            onPress={() =>
                                                promptVisible === 'copy'
                                                    ? setSelectedAssessment(item)
                                                    : handleCloneAssessment(item)
                                            }
                                        >
                                            <Icon name="file-text-o" size={16} color="#800080" />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.assessmentTitle}>{item.title}</Text>
                                                <Text style={styles.assessmentMeta}>
                                                    {item.questions.length} questions · {item.roles.join(', ')}
                                                </Text>
                                            </View>
                                            <Icon name="angle-right" size={18} color="#c2a2e2" />
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.emptyAssessments}>
                                            <Text style={styles.emptyTitle}>No Matching Assessments</Text>
                                            <Text style={styles.emptyDescription}>
                                                Try a different keyword or build questions manually.
                                            </Text>
                                        </View>
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        style={styles.backIcon}
                                        onPress={() => {
                                            setSelectedAssessment(null);
                                            setCopySelectedQuestions([]);
                                        }}
                                    >
                                        <Icon name="arrow-left" size={16} color="#800080" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>{selectedAssessment.title}</Text>
                                </View>

                                <Text style={styles.modalSubtitle}>
                                    Select the questions you would like to copy into this assessment.
                                </Text>

                                <ScrollView style={styles.questionScroll}>
                                    {selectedAssessment.questions.map((q) => (
                                        <View key={q.id} style={styles.copyRow}>
                                            <Checkbox
                                                value={copySelectedQuestions.includes(q.id)}
                                                onValueChange={(checked) =>
                                                    setCopySelectedQuestions((prev) =>
                                                        checked
                                                            ? [...prev, q.id]
                                                            : prev.filter((id) => id !== q.id)
                                                    )
                                                }
                                                color={
                                                    copySelectedQuestions.includes(q.id) ? '#800080' : undefined
                                                }
                                            />
                                            <Text style={styles.copyQuestionText}>{q.text}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.fullButton, styles.primaryAction]}
                                    onPress={handleCopyQuestions}
                                >
                                    <Text style={styles.primaryActionText}>Copy Selected</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* === Bulk Upload Modal === */}
            <Modal visible={bulkModalVisible} animationType="slide" transparent onRequestClose={() => setBulkModalVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Pressable style={styles.closeIcon} onPress={() => setBulkModalVisible(false)}>
                            <Icon name="times" size={18} color="#800080" />
                        </Pressable>

                        <Text style={styles.modalTitle}>Upload Questions</Text>
                        <Text style={styles.modalSubtitle}>
                            Upload an Excel file with columns: Question, Option 1, Option 2...
                        </Text>

                        <View style={{ gap: 12, marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.fullButton, { backgroundColor: '#9b59b6' }]}
                                onPress={handleDownloadFormat}
                            >
                                <View style={{flexDirection: 'row', alignItems:'center', gap: 8, justifyContent: 'center'}}>
                                    <Icon name="download" size={16} color="white" />
                                    <Text style={{color: 'white', fontWeight: '600'}}>Download Format</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.fullButton, styles.primaryAction]}
                                onPress={handleBulkUpload}
                                disabled={bulkLoading}
                            >
                                {bulkLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <View style={{flexDirection: 'row', alignItems:'center', gap: 8, justifyContent: 'center'}}>
                                        <Icon name="upload" size={16} color="white" />
                                        <Text style={styles.primaryActionText}>Upload File</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SnackHost />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f9f6ff' },
    container: { paddingBottom: 120, alignItems: 'center' },
    headerArc: {
        backgroundColor: '#800080',
        width: '100%',
        paddingBottom: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    backButton: {
        display: 'none',
    },
    headerText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 1,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    centeredContent: {
        width: '100%',
        maxWidth: 780,
        alignSelf: 'center',
        paddingHorizontal: 16,
        gap: 16,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#efe1fa',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#32174d',
        marginBottom: 6,
    },
    sectionSubtitle: {
        color: '#6d6d6d',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0d0ef',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 14,
        marginBottom: 20,
        color: 'black',
        fontSize: 15,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    cloneRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        flex: 1,
        gap: 10,
    },
    secondaryAction: {
        backgroundColor: '#f4ebff',
        borderWidth: 1,
        borderColor: '#e0d0ef',
    },
    primaryAction: {
        backgroundColor: '#6c2eb9',
        shadowColor: '#6c2eb9',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    secondaryActionText: { color: '#4b0082', fontWeight: '600', fontSize: 14 },
    primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    label: { color: '#4b0082', fontWeight: '700', fontSize: 14, marginBottom: 10, letterSpacing: 0.5 },
    roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    dropdown: {
        borderWidth: 1,
        borderColor: '#e0d0ef',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
        backgroundColor: '#fff',
    },
    addRoleIcon: {
        backgroundColor: '#800080',
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        elevation: 3,
        shadowColor: '#800080',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    addRoleInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    addRoleInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0d0ef',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
        marginRight: 12,
        color: 'black',
        backgroundColor: '#fff',
    },
    addRoleConfirm: {
        backgroundColor: '#6c2eb9',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#6c2eb9',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    addRoleConfirmText: { color: '#fff', fontWeight: '700' },
    questionsBlock: { gap: 12 },
    emptyQuestions: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdfbff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#efe1fa',
        padding: 24,
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#32174d', marginTop: 10 },
    emptyDescription: { color: '#6d6d6d', textAlign: 'center', marginTop: 6 },
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#efe1fa',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    questionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    questionTitle: { color: '#32174d', fontWeight: '700', fontSize: 15 },
    questionHint: { color: '#8b7ca5', fontSize: 12 },
    deleteIconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdecea',
    },
    inputDark: {
        borderWidth: 1,
        borderColor: '#e0d0ef',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        color: 'black',
        marginBottom: 12,
        fontSize: 15,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    optionsLabel: {
        fontWeight: '600',
        color: '#800080',
        marginTop: 6,
        marginBottom: 8,
    },
    optionsBox: {
        backgroundColor: '#f9f3ff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#efe1fa',
        gap: 10,
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#dfc9f6',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        color: 'black',
        fontSize: 14,
    },
    fullButton: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
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
        zIndex: 1000,
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxWidth: 520,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
    closeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5ecff',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#32174d',
        marginBottom: 6,
        paddingRight: 32,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6d6d6d',
        marginBottom: 16,
        paddingRight: 32,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#e0d0ef',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 14,
        backgroundColor: '#fff',
    },
    modalList: { maxHeight: 320 },
    assessmentItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#efe1fa',
        borderRadius: 14,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fdfbff',
    },
    assessmentTitle: { fontSize: 15, color: '#32174d', fontWeight: '600' },
    assessmentMeta: { fontSize: 12, color: '#8b7ca5', marginTop: 2 },
    emptyAssessments: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    backIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5ecff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionScroll: { maxHeight: 320, marginBottom: 12 },
    copyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginVertical: 8,
    },
    copyQuestionText: { color: '#32174d', flexShrink: 1 },
});