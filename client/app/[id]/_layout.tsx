import { Slot, useLocalSearchParams } from 'expo-router';

export default function AssessmentLayout() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  // Pass id & data to every child
  return <Slot context={{ id, data }} />;
}
