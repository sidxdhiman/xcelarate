import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '../../store/useAssessmentStore';

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
  _id?: string;
}

interface Question {
  id: string;
  text: string;
  questionText?: string;
  options: Option[];
  _id?: string;
}

interface Assessment {
  title: string;
  roles: string[];
  questions: Question[];
  _id?: string;
}

const AssessmentView = () => {
  const { id } = useLocalSearchParams();
  const getAssessmentById = useAssessmentStore(state => state.getAssessmentById);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;

    const fetchAssessment = async () => {
      try {
        const data = await getAssessmentById(id);
        setAssessment(data);
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#800080" />;
  if (!assessment) return <Text style={{ padding: 16 }}>Assessment not found.</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#800080' }}>
        {assessment.title}
      </Text>

      {assessment.questions.map((q, idx) => (
        <View key={q._id || q.id} style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Q{idx + 1}: {q.text || q.questionText}
          </Text>

          {q.options.map((opt, i) => (
            <Text key={opt._id || opt.id} style={{ marginLeft: 16, marginBottom: 4 }}>
              • {opt.text}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default AssessmentView;
