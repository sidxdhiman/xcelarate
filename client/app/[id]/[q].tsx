import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { Assessment } from "../../types/assessment";
import { useAssessmentStore } from "@/store/useAssessmentStore";

export default function QuestionScreen() {
  const { id, q, data } = useLocalSearchParams<{
    id: string;
    q?: string;
    data?: string;
  }>();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [exitModal, setExitModal] = useState(false);

  const {
    draftResponses,
    setDraft,
    submitAssessmentResponse,
    fetchAssessmentById,
  } = useAssessmentStore();

  const responses = draftResponses[id] ?? {};

  /* ---------------- TIMER ---------------- */
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!assessment || !assessment.startedAt) return;

    const update = () => {
      const now = Date.now();
      const diff = Math.floor((now - assessment.startedAt!) / 1000);
      setElapsed(diff);
    };

    update(); // run immediately
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [assessment]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  /* --------------------------------------- */

  useEffect(() => {
    const init = async () => {
      if (data) {
        try {
          setAssessment(JSON.parse(decodeURIComponent(data)));
          setLoading(false);
          return;
        } catch (err) {
          console.warn("Failed to parse assessment:", err);
        }
      }

      try {
        const storeAssessment = await fetchAssessmentById(id);
        if (storeAssessment) setAssessment(storeAssessment);
      } catch (err) {
        console.warn("Store lookup failed:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, data]);

  const index = useMemo(() => Number(q ?? "0"), [q]);
  const question = assessment?.questions?.[index];
  const questionKey = question?._id ?? String(index);

  const selectOption = (option: string) =>
    setDraft(id, questionKey, {
      option,
      text: responses[questionKey]?.text ?? "",
    });

  const changeText = (text: string) =>
    setDraft(id, questionKey, {
      option: responses[questionKey]?.option ?? "",
      text,
    });

  const go = (idx: number) => {
    const encoded = assessment
      ? encodeURIComponent(JSON.stringify(assessment))
      : undefined;

    router.push({
      pathname: "/[id]/[q]",
      params: { id, q: String(idx), data: encoded },
    });
  };

  const submit = async () => {
    if (!assessment || !id || !assessment.user || !assessment.startedAt) {
      alert("Missing assessment data");
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
      router.replace({ pathname: "/[id]/result", params: { id } });
    } catch (err) {
      console.log("Submission failed:", err);
      alert("Failed to submit.");
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

  /* Progress Bar % */
  const progress = ((index + 1) / assessment.questions.length) * 100;

  return (
    <View style={styles.wrapper}>
      {/* TITLE */}
      <Text style={styles.topTitle}>{assessment.title}</Text>

      {/* TIMER */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>Time: {formatTime(elapsed)}</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CARD */}
        <View style={styles.card}>
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
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSel,
                    ]}
                  >
                    {opt.text}
                  </Text>
                </TouchableOpacity>

                {selected && (
                  <TextInput
                    style={styles.textArea}
                    placeholder={`Tell us more about "${opt.text}"…`}
                    value={responses[questionKey]?.text || ""}
                    onChangeText={changeText}
                    multiline
                  />
                )}
              </View>
            );
          })}

          {/* NAVIGATION BUTTONS */}
          <View style={styles.navRow}>
            {/* PREVIOUS */}
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => go(index - 1)}
              style={[styles.navBtn, index === 0 && styles.disabledBtn]}
            >
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>

            {/* NEXT / FINISH */}
            {index === assessment.questions.length - 1 ? (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={[styles.navBtn, styles.finishInsideBtn]}
              >
                <Text style={styles.navBtnText}>Finish</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => go(index + 1)}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SAVE TEST */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setExitModal(true)}
        >
          <Text style={styles.saveBtnText}>Save Test & Exit</Text>
        </TouchableOpacity>

        {/* FINISH TEST */}
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.finishBtnText}>Finish Test</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POWERED BY XEBIA */}
      <View style={styles.bottomRight}>
        <Text style={styles.powered}>Powered By</Text>
        <Image
          source={require("../../assets/images/Xebia.png")}
          style={styles.logo}
        />
      </View>

      {/* SAVE & EXIT MODAL */}
      <Modal visible={exitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Save & Exit?</Text>
            <Text style={styles.modalMessage}>
              Your test progress will be saved. You can resume later using the
              same link.
            </Text>

            <TouchableOpacity
              style={styles.confirmExit}
              onPress={() => {
                setExitModal(false);
                alert("Saved! (functional logic will be added)");
              }}
            >
              <Text style={styles.confirmExitText}>Okay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelExit}
              onPress={() => setExitModal(false)}
            >
              <Text style={styles.cancelExitText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FINISH TEST MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finish Test?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to submit your test?
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.cancelExit}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelExitText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmExit} onPress={submit}>
                <Text style={styles.confirmExitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------ STYLES ------------------------ */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f6efff",
    paddingTop: 70,
    paddingHorizontal: 16,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 80,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Title */
  topTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#4b0082",
    marginBottom: 10,
  },

  /* Timer */
  timerBox: {
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: "#800080",
  },
  timerText: {
    color: "#4b0082",
    fontWeight: "700",
  },

  /* Progress Bar */
  progressContainer: {
    width: "100%",
    maxWidth: 500,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#800080",
  },

  /* Card */
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1b0033",
  },

  optionWrap: {
    marginBottom: 16,
  },

  optionBtn: {
    borderWidth: 1,
    borderColor: "#800080",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  optionSelected: { backgroundColor: "#800080" },

  optionText: {
    color: "#800080",
    fontWeight: "600",
  },

  optionTextSel: { color: "#fff" },

  textArea: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 70,
  },

  /* Navigation */
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  navBtn: {
    flex: 0.48,
    backgroundColor: "#800080",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.4,
  },
  finishInsideBtn: {
    backgroundColor: "#008000",
  },
  navBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  /* Save & Exit */
  saveBtn: {
    marginTop: 25,
    backgroundColor: "#800080",
    paddingVertical: 14,
    borderRadius: 10,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* Finish */
  finishBtn: {
    marginTop: 12,
    backgroundColor: "#cc0000",
    paddingVertical: 14,
    borderRadius: 10,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  finishBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* Xebia Branding */
  bottomRight: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  powered: {
    color: "white",
    fontSize: 13,
    marginRight: 6,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#4b0082",
  },

  modalMessage: {
    fontSize: 15,
    marginBottom: 18,
    color: "#333",
  },

  confirmExit: {
    backgroundColor: "#800080",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmExitText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelExit: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelExitText: {
    color: "#333",
    fontWeight: "700",
  },
});
