import { useEffect } from "react";
import { Slot, useLocalSearchParams } from "expo-router";
import { useAssessmentContext } from "../../store/useAssessmentContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const { setAssessmentId } = useAssessmentContext();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.assessmentId) {
      setAssessmentId(params.assessmentId);
    }
  }, [params]);

  return (
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
  );
}
