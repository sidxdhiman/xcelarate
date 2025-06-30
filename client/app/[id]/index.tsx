import { Redirect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { Assessment } from '@/types/assessment';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function AssessmentLoader() {
  const { id } = useLocalSearchParams();
  const getAssessmentById = useAssessmentStore(s => s.getAssessmentById);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (typeof id === 'string') {
          const data = await getAssessmentById(id);
          setAssessment(data);
        }
      } catch {
        setErr(true);
      }
    })();
  }, [id]);

  if (!assessment && !err) return <ActivityIndicator size="large" color="#800080" />;
  if (err || !assessment) return <Text style={{ padding: 16 }}>Assessment not found.</Text>;

  // put the JSON in router params so each question screen doesn’t refetch
  return (
    <Redirect
      href={{
        pathname: '/[id]/[q]',
        params: { id, q: 0, data: JSON.stringify(assessment) },
      }}
    />
  );
}
