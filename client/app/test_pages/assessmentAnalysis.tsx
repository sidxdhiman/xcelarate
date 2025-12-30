import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;

// --- Types ---
type OptionStat = { label: string; count: number; percentage: number };
type QuestionAnalysis = {
  questionId: string;
  questionText: string;
  type: string;
  options: OptionStat[];
};
type SurveyAnalysisData = {
  title: string;
  totalParticipants: number;
  aiSummary: string;
  questions: QuestionAnalysis[];
};

// Types for Individual View
type AnswerDetail = {
  questionId: string;
  questionText: string;
  selectedOption: string;
  answerText?: string;
};

type IndividualResponse = {
  responseId: string;
  user: { _id: string; name: string; email: string; designation?: string };
  submittedAt: string;
  answers: AnswerDetail[];
};

export default function AssessmentAnalysis() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const axiosInstance = useAuthStore((s) => s.axiosInstance);

  const [activeTab, setActiveTab] = useState<"insights" | "individual">(
    "insights",
  );

  // Data States
  const [analysisData, setAnalysisData] = useState<SurveyAnalysisData | null>(
    null,
  );
  const [individualData, setIndividualData] = useState<IndividualResponse[]>(
    [],
  );
  const [filteredIndividualData, setFilteredIndividualData] = useState<
    IndividualResponse[]
  >([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserResponse, setSelectedUserResponse] =
    useState<IndividualResponse | null>(null);

  const COLORS = [
    "#4cc9f0",
    "#7209b7",
    "#f72585",
    "#4361ee",
    "#40916c",
    "#fca311",
  ];

  // --- Fetch Data ---
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Fetch
        const [analysisRes, individualRes] = await Promise.all([
          axiosInstance.get(`/assessments/${id}/analysis`),
          axiosInstance.get(`/assessments/${id}/responses`),
        ]);

        setAnalysisData(analysisRes.data);
        setIndividualData(individualRes.data);
        setFilteredIndividualData(individualRes.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, axiosInstance]);

  // --- Filter Logic ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIndividualData(individualData);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = individualData.filter(
        (item) =>
          item.user?.name?.toLowerCase().includes(lower) ||
          item.user?.email?.toLowerCase().includes(lower),
      );
      setFilteredIndividualData(filtered);
    }
  }, [searchQuery, individualData]);

  const handleBack = () => router.back();

  // --- Render Individual Item ---
  const renderIndividualItem = ({ item }: { item: IndividualResponse }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => setSelectedUserResponse(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0) || "?"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user?.name || "Unknown"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.user?.email}
          </Text>
        </View>
        <View style={styles.viewBadge}>
          <Text style={styles.viewBadgeText}>View</Text>
          <Feather name="chevron-right" size={14} color="#6c2eb9" />
        </View>
      </View>
      <View style={styles.userCardFooter}>
        <Feather
          name="clock"
          size={12}
          color="#999"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.timestamp}>
          Submitted: {new Date(item.submittedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#800080" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContentWrapper}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Analytics</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Modern Pill Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "insights" && styles.activeTab]}
            onPress={() => setActiveTab("insights")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "insights" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "individual" && styles.activeTab]}
            onPress={() => setActiveTab("individual")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "individual" && styles.activeTabText,
              ]}
            >
              Individual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.responsiveContainer}>
        {activeTab === "insights" ? (
          // --- INSIGHTS VIEW ---
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
          >
            <Text style={styles.surveyTitle}>{analysisData?.title}</Text>

            {/* AI Summary */}
            <LinearGradient
              colors={["#f3e8ff", "#e0cffc"]}
              style={styles.aiCard}
            >
              <View style={styles.aiHeader}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={22}
                  color="#6c2eb9"
                />
                <Text style={styles.aiTitle}>AI Executive Summary</Text>
              </View>
              <Text style={styles.aiText}>
                {analysisData?.aiSummary || "Generating insights..."}
              </Text>
            </LinearGradient>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {analysisData?.totalParticipants}
                </Text>
                <Text style={styles.metricLabel}>Total Responses</Text>
              </View>
            </View>

            {/* Question Breakdown */}
            <Text style={styles.sectionHeader}>Question Breakdown</Text>
            {analysisData?.questions.map((q, idx) => (
              <View key={idx} style={styles.questionCard}>
                <Text style={styles.questionText}>
                  <Text style={{ fontWeight: "bold", color: "#6c2eb9" }}>
                    Q{idx + 1}.
                  </Text>{" "}
                  {q.questionText}
                </Text>

                <View style={styles.divider} />

                {q.options.map((opt, oIdx) => (
                  <View key={oIdx} style={styles.optionRow}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionCount}>
                        {opt.count} ({opt.percentage}%)
                      </Text>
                    </View>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${opt.percentage}%`,
                            backgroundColor: COLORS[oIdx % COLORS.length],
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          // --- INDIVIDUAL VIEW ---
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <View style={styles.searchBox}>
              <Feather name="search" size={20} color="#999" />
              <TextInput
                placeholder="Search by name or email..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredIndividualData}
              renderItem={renderIndividualItem}
              keyExtractor={(item) => item.responseId}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="users" size={40} color="#ccc" />
                  <Text style={styles.emptyText}>No participants found</Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      {/* --- DETAILED USER MODAL --- */}
      <Modal
        visible={!!selectedUserResponse}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedUserResponse(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Response Details</Text>
            <TouchableOpacity
              onPress={() => setSelectedUserResponse(null)}
              style={styles.modalCloseBtn}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            {/* User Profile Header */}
            <View style={styles.modalProfile}>
              <View style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>
                  {selectedUserResponse?.user?.name?.charAt(0) || "?"}
                </Text>
              </View>
              <Text style={styles.modalUserName}>
                {selectedUserResponse?.user?.name || "Unknown"}
              </Text>
              <Text style={styles.modalUserEmail}>
                {selectedUserResponse?.user?.email}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.answersHeader}>Recorded Answers</Text>

            {/* CRASH-PROOF RENDERING LOGIC */}
            {(() => {
              // 1. Get the answers
              const rawAnswers = selectedUserResponse?.answers;

              // 2. Strict check: Is it actually an array?
              // If it's an array, use it. If it's an Object/Map/Null, force it to empty array.
              const safeAnswers = Array.isArray(rawAnswers) ? rawAnswers : [];

              if (safeAnswers.length === 0) {
                return (
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <Feather name="slash" size={24} color="#ccc" />
                    <Text style={{ color: "#999", marginTop: 8 }}>
                      No answers recorded (or invalid data format).
                    </Text>
                  </View>
                );
              }

              // 3. Render the list safely
              return safeAnswers.map((ans, idx) => (
                <View key={idx} style={styles.answerCard}>
                  <View style={styles.qHeader}>
                    <Text style={styles.qBadge}>Q{idx + 1}</Text>
                    <Text style={styles.answerQuestion}>
                      {ans.questionText || "Question Text Missing"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.answerBox,
                      ans.selectedOption === "Skipped" && styles.skippedBox,
                    ]}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        ans.selectedOption === "Skipped" && styles.skippedText,
                      ]}
                    >
                      {ans.selectedOption || "N/A"}
                    </Text>
                  </View>
                </View>
              ));
            })()}

            {/* Add extra padding at bottom so user can scroll fully */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    backgroundColor: "#800080",
    paddingBottom: 15,
    paddingTop: Platform.OS === "android" ? 35 : 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContentWrapper: { alignItems: "center" },
  headerContent: {
    width: "100%",
    maxWidth: 800,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  backButton: { padding: 8 },

  // Tabs
  tabWrapper: { alignItems: "center", marginTop: 16, marginBottom: 10 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    borderRadius: 25,
    padding: 4,
    width: "90%",
    maxWidth: 400,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: { color: "#777", fontWeight: "600", fontSize: 14 },
  activeTabText: { color: "#4b0082", fontWeight: "700" },

  responsiveContainer: {
    flex: 1,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },

  surveyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#32174d",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 10,
  },

  // AI Card
  aiCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d8b4fe",
  },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: "700", color: "#4b0082", marginLeft: 8 },
  aiText: { fontSize: 14, color: "#333", lineHeight: 22 },

  // Metrics
  metricsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 150,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  metricValue: { fontSize: 24, fontWeight: "800", color: "#32174d" },
  metricLabel: {
    fontSize: 12,
    color: "#777",
    textTransform: "uppercase",
    marginTop: 4,
  },

  // Question Card
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginBottom: 12,
    marginLeft: 4,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  questionText: { fontSize: 16, color: "#333", lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 16 },

  // Options
  optionRow: { marginBottom: 12 },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  optionCount: { fontSize: 13, color: "#888", fontWeight: "600" },
  barBackground: {
    height: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },

  // Individual View
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#333" },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#aaa", marginTop: 10 },

  // User Card
  userCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#6c2eb9",
  },
  userCardContent: { flexDirection: "row", alignItems: "center" },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f3e5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#6c2eb9", fontWeight: "bold", fontSize: 18 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  userEmail: { fontSize: 13, color: "#777" },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewBadgeText: {
    fontSize: 11,
    color: "#6c2eb9",
    fontWeight: "600",
    marginRight: 2,
  },
  userCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f9f9f9",
  },
  timestamp: { fontSize: 12, color: "#999" },

  // Modal Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  modalCloseBtn: { padding: 4 },

  modalProfile: { alignItems: "center", marginVertical: 20 },
  bigAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#6c2eb9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#6c2eb9",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bigAvatarText: { fontSize: 28, color: "#fff", fontWeight: "bold" },
  modalUserName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  modalUserEmail: { fontSize: 14, color: "#777", marginTop: 2 },

  answersHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    marginBottom: 16,
  },

  answerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  qHeader: { flexDirection: "row", marginBottom: 10 },
  qBadge: {
    backgroundColor: "#f3e5f5",
    color: "#6c2eb9",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 10,
    height: 20,
  },
  answerQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },

  answerBox: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#40916c",
  },
  skippedBox: {
    borderLeftColor: "#ff9800",
    backgroundColor: "#fff8e1",
  },
  answerText: { fontSize: 15, color: "#333", fontWeight: "500" },
  skippedText: { color: "#e65100", fontStyle: "italic" },
});
