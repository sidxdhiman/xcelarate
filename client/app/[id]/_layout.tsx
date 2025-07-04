import { useEffect } from 'react';
import { Slot, useLocalSearchParams } from 'expo-router';
import { useAssessmentContext } from '../../store/useAssessmentContext';

export default function AssessmentLayout() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const setContext = useAssessmentContext((s) => s.setContext);

  useEffect(() => {
    if (id) setContext(id, data);
  }, [id, data]);

  return <Slot />;
}
