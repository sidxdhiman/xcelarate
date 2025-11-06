// app/test_pages/modifyTest.tsx
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Pressable,
    Dimensions,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';

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

export default function ModifyTest() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { fetchAssessmentById, patchAssessmentById } = useAssessmentStore();
    const axiosInstance = useAuthStore((state) => state.axiosInstance);

    const [title, setTitle] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [search, setSearch] = useState('');
    const [promptVisible, setPromptVisible] = useState<'copy' | 'clone' | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [copySelectedQuestions, setCopySelectedQuestions] = useState<string[]>([]);
    const [addingRole, setAddingRole] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || typeof id !== 'string') return;
            try {
                const data = await fetchAssessmentById(id);
                if (data) {
                    setTitle(data.title);
                    setRoles(data.roles || []);
                    setQuestions(data.questions || []);
                }
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load assessment' });
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchExtras = async () => {
            try {
                const res = await axiosInstance.get('/roles');
                setAllRoles(res.data);
            } catch {
                setAllRoles(['Developer', 'Product Manager']);
            }
            try {
                const res2 = await axiosInstance.get('/assessments');
                setAssessments(res2.data.reverse());
            } catch {}
        };
        fetchExtras();
    }, []);

    const addQuestion = () => {
        const newQ: Question = {
            id: uuidv4(),
            text: '',
            options: Array.from({ length: 5 }, () => ({ id: uuidv4(), text: '' })),
        };
        setQuestions((prev) => [...prev, newQ]);
    };

    const updateQuestionText = (qid: string, text: string) =>
        setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, text } : q)));

    const updateOptionText = (qid: string, oid: string, text: string) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid
                    ? { ...q, options: q.options.map((opt) => (opt.id === oid ? { ...opt, text } : opt)) }
                    : q
            )
        );

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

    const handleSubmit = async () => {
        if (!title || roles.length === 0 || questions.length === 0) {
            Alert.alert('Error', 'Please fill all fields and add at least one question.');
            return;
        }
        try {
            setLoading(true);
            const result = await patchAssessmentById(id as string, { title, roles, questions });
            setLoading(false);
            if (result) {
                Toast.show({ type: 'success', text1: 'Assessment Updated!' });
                router.back();
            } else {
                Toast.show({ type: 'error', text1: 'Update failed!' });
            }
        } catch (err) {
            setLoading(false);
            Toast.show({ type: 'error', text1: 'Error saving changes' });
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', minHeight: screenHeight }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.headerArc}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Icon name="arrow-left" size={22} color="white" />
                    </Pressable>
                    <Text style={styles.headerText}>MODIFY ASSESSMENT</Text>
                </View>

                {/* Content */}
                <View style={styles.centeredContent}>
                    <TextInput
                        placeholder="Assessment Title"
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#888"
                    />

                    {/* Roles */}
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

                    {/* Questions */}
                    <Text style={styles.label}>Questions</Text>
                    {questions.map((q, qIdx) => (
                        <View key={q.id} style={styles.questionCard}>
                            <View style={styles.questionHeader}>
                                <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
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

                            {/* Options section */}
                            <Text style={styles.optionsLabel}>Options:</Text>
                            <View style={styles.optionsBox}>
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
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
                        <Text style={styles.addBtnText}>+ Add Question</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.submitBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    optionsLabel: {
        fontWeight: '600',
        color: '#800080',
        marginTop: 6,
        marginBottom: 4,
    },
    optionsBox: {
        backgroundColor: '#f1e6fa',
        borderRadius: 8,
        padding: 8,
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
});
