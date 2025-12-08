import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Assessment } from "../../types/assessment";
import { useAssessmentStore } from "@/store/useAssessmentStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Fixed card height for smooth flip without layout jumps
const CARD_HEIGHT = 420;

export default function QuestionScreen() {
  const { id, q, data } = useLocalSearchParams<{
    id: string;
    q?: string;
    data?: string;
  }>();

  // ----------------------- CORE STATE & HOOKS (must be before conditional returns) -----------------------
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

  // timer state
  const [elapsed, setElapsed] = useState(0);

  // FLIP ANIMATION
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipToBack = () => {
    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIsFlipped(true));
  };

  const flipToFront = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIsFlipped(false));
  };

  const toggleFlip = () => (isFlipped ? flipToFront() : flipToBack());

  // ----------------------- Effects (data loading & timers) -----------------------
  useEffect(() => {
    const init = async () => {
      if (data) {
        try {
          setAssessment(JSON.parse(decodeURIComponent(data)));
          setLoading(false);
          return;
        } catch (err) {
          console.warn("Failed to parse assessment from params:", err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data]);

  useEffect(() => {
    if (!assessment || !assessment.startedAt) {
      setElapsed(0);
      return;
    }

    const update = () => {
      const now = Date.now();
      const diff = Math.floor((now - assessment.startedAt!) / 1000);
      setElapsed(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [assessment]);

  // ----------------------- Derived values -----------------------
  const index = useMemo(() => Number(q ?? "0"), [q]);
  const question = assessment?.questions?.[index];
  const questionKey = question?._id ?? String(index);
  const isLastQuestion =
    !!assessment && index === (assessment.questions?.length || 1) - 1;
  const progress = assessment
    ? ((index + 1) / assessment.questions.length) * 100
    : 0;

  // ----------------------- Helpers -----------------------
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const go = (idx: number) => {
    const encoded = assessment
      ? encodeURIComponent(JSON.stringify(assessment))
      : undefined;
    router.push({
      pathname: "/[id]/[q]",
      params: { id, q: String(idx), data: encoded },
    });
  };

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

  // ----------------------- Conditional UIs (after hooks) -----------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!assessment) {
    return (
      <View style={styles.center}>
        <Text>Assessment not found.</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.center}>
        <Text>Question not found.</Text>
      </View>
    );
  }

  // compute response counts for stats
  const attemptedCount = Object.keys(responses).length;
  const totalQuestions = assessment.questions.length;
  const notAttemptedCount = Math.max(0, totalQuestions - attemptedCount);

  // ----------------------- Render -----------------------
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.topTitle}>{assessment.title}</Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerText}>Time: {formatTime(elapsed)}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* CARD WRAPPER (fixed height => stable flip) */}
          <View style={styles.cardWrapper}>
            {/* toggle button top-left inside card */}
            <TouchableOpacity
              style={styles.cardToggle}
              onPress={toggleFlip}
              accessibilityLabel={
                isFlipped ? "Close question list" : "Open question list"
              }
            >
              <Text style={styles.cardToggleText}>{isFlipped ? "<" : ">"}</Text>
            </TouchableOpacity>

            <View style={[styles.flipContainer, { height: CARD_HEIGHT }]}>
              {/* FRONT */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    height: CARD_HEIGHT,
                    transform: [
                      { perspective: 1000 },
                      { rotateY: frontInterpolate },
                    ],
                  },
                ]}
              >
                {/* front content is scrollable area above footer */}
                <View style={styles.cardInnerContent}>
                  <ScrollView contentContainerStyle={styles.frontScrollContent}>
                    <Text style={styles.question}>{question.text}</Text>

                    {question.options.map((opt, optIdx) => {
                      const optionKey = opt._id ?? String(optIdx);
                      const selected =
                        responses[questionKey]?.option === opt.text;

                      return (
                        <View key={optionKey} style={styles.optionWrap}>
                          <TouchableOpacity
                            onPress={() => selectOption(opt.text)}
                            style={[
                              styles.optionBtn,
                              selected && styles.optionSelected,
                            ]}
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
                  </ScrollView>
                </View>

                {/* CARD FOOTER: buttons attached to bottom edge INSIDE CARD */}
                <View style={styles.cardFooter}>
                  <View style={[styles.navRow, styles.footerNavRow]}>
                    <TouchableOpacity
                      disabled={index === 0}
                      onPress={() => go(index - 1)}
                      style={[styles.navBtn, index === 0 && styles.disabledBtn]}
                    >
                      <Text style={styles.navBtnText}>Previous</Text>
                    </TouchableOpacity>

                    {!isLastQuestion ? (
                      <TouchableOpacity
                        onPress={() => go(index + 1)}
                        style={styles.navBtn}
                      >
                        <Text style={styles.navBtnText}>Next</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: "48%" }} />
                    )}
                  </View>
                </View>
              </Animated.View>

              {/* BACK (question list with circular grid and sticky stats footer) */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: CARD_HEIGHT,
                    transform: [
                      { perspective: 1000 },
                      { rotateY: backInterpolate },
                    ],
                  },
                ]}
                pointerEvents={isFlipped ? "auto" : "none"}
              >
                {/* header and close */}
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Questions</Text>
                  <TouchableOpacity
                    onPress={toggleFlip}
                    style={styles.closeListBtn}
                  >
                    <Text style={styles.closeListText}>{"<"}</Text>
                  </TouchableOpacity>
                </View>

                {/* scrollable circle grid */}
                <View style={styles.backScrollableArea}>
                  <ScrollView contentContainerStyle={styles.circleGrid}>
                    {assessment.questions.map((qItem, idx) => {
                      const qKey = qItem._id ?? String(idx);
                      const answered =
                        !!responses[qKey]?.option || !!responses[qKey]?.text;
                      const isCurrent = idx === index;

                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.circleItem,
                            isCurrent && styles.circleCurrent,
                            answered && !isCurrent && styles.circleAnswered,
                          ]}
                          onPress={() => {
                            go(idx);
                            setTimeout(() => flipToFront(), 140);
                          }}
                        >
                          <Text
                            style={[
                              styles.circleText,
                              (isCurrent || answered) &&
                                styles.circleTextFilled,
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* sticky stats footer inside back */}
                <View style={styles.statsBox}>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsTitle}>Total</Text>
                    <Text style={styles.statsValue}>{totalQuestions}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsTitle}>Attempted</Text>
                    <Text style={styles.statsValue}>{attemptedCount}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsTitle}>Not Attempted</Text>
                    <Text style={styles.statsValue}>{notAttemptedCount}</Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* Save & Exit button (below card) */}
          {!isLastQuestion && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => setExitModal(true)}
            >
              <Text style={styles.saveBtnText}>Save Test & Exit</Text>
            </TouchableOpacity>
          )}

          {/* Bottom finish/submit button */}
          <TouchableOpacity
            style={[styles.finishBtn, isLastQuestion && styles.submitFinalBtn]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.finishBtnText}>
              {isLastQuestion ? "Submit Test" : "Finish Test"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Powered / branding */}
        <View style={styles.bottomRight}>
          <Text style={styles.powered}>Powered By</Text>
          <Image
            source={require("../../assets/images/Xebia.png")}
            style={styles.logo}
          />
        </View>

        {/* Save modal */}
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

        {/* Submit confirmation modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Finish Test?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to submit your test?
              </Text>

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
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
    </View>
  );
}

/* ------------------------ STYLES ------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6efff",
  },

  mainContent: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 16,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 80,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#4b0082",
    marginBottom: 10,
  },

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

  /* wrapper around card to allow space for toggle */
  cardWrapper: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginTop: 20,
  },

  /* the little toggle at top-left inside the card */
  cardToggle: {
    position: "absolute",
    top: -6,
    left: 12,
    zIndex: 10,
    backgroundColor: "#800080",
    width: 34,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardToggleText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  flipContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 0, // padding managed by inner regions to keep footer fixed
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    backfaceVisibility: "hidden",
    overflow: "hidden",
  },

  /* front inner content (scrollable) */
  cardInnerContent: {
    flex: 1,
    padding: 18,
    paddingBottom: 0,
    maxHeight: CARD_HEIGHT - 80, // reserve space for footer (approx)
  },
  frontScrollContent: {
    paddingBottom: 8,
  },

  cardFooter: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
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

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
  footerNavRow: {
    alignItems: "center",
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
  navBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  saveBtn: {
    marginTop: 18,
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

  submitFinalBtn: {
    backgroundColor: "#008000",
  },

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

  /* BACK SIDE styles */
  cardBack: {
    backgroundColor: "#2c0b3a",
    paddingTop: 10,
    paddingBottom: 0,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  listTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  closeListBtn: {
    backgroundColor: "#800080",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeListText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  backScrollableArea: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 6,
    // the scrollview will fit inside the card above the sticky stats
    maxHeight: CARD_HEIGHT - 120, // leave space for header + stats footer
  },

  /* circle grid: 4 fixed columns */
  circleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  circleItem: {
    width: "22%", // roughly 4 columns with spacing
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },

  circleCurrent: {
    backgroundColor: "#800080", // purple
    borderColor: "#800080",
  },

  circleAnswered: {
    backgroundColor: "#0f8c00", // green
    borderColor: "#0f8c00",
  },

  circleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  circleTextFilled: {
    color: "#fff",
  },

  /* sticky stats footer for back side */
  statsBox: {
    borderTopWidth: 1,
    borderTopColor: "#ffffff22",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  statsTitle: {
    color: "#f0e6ff",
    fontSize: 14,
    fontWeight: "700",
  },
  statsValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

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
