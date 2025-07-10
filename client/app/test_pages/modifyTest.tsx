import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import Toast from 'react-native-toast-message';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function ModifyTest() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchAssessmentById, modifyAssessment } = useAssessmentStore();

  const [title, setTitle] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const roleOptions = ['Product Manager', 'Developer', 'Applicable to All'];

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchTest = async () => {
      try {
        const data = await fetchAssessmentById(id);
        if (data) {
          setTitle(data.title || '');
          setRoles(data.roles || []);
          setQuestions(
            (data.questions || []).map((q: any) => ({
              id: q.id || uuidv4(),
              text: q.text,
              options: (q.options || []).map((opt: any) => ({
                id: opt.id || uuidv4(),
                text: opt.text,
              })),
            }))
          );
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to load test' });
      }
    };

    fetchTest();
  }, [id]);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: uuidv4(),
        text: '',
        options: Array.from({ length: 5 }, () => ({ id: uuidv4(), text: '' })),
      },
    ]);
  };

  const removeQuestion = (qid: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qid));
  };

  const updateQuestionText = (qid: string, text: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === qid ? { ...q, text } : q))
    );
  };

  const updateOptionText = (qid: string, oid: string, text: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === oid ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const toggleRole = (role: string) => {
    setRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (!title || roles.length === 0 || questions.length === 0) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);
      const result = await modifyAssessment(id as string, {
        title,
        roles,
        questions,
      });
      setLoading(false);

      if (result) {
        Toast.show({ type: 'success', text1: 'Assessment Updated!' });
        router.push('/test_pages/testList');
      } else {
        Toast.show({ type: 'error', text1: 'Update Failed' });
      }
    } catch (err) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please try again.' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={tw`absolute top-4 left-4 z-10`}>
        <Pressable onPress={() => router.push('/test_pages/test_management')}>
          <Icon name="arrow-left" size={22} color="white" />
        </Pressable>
      </View>

      <View style={styles.headerArc}>
        <Text style={styles.headerText}>MODIFY{"\n"}ASSESSMENT</Text>
      </View>

      <TextInput
        placeholder="Test Title"
        style={styles.input1}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#ccc"
      />

      <Text style={styles.label}>Applicable Roles:</Text>
      {roleOptions.map(role => (
        <TouchableOpacity
          key={role}
          style={styles.checkboxRow}
          onPress={() => toggleRole(role)}
        >
          <View style={[styles.checkbox, roles.includes(role) && styles.checkboxChecked]}>
            {roles.includes(role) && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{role}</Text>
        </TouchableOpacity>
      ))}

      {questions.map((q, qIdx) => (
        <View key={q.id} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionTitle}>Question {qIdx + 1}</Text>
            <TouchableOpacity onPress={() => removeQuestion(q.id)}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Question text"
            style={styles.input2}
            value={q.text}
            onChangeText={text => updateQuestionText(q.id, text)}
            placeholderTextColor="#ccc"
          />
          {q.options.map((opt, i) => (
            <TextInput
              key={opt.id}
              placeholder={`Option ${i + 1}`}
              style={styles.optionInput}
              value={opt.text}
              onChangeText={text => updateOptionText(q.id, opt.id, text)}
              placeholderTextColor="#ccc"
            />
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
        <Text style={styles.addBtnText}>Add Question</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    paddingBottom: 40,
  },
  headerArc: {
    backgroundColor: '#800080',
    paddingVertical: 32,
    marginBottom: 10,
    width: '100%',
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  input1: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    color: 'black',
  },
  input2: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    color: 'white',
  },
  label: {
    color: 'black',
    fontWeight: '600',
    marginTop: 10,
    marginHorizontal: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0f0',
  },
  checkboxTick: {
    color: '#000',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: 'black',
  },
  questionCard: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeBtn: {
    color: '#f66',
    fontWeight: 'bold',
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#666',
    padding: 8,
    marginVertical: 5,
    borderRadius: 6,
    color: '#fff',
  },
  addBtn: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#740968',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
