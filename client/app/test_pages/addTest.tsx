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
                    <View style={tw`absolute top-4 left-4`}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Icon name="arrow-left" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerText}>CREATE NEW ASSESSMENT</Text>
                </View>

                <View style={styles.content}>
                    <TextInput
                        placeholder="Test Title"
                        style={styles.input1}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#ccc"
                    />

                    {/* Copy / Clone */}
                    <View style={styles.cloneRow}>
                        <TouchableOpacity
                            style={[styles.cloneBtn, { backgroundColor: '#5b5b5b' }]}
                            onPress={() => setPromptVisible('copy')}
                        >
                            <Icon name="copy" size={16} color="white" />
                            <Text style={styles.cloneBtnText}>Copy from Assessment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.cloneBtn, { backgroundColor: '#800080' }]}
                            onPress={() => setPromptVisible('clone')}
                        >
                            <Icon name="clone" size={16} color="white" />
                            <Text style={styles.cloneBtnText}>Clone from Assessment</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Roles */}
                    <Text style={styles.label}>Applicable Roles:</Text>
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
                            />
                            <TouchableOpacity style={styles.addRoleConfirm} onPress={handleAddNewRole}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Questions */}
                    <Text style={styles.label}>Questions:</Text>
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
                                    <Text style={styles.removeBtn}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder="Question text"
                                style={styles.input2}
                                value={q.text}
                                onChangeText={(text) => updateQuestionText(q.id, text)}
                            />
                            {q.options.map((opt, i) => (
                                <TextInput
                                    key={opt.id}
                                    placeholder={`Option ${i + 1}`}
                                    style={styles.optionInput}
                                    value={opt.text}
                                    onChangeText={(text) => updateOptionText(q.id, opt.id, text)}
                                />
                            ))}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
                        <Text style={styles.addBtnText}>Add Question</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitBtnText}>
                            {isAddingAssessment ? 'Submitting...' : 'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Copy / Clone Overlay */}
            {promptVisible && (
                <View style={styles.overlay}>
                    <View style={styles.promptCard}>
                        <Pressable style={styles.closeIcon} onPress={() => {
                            setPromptVisible(null);
                            setSelectedAssessment(null);
                            setCopySelectedQuestions([]);
                        }}>
                            <Icon name="times" size={20} color="#800080" />
                        </Pressable>

                        {!selectedAssessment ? (
                            <>
                                <Text style={styles.modalTitle}>
                                    {promptVisible === 'copy' ? 'Copy From Assessment' : 'Clone Assessment'}
                                </Text>
                                {/* Search Bar */}
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search assessments..."
                                    placeholderTextColor="#999"
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
                                <View style={styles.questionSelectHeader}>
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
                                                color={copySelectedQuestions.includes(q.id) ? '#800080' : undefined}
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
    container: { minHeight: screenHeight, paddingTop: 50 },
    headerArc: {
        backgroundColor: '#800080',
        width: '100%',
        paddingVertical: 40,
        // paddingTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: { color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: 0.5 },
    content: { paddingHorizontal: 16, paddingBottom: 80, backgroundColor: '#fff' },
    input1: {
        borderWidth: 1,
        borderColor: '#888',
        padding: 14,
        marginTop: 20,
        marginBottom: 16,
        borderRadius: 8,
        color: 'black',
    },
    cloneRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    cloneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 6,
    },
    cloneBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    label: { color: 'black', fontWeight: '600', marginBottom: 10 },
    roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    dropdown: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 55,
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
        marginBottom: 20,
        alignItems: 'center',
    },
    addRoleInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 50,
        marginRight: 10,
    },
    addRoleConfirm: {
        backgroundColor: '#800080',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    questionCard: {
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 14,
        marginBottom: 18,
    },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    questionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    questionTitle: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    removeBtn: { color: '#f66', fontWeight: 'bold' },
    input2: {
        borderWidth: 1,
        borderColor: '#888',
        padding: 10,
        marginVertical: 12,
        borderRadius: 8,
        color: 'white',
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#666',
        padding: 8,
        marginVertical: 6,
        borderRadius: 6,
        color: 'white',
    },
    addBtn: {
        backgroundColor: '#444',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 18,
    },
    addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    submitBtn: {
        backgroundColor: '#800080',
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
        padding: 10,
    },
    promptCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        width: '92%',
        maxHeight: '85%',
        padding: 22,
        elevation: 8,
    },
    closeIcon: { position: 'absolute', top: 14, right: 14 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#800080', marginBottom: 10 },
    searchInput: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
        marginBottom: 15,
    },
    assessmentItem: {
        padding: 14,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginVertical: 5,
    },
    assessmentTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
    questionSelectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    copyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 5 },
    copyQuestionText: { color: '#333', flexShrink: 1 },
});
