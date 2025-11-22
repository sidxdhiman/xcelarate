import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "twrnc";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Toast from "react-native-toast-message";

// --- Types ---
type User = {
  _id: string;
  name: string;
  email: string;
  designation: string;
  submittedAt?: string;
};

type AssessmentDetails = {
  _id: string;
  title: string;
  assignedCount: number;
  completedCount: number;
  completedUsers: User[];
  pendingUsers: User[];
};

type FilterType = "completed" | "pending";

export default function AssessmentProgress() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const axiosInstance = useAuthStore((s) => s.axiosInstance);

  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("completed");
  const [sendingReminder, setSendingReminder] = useState(false);

  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 60;
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  // --- 1. Fetch Assessment Details ---
  useEffect(() => {
    if (!id) {
      setError("Assessment ID is missing.");
      setLoading(false);
      return;
    }

    const fetchAssessmentDetails = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/assessments/${id}/progress`);
        const progressData: AssessmentDetails = res.data;

        if (progressData && progressData.title) {
          setAssessment(progressData);
          setError(null);
        } else {
          throw new Error("Invalid response structure from server.");
        }
      } catch (err: any) {
        console.error("Error fetching assessment details:", err);
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.message || err?.message;
        setError(
          `Failed to load progress. Status ${status || "N/A"}: ${serverMessage}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [id, axiosInstance]);

  // --- 2. Progress Percentage ---
  const progressPercent = useMemo(() => {
    if (!assessment || assessment.assignedCount === 0) return 0;
    return (assessment.completedCount / assessment.assignedCount) * 100;
  }, [assessment]);

  // --- 3. Filtered List ---
  const filteredUsers = useMemo(() => {
    if (!assessment) return [];
    return filter === "completed"
      ? assessment.completedUsers
      : assessment.pendingUsers;
  }, [assessment, filter]);

  // --- 4. Send Reminder ---
  const sendReminder = async () => {
    if (!assessment || sendingReminder || filteredUsers.length === 0) return;

    setSendingReminder(true);
    const pendingUserIds = filteredUsers.map((u) => u._id);

    try {
      const res = await axiosInstance.post(
        `/assessments/${assessment._id}/reminders`,
        { userIds: pendingUserIds },
      );

      const sentCount = res.data.details?.userCount || filteredUsers.length;

      Toast.show({
        type: "success",
        text1: `Reminder sent to ${sentCount} user(s)!`,
        text2: res.data.message || "Queued successfully.",
      });
    } catch (err: any) {
      console.error("Error sending reminder:", err);
      const serverMessage = err?.response?.data?.message || err?.message;
      Toast.show({
        type: "error",
        text1: "Failed to send reminders.",
        text2: serverMessage,
      });
    } finally {
      setSendingReminder(false);
    }
  };

  // --- Back Navigation ---
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/test_pages/TestManagement");
  };

  // --- Render User Card ---
  // --- Render User Card ---
  const renderUserItem = ({ item }: { item: User }) => {
    // Use safe fallbacks for potentially missing data fields from the server
    const userName = item.name || "Unknown User";
    const userDesignation = item.designation || "N/A Designation";
    const userEmail = item.email || "No Email";
    const avatarLetter = userName.charAt(0) || "?";
    const isCompleted = !!item.submittedAt;

    return (
      <View
        style={[
          styles.userCard,
          // Dynamic border color based on status
          { borderLeftColor: isCompleted ? "#40916c" : "#e53935" },
        ]}
      >
        <View style={styles.userAvatar}>
          {/* Use the safe avatar letter */}
          <Text style={styles.userAvatarText}>{avatarLetter}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Use the safe userName */}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userMeta}>
            {/* Use safe designation and email */}
            {userDesignation} | {userEmail}
          </Text>
        </View>

        {isCompleted ? (
          <View style={styles.statusPill}>
            <Icon
              name="check-circle"
              size={14}
              color="#40916c"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statusText}>
              Completed on {new Date(item.submittedAt!).toLocaleDateString()}
            </Text>
          </View>
        ) : (
          <View style={[styles.statusPill, { backgroundColor: "#ffe8e6" }]}>
            <Icon
              name="clock-o"
              size={14}
              color="#e53935"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: "#e53935" }]}>
              Pending
            </Text>
          </View>
        )}
      </View>
    );
  };

  // --- Loading State ---
  if (loading) {
    return (
      <View style={[styles.screen, tw`justify-center items-center`]}>
        <ActivityIndicator size="large" color="#800080" />
        <Text style={tw`mt-4 text-gray-600`}>
          Loading assessment details...
        </Text>
      </View>
    );
  }
  // --- Error State ---
  if (error || !assessment) {
    return (
      <View style={[styles.screen, tw`justify-center items-center`]}>
        <Text style={styles.errorText}>{error || "Assessment not found."}</Text>
        <TouchableOpacity
          onPress={handleBack}
          style={tw`mt-6 p-3 bg-purple-600 rounded-lg`}
        >
          <Text style={tw`text-white font-bold`}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { title, assignedCount, completedCount } = assessment;
  const isPendingFilter = filter === "pending";
  const pendingUsersCount = assignedCount - completedCount;

  return (
    <View style={styles.screen}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
          <Text style={styles.headerText}>ASSESSMENT PROGRESS</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.assessmentTitle}>{title}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressValue}>{completedCount}</Text> /{" "}
              {assignedCount} Completed
            </Text>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>

            <Text style={styles.progressHint}>
              Completion Rate: {progressPercent.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.hr} />

          {/* Filter Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setFilter("completed")}
              style={[
                styles.toggleButton,
                !isPendingFilter && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={
                  !isPendingFilter ? styles.toggleTextActive : styles.toggleText
                }
              >
                Completed ({completedCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("pending")}
              style={[
                styles.toggleButton,
                isPendingFilter && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={
                  isPendingFilter ? styles.toggleTextActive : styles.toggleText
                }
              >
                Did Not Complete ({pendingUsersCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reminder Button */}
          {isPendingFilter && pendingUsersCount > 0 && (
            <TouchableOpacity
              onPress={sendReminder}
              disabled={sendingReminder}
              style={[
                styles.sendReminderButton,
                sendingReminder && styles.sendReminderButtonDisabled,
              ]}
            >
              {sendingReminder ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="bell" size={16} color="#fff" />
                  <Text style={styles.sendReminderText}>
                    Send Reminder to {pendingUsersCount} Users
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* User List */}
          <View style={styles.listWrapper}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name={isPendingFilter ? "envelope-open-o" : "check-circle-o"}
                  size={30}
                  color="#c2a2e2"
                />
                <Text style={styles.emptyTitle}>
                  {isPendingFilter
                    ? "All users completed!"
                    : "No completed assessments yet."}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Toast />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9f6ff" },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerArc: {
    backgroundColor: "#800080",
    width: "100%",
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 40 : (StatusBar.currentHeight || 24) + 16,
    zIndex: 10,
    padding: 8,
  },

  assessmentTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#32174d",
    marginBottom: 20,
    textAlign: "center",
    maxWidth: 780,
    width: "100%",
  },

  progressContainer: {
    width: "100%",
    maxWidth: 780,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#efe1fa",
    elevation: 2,
  },
  progressLabel: {
    fontSize: 16,
    color: "#4b0082",
    fontWeight: "600",
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6c2eb9",
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#e0d0ef",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6c2eb9",
    borderRadius: 6,
  },
  progressHint: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
  },

  hr: {
    width: "100%",
    maxWidth: 780,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e9fb",
    marginVertical: 20,
  },

  toggleContainer: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 780,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0d0ef",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#6c2eb9",
    elevation: 2,
  },
  toggleText: {
    color: "#4b0082",
    fontWeight: "600",
    fontSize: 15,
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  sendReminderButton: {
    width: "100%",
    maxWidth: 780,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffa726",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    elevation: 3,
  },
  sendReminderButtonDisabled: {
    backgroundColor: "#ffb95e",
    opacity: 0.8,
  },
  sendReminderText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  listWrapper: {
    width: "100%",
    maxWidth: 780,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#efe1fa",
    elevation: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6c2eb9",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#32174d",
  },
  userMeta: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6fff2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#40916c",
  },
  errorText: {
    textAlign: "center",
    color: "#e53935",
    marginTop: 24,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "#efe1fa",
    marginTop: 10,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6c2eb9",
  },
});
