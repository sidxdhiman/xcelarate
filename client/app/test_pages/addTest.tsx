import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useAssessmentStore } from '../../store/useAssessmentStore';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function CreateTestForm() {
  const [title, setTitle] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const { addAssessment, isAddingAssessment } = useAssessmentStore();

  const roleOptions = ['Product Manager', 'Developer', 'Applicable to All'];

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

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, text } : q))
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

    console.log('[UI] Submitting assessment...');
    try {
      await addAssessment({ title, roles, questions });
      Alert.alert('Success', 'Test submitted successfully!');
      setTitle('');
      setRoles([]);
      setQuestions([]);
    } catch (err) {
      console.error('[UI] Submit error:', err);
      Alert.alert('Error', 'Failed to submit test.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerArc}>
        <Text style={styles.headerText}>CREATE NEW TEST</Text>
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
        onPress={() => {
          console.log('[UI] Done button pressed');
          handleSubmit();
        }}
        disabled={isAddingAssessment}
      >
        <Text style={styles.submitBtnText}>
          {isAddingAssessment ? 'Submitting...' : 'Done'}
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
