// app/test_pages/modifyTest.tsx
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Pressable,
    Alert,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { SnackHost, showSnack } from '@/components/Snack';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';

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
                showSnack('Assessment updated');
                router.back();
            } else {
                showSnack('Update failed');
            }
        } catch (err) {
            setLoading(false);
            showSnack('Error saving changes');
        }
    };

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
                        <Text style={styles.headerText}>MODIFY ASSESSMENT</Text>
                    </View>

                    <View style={styles.centeredContent}>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Assessment details</Text>
                            <Text style={styles.sectionSubtitle}>
                                Update the title and target roles for this assessment.
                            </Text>
                            <TextInput
                                placeholder="Assessment title"
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholderTextColor="#8b7ca5"
                            />

                            <Text style={styles.label}>Applicable roles</Text>
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
                                        <Text style={styles.addRoleConfirmText}>Add role</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={[styles.sectionCard, styles.questionsBlock]}>
                            <Text style={styles.sectionTitle}>Questions</Text>
                            <Text style={styles.sectionSubtitle}>
                                Edit, remove or add questions. Options can be adjusted for each question below.
                            </Text>

                            {questions.length === 0 && (
                                <View style={styles.emptyQuestions}>
                                    <Icon name="question-circle-o" size={32} color="#c2a2e2" />
                                    <Text style={styles.emptyTitle}>No questions yet</Text>
                                    <Text style={styles.emptyDescription}>
                                        Use the button below to add a question to this assessment.
                                    </Text>
                                </View>
                            )}

                            {questions.map((q, qIdx) => (
                                <View key={q.id} style={styles.questionCard}>
                                    <View style={styles.questionHeader}>
                                        <View>
                                            <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
                                            <Text style={styles.questionHint}>Update the text or options as needed</Text>
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

                                    <Text style={styles.optionsLabel}>Answer options</Text>
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

                            <TouchableOpacity style={[styles.fullButton, styles.secondaryAction]} onPress={addQuestion}>
                                <Text style={styles.secondaryActionText}>+ Add question</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.fullButton, styles.primaryAction]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.primaryActionText}>{loading ? 'Saving...' : 'Save changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
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
    secondaryAction: {
        backgroundColor: '#f4ebff',
        borderWidth: 1,
        borderColor: '#e0d0ef',
    },
    secondaryActionText: { color: '#4b0082', fontWeight: '600', fontSize: 14 },
    primaryAction: {
        backgroundColor: '#6c2eb9',
        shadowColor: '#6c2eb9',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
