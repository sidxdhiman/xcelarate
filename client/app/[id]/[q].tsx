import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Text, View, TouchableOpacity, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { Assessment } from '../../types/assessment';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function QuestionScreen() {
  const { id, q, data } = useLocalSearchParams<{
    id: string; q: string; data: string;
  }>();

  const assessment: Assessment = JSON.parse(data ?? '{}');
  const index = Number(q ?? 0);
  const question = assessment.questions[index];
  const questionKey = question._id || String(index);

  const [responses, setResponses] = useState<Record<
    string, { option: string; text?: string }
  >>({});

  const selectOption = (option: string) =>
    setResponses(prev => ({
      ...prev,
      [questionKey]: { option, text: '' },
    }));

  const changeText = (text: string) =>
    setResponses(prev => ({
      ...prev,
      [questionKey]: { ...prev[questionKey], text },
    }));

  const go = (idx: number, replace = false) => {
    const encoded = encodeURIComponent(data ?? '{}');
    const path = {
      pathname: '/assessment/[id]/[q]',
      params: { id, q: String(idx), data: encoded },
    };
    replace ? router.replace(path) : router.push(path);
  };

  const submit = async () => {
    await useAssessmentStore.getState().submitResponses(id, responses);
    router.replace({
      pathname: '/[id]/result',
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{assessment.title}</Text>
      <Text style={styles.progress}>
        Question {index + 1} / {assessment.questions.length}
      </Text>

      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.question}>{question.text}</Text>

        {question.options.map((opt, optIdx) => {
          const optionKey = opt._id || String(optIdx);
          const selected = responses[questionKey]?.option === opt.text;
          return (
            <View key={optionKey} style={styles.optionWrap}>
              <TouchableOpacity
                onPress={() => selectOption(opt.text)}
                style={[styles.optionBtn, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSel]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>

              {selected && (
                <TextInput
                  style={styles.textArea}
                  placeholder={`Tell us more about "${opt.text}"...`}
                  value={responses[questionKey]?.text || ''}
                  onChangeText={changeText}
                  multiline
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => go(index - 1)}
          style={[styles.navBtn, index === 0 && styles.disabled]}
        >
          <Text style={styles.navText}>Prev</Text>
        </TouchableOpacity>

        {index === assessment.questions.length - 1 ? (
          <TouchableOpacity onPress={submit} style={styles.navBtnFinish}>
            <Text style={styles.navText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => go(index + 1)} style={styles.navBtn}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6efff', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#4b0082' },
  progress: { marginTop: 4, color: '#555' },
  card: { marginTop: 20 },
  question: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  optionWrap: { marginBottom: 14 },
  optionBtn: {
    borderWidth: 1, borderColor: '#800080', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  optionSelected: { backgroundColor: '#800080' },
  optionText: { color: '#800080', fontWeight: '600' },
  optionTextSel: { color: '#fff' },
  textArea: {
    backgroundColor: '#f1f1f1', padding: 10, borderRadius: 8,
    marginTop: 8, minHeight: 70,
  },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navBtn: {
    flex: 0.45, backgroundColor: '#800080', padding: 12,
    borderRadius: 8, alignItems: 'center',
  },
  navBtnFinish: {
    flex: 0.45, backgroundColor: '#008000', padding: 12,
    borderRadius: 8, alignItems: 'center',
  },
  navText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.4 },
});
