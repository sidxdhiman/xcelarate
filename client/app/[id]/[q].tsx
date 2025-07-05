import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Assessment } from '../../types/assessment';
import { useAssessmentStore } from '@/store/useAssessmentStore';

/* ──────────────────────────────── Types ──────────────────────────────── */
interface Answer {
  option: string;
  text?: string;
}

/* ──────────────────────────────── Component ──────────────────────────── */
export default function QuestionScreen() {
  /* ─────────────────────────────── 1. URL params ─────────────────────── */
  const { id, q, data } = useLocalSearchParams<{
    id: string;
    q?: string;
    data?: string;
  }>();

  /* ─────────────────────────────── 2. Local state ────────────────────── */
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, Answer>>({});

  /* ─────────────────────────────── 3. Resolve assessment ─────────────── */
  useEffect(() => {
    const init = async () => {
      // 1️⃣ Fast path – decode JSON from URL (internal navigation)
      console.log('[QuestionScreen] params :', {id, q, hasData: !!data});
      if (data) {
        try {
          setAssessment(JSON.parse(decodeURIComponent(data)));
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Failed to parse assessment in URL param:', err);
        }
      }

      // 2️⃣ Ask the store (it returns a Promise)
      try {
        const storeAssessment = await useAssessmentStore
          .getState()
          .getAssessmentById(id);

        if (storeAssessment) {
          setAssessment(storeAssessment);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Store lookup failed:', err);
      }

      // 3️⃣ Fallback fetch – if the store didn’t have it
      try {
        const res = await fetch(`http://localhost:8081/api/assessments/${id}`);
        const json = (await res.json()) as Assessment;
        setAssessment(json);
      } catch (err) {
        console.error('Failed to fetch assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, data]);

  /* ─────────────────────────────── 4. Derived data ───────────────────── */
  const index = useMemo(() => Number(q ?? '0'), [q]);
  const question = assessment?.questions?.[index];
  const questionKey = question?._id ?? String(index);

  /* ─────────────────────────────── 5. Helpers ─────────────────────────── */
  const selectOption = (option: string) =>
    setResponses(prev => ({
      ...prev,
      [questionKey]: { ...(prev[questionKey] ?? {}), option, text: '' },
    }));

  const changeText = (text: string) =>
    setResponses(prev => ({
      ...prev,
      [questionKey]: { ...(prev[questionKey] ?? { option: '' }), text },
    }));

  const go = (idx: number, replace = false) => {
    const encoded = assessment
      ? encodeURIComponent(JSON.stringify(assessment))
      : undefined;

    const url =
      `/assessment/${id}/${idx}` + (encoded ? `?data=${encoded}` : '');

    replace ? router.replace(url) : router.push(url);
  };

  const submit = async () => {
    // convert object → array if backend expects it, else send as‑is
    await useAssessmentStore.getState().submitResponses(id, responses);
    router.replace(`/assessment/${id}/result`);
  };

  /* ─────────────────────────────── 6. Guards ─────────────────────────── */
  if (loading)
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  if (!assessment)
    return (
      <View style={styles.center}>
        <Text>Assessment not found.</Text>
      </View>
    );
  if (!question)
    return (
      <View style={styles.center}>
        <Text>Question not found.</Text>
      </View>
    );

  /* ─────────────────────────────── 7. UI ─────────────────────────────── */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{assessment.title}</Text>
      <Text style={styles.progress}>
        Question {index + 1} / {assessment.questions.length}
      </Text>

      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.question}>{question.text}</Text>

        {question.options.map((opt, optIdx) => {
          const optionKey = opt._id ?? String(optIdx);
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
                  placeholder={`Tell us more about "${opt.text}"…`}
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

/* ──────────────────────────────── Styles ─────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6efff', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: { fontSize: 22, fontWeight: '700', color: '#4b0082' },
  progress: { marginTop: 4, color: '#555' },

  card: { marginTop: 20 },
  question: { fontSize: 18, fontWeight: '600', marginBottom: 12 },

  optionWrap: { marginBottom: 14 },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#800080',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionSelected: { backgroundColor: '#800080' },
  optionText: { color: '#800080', fontWeight: '600' },
  optionTextSel: { color: '#fff' },

  textArea: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 70,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navBtn: {
    flex: 0.45,
    backgroundColor: '#800080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navBtnFinish: {
    flex: 0.45,
    backgroundColor: '#008000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.4 },
});
