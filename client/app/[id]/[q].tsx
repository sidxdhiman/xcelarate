import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Assessment } from '../../types/assessment';
import { useAssessmentStore } from '@/store/useAssessmentStore';

interface Answer {
  option: string;
  text?: string;
}

export default function QuestionScreen() {
  const { id, q, data } = useLocalSearchParams<{
    id: string;
    q?: string;
    data?: string;
  }>();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state for finish confirmation
  const [modalVisible, setModalVisible] = useState(false);

  const {
    draftResponses,
    setDraft,
    submitAssessmentResponse,
    fetchAssessmentById,
  } = useAssessmentStore();

  const responses = draftResponses[id] ?? {};

  useEffect(() => {
    const init = async () => {
      if (data) {
        try {
          setAssessment(JSON.parse(decodeURIComponent(data)));
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Failed to parse assessment in URL param:', err);
        }
      }

      try {
        const storeAssessment = await fetchAssessmentById(id);
        if (storeAssessment) {
          setAssessment(storeAssessment);
        }
      } catch (err) {
        console.warn('Store lookup failed:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, data]);

  const index = useMemo(() => Number(q ?? '0'), [q]);
  const question = assessment?.questions?.[index];
  const questionKey = question?._id ?? String(index);

  const selectOption = (option: string) =>
    setDraft(id, questionKey, {
      option,
      text: responses[questionKey]?.text ?? '',
    });

  const changeText = (text: string) =>
    setDraft(id, questionKey, {
      option: responses[questionKey]?.option ?? '',
      text,
    });

  const go = (idx: number, replace = false) => {
    const encoded = assessment
      ? encodeURIComponent(JSON.stringify(assessment))
      : undefined;

    const navFn = replace ? router.replace : router.push;

    navFn({
      pathname: '/[id]/[q]',
      params: {
        id,
        q: String(idx),
        data: encoded,
      },
    });
  };

  // Wrap submit logic to confirm via modal
  const submit = async () => {
    if (!assessment || !id || !assessment.user || !assessment.startedAt) {
      alert('Missing required assessment data');
      return;
    }

    const fullPayload = {
      assessmentId: id,
      title: assessment.title,
      user: assessment.user,
      location: assessment.location,
      startedAt: assessment.startedAt,
      submittedAt: Date.now(),
      answers: responses,
    };

    try {
      await submitAssessmentResponse(id, fullPayload);
      setModalVisible(false);
      router.replace({
        pathname: '/[id]/result',
        params: { id },
      });
    } catch (err) {
      console.log('Submission failed:', err);
      alert('Failed to submit. Please try again.');
    }
  };

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
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.navBtnFinish}
          >
            <Text style={styles.navText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => go(index + 1)} style={styles.navBtn}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal for finish confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Submission</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to finish and submit your assessment?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6efff', padding: 20, paddingTop: 80 },
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

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#4b0082',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#008000',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
