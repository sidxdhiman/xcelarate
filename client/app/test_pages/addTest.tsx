import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Pressable,
    Dimensions,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { Dropdown } from 'react-native-element-dropdown';
import Checkbox from 'expo-checkbox';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

const screenHeight = Dimensions.get('window').height;

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
            Toast.show({ type: 'info', text1: 'No questions selected to copy!' });
            return;
        }
        setQuestions((prev) => [...prev, ...selectedQs]);
        setPromptVisible(null);
        setCopySelectedQuestions([]);
        setSelectedAssessment(null);
        Toast.show({ type: 'success', text1: 'Questions copied successfully!' });
    };

    const handleCloneAssessment = (assessment: Assessment) => {
        setQuestions(assessment.questions);
        setPromptVisible(null);
        Toast.show({ type: 'success', text1: 'Assessment cloned!' });
    };

    const handleSubmit = async () => {
        const finalQuestions = questions.filter((q) => selectedQuestions.includes(q.id));
        if (!title || roles.length === 0 || finalQuestions.length === 0) {
            Alert.alert('Error', 'Please fill all fields and select at least one question.');
            return;
        }
        try {
            const response = await addAssessment({ title, roles, questions: finalQuestions });
            if (response?._id) {
                const id = response._id;
                const link = `http://localhost:8081/user_pages/${id}`;
                await Clipboard.setStringAsync(link);
                Toast.show({
                    type: 'success',
                    text1: 'Assessment Created!',
                    text2: 'Link copied to clipboard',
                });
                router.back();
            }
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error adding assessment' });
        }
    };

    const filteredAssessments = assessments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={{ flex: 1, minHeight: screenHeight, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.headerArc}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Icon name="arrow-left" size={22} color="white" />
                    </Pressable>
                    <Text style={styles.headerText}>CREATE NEW ASSESSMENT</Text>
                </View>

                {/* Main Centered Content */}
                <View style={styles.centeredContent}>
                    <TextInput
                        placeholder="Assessment Title"
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#888"
                    />

                    {/* Copy / Clone Buttons */}
                    <View style={styles.cloneRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#5b5b5b' }]}
                            onPress={() => setPromptVisible('copy')}
                        >
                            <Icon name="copy" size={16} color="white" />
                            <Text style={styles.actionBtnText}>Copy from Assessment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#800080' }]}
                            onPress={() => setPromptVisible('clone')}
                        >
                            <Icon name="clone" size={16} color="white" />
                            <Text style={styles.actionBtnText}>Clone from Assessment</Text>
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
                                placeholder="New Role"
                                value={newRole}
                                onChangeText={setNewRole}
                                style={styles.addRoleInput}
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.addRoleConfirm} onPress={handleAddNewRole}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Questions Section */}
                    <Text style={styles.label}>Questions</Text>
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
                                    <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setQuestions(questions.filter((x) => x.id !== q.id))}
                                >
                                    <Icon name="trash" size={18} color="#e53935" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                placeholder="Question text"
                                style={styles.inputDark}
                                value={q.text}
                                onChangeText={(text) => updateQuestionText(q.id, text)}
                                placeholderTextColor="#aaa"
                            />

                            {q.options.map((opt, i) => (
                                <TextInput
                                    key={opt.id}
                                    placeholder={`Option ${i + 1}`}
                                    style={styles.optionInput}
                                    value={opt.text}
                                    onChangeText={(text) => updateOptionText(q.id, opt.id, text)}
                                    placeholderTextColor="#aaa"
                                />
                            ))}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
                        <Text style={styles.addBtnText}>+ Add Question</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitBtnText}>
                            {isAddingAssessment ? 'Submitting...' : 'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Copy / Clone Modal */}
            {promptVisible && (
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Pressable style={styles.closeIcon} onPress={() => setPromptVisible(null)}>
                            <Icon name="times" size={20} color="#800080" />
                        </Pressable>

                        {!selectedAssessment ? (
                            <>
                                <Text style={styles.modalTitle}>
                                    {promptVisible === 'copy' ? 'Copy From Assessment' : 'Clone Assessment'}
                                </Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search assessments..."
                                    placeholderTextColor="#888"
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                <FlatList
                                    data={filteredAssessments}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.assessmentItem}
                                            onPress={() =>
                                                promptVisible === 'copy'
                                                    ? setSelectedAssessment(item)
                                                    : handleCloneAssessment(item)
                                            }
                                        >
                                            <Text style={styles.assessmentTitle}>{item.title}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedAssessment(null);
                                            setCopySelectedQuestions([]);
                                        }}
                                    >
                                        <Icon name="arrow-left" size={18} color="#800080" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>{selectedAssessment.title}</Text>
                                </View>

                                <ScrollView style={{ maxHeight: 300 }}>
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

                                <TouchableOpacity style={styles.submitBtn} onPress={handleCopyQuestions}>
                                    <Text style={styles.submitBtnText}>Copy Selected</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 100 },
    headerArc: {
        backgroundColor: '#800080',
        width: '100%',
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    backButton: { position: 'absolute', top: 60, left: 20 },
    headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
    centeredContent: {
        width: '100%',
        maxWidth: 700,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        color: 'black',
    },
    cloneRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 12,
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 6,
    },
    actionBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    label: { color: '#333', fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
    roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 50,
    },
    addRoleIcon: {
        backgroundColor: '#800080',
        width: 50,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    addRoleInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    addRoleInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 50,
        marginRight: 10,
        color: 'black',
    },
    addRoleConfirm: {
        backgroundColor: '#800080',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
    },
    questionCard: {
        backgroundColor: '#f8f6fb',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    questionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    questionTitle: { color: '#333', fontWeight: '600' },
    inputDark: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 10,
        color: 'black',
        marginBottom: 10,
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 10,
        color: 'black',
        marginVertical: 5,
    },
    addBtn: {
        backgroundColor: '#800080',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    addBtnText: { color: '#fff', fontWeight: 'bold' },
    submitBtn: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '90%',
        maxWidth: 500,
        padding: 20,
    },
    closeIcon: { position: 'absolute', top: 15, right: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#800080', marginBottom: 10 },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
        marginBottom: 10,
    },
    assessmentItem: {
        padding: 14,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginVertical: 5,
    },
    assessmentTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    copyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
    copyQuestionText: { color: '#333', flexShrink: 1 },
});

