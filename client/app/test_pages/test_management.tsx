import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import tw from "twrnc";
import { router } from "expo-router";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { useAuthStore } from "@/store/useAuthStore";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import AdminTabs from "@/components/AdminTabs";
import { Animated } from "react-native";
import { Image } from "react-native";
import AppHeader from "@/components/AppHeader";
// Note: XLSX is imported dynamically in the download function
// TYPES
type Assessment = {
  _id: string;
  title: string;
  roles: string[];
  questions: { _id: string; text: string; options: { text: string }[] }[];
  createdAt: string;
  deadline?: string;
};
const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const copyAssessmentLink = (test: Assessment) => {
  // NOTE: In a production environment, you should use the deployed host URL,
  // not localhost:8081. This is kept for local development context.
  const encoded = encodeURIComponent(JSON.stringify(test));
  const link = `http://localhost:8081/${test._id}/disclaimer?data=${encoded}`;
  Clipboard.setStringAsync(link);
  Toast.show({ type: "success", text1: "Link Copied!" });
};
export default function TestManagement() {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [testToDeactivate, setTestToDeactivate] = useState<Assessment | null>(
    null,
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // send modal state
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    null,
  );
  const [filterType, setFilterType] = useState<"role" | "organization" | null>(
    null,
  );
  const [filterQuery, setFilterQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string[]>([]);
  const [sendingAssessment, setSendingAssessment] = useState(false); // NEW STATE
  const debounceRef = useRef<number | null>(null);
  const [showFabLabel, setShowFabLabel] = useState(true);
  const fabScale = useRef(new Animated.Value(1)).current;
  const [showTabs, setShowTabs] = useState(true);
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50) {
      // HIDE ADMIN TABS
      setShowTabs(false);
      // HIDE FAB LABEL + SHRINK
      if (showFabLabel) {
        setShowFabLabel(false);
        Animated.spring(fabScale, {
          toValue: 0.75,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // SHOW ADMIN TABS
      setShowTabs(true);
      // SHOW FAB LABEL + EXPAND
      if (!showFabLabel) {
        setShowFabLabel(true);
        Animated.spring(fabScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }
  };
  const axiosInstance = useAuthStore((s) => s.axiosInstance);
  const deactivateAssessmentById = useAssessmentStore(
    (s) => s.deactivateAssessmentById,
  );
  // --- FETCH & SORT TESTS ---
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get("/assessments");
        // Sort descending (b - a) to put the newest assessment first.
        const sortedTests = res.data.sort((a: Assessment, b: Assessment) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        setTests(sortedTests);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching tests:", err);
        setError("Failed to load tests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [axiosInstance]);
  // --- SEARCH FILTER ---
  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFilteredTests(
        tests.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.roles?.some((r) => r.toLowerCase().includes(q)),
        ),
      );
    } else {
      setFilteredTests([]);
    }
  }, [search, tests]);
  const displayTests = search ? filteredTests : tests;
  // --- DEACTIVATE LOGIC ---
  const confirmDeactivate = async () => {
    if (!testToDeactivate) return;
    try {
      const confirmed = await deactivateAssessmentById(testToDeactivate._id);
      if (confirmed) {
        setTests((prev) => prev.filter((t) => t._id !== testToDeactivate._id));
        Toast.show({ type: "success", text1: "Assessment deactivated" });
      } else {
        Toast.show({ type: "error", text1: "Failed to deactivate assessment" });
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setModalVisible(false);
      setTestToDeactivate(null);
    }
  };
  // --- DOWNLOAD LOGIC (UNCHANGED) ---
  const sanitizeFileName = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "assessment";
  const handleDownloadResponses = async (assessment: Assessment) => {
    try {
      setDownloadingId(assessment._id);
      const { data } = await axiosInstance.get(
        `/assessments/${assessment._id}/responses`,
      );
      if (!data || !Array.isArray(data) || data.length === 0) {
        Toast.show({
          type: "info",
          text1: "No responses yet for this assessment",
        });
        return;
      }
      let mod: any;
      try {
        mod = await import("xlsx-js-style");
      } catch (impErr) {
        console.error("Failed to import xlsx-js-style:", impErr);
        try {
          mod = await import("xlsx");
        } catch (e) {
          Toast.show({
            type: "error",
            text1: "Missing dependency",
            text2: "Please install xlsx-js-style",
          });
          return;
        }
      }
      const XLSXLib = mod?.default || mod;

      let rowsData = data;
      if (rowsData.items && Array.isArray(rowsData.items))
        rowsData = rowsData.items;

      const questionIdToTextMap: Record<string, string> = {};
      const questionHeaders: string[] = [];

      assessment.questions.forEach((q, index) => {
        const headerTitle = q.text || `Question ${index + 1}`;
        questionHeaders.push(headerTitle);
        if (q._id) {
          questionIdToTextMap[q._id] = headerTitle;
        }
      });

      const rows = rowsData.map((respRow: any, idx: number) => {
        const base: Record<string, any> = {
          "#": idx + 1,
          Name: respRow.user?.name || respRow.user?.username || "Anonymous",
          Email: respRow.user?.email || "",
          Organization: respRow.user?.organization || "N/A", // Added
          Location: respRow.user?.location || "N/A", // Added
          Designation: respRow.user?.designation || "",
          SubmittedAt: respRow.submittedAt
            ? new Date(respRow.submittedAt).toLocaleString()
            : "",
        };

        assessment.questions.forEach((q) => {
          const headerName = questionIdToTextMap[q._id] || q.text;
          const answerObj = respRow.answers ? respRow.answers[q._id] : null;
          let readableAnswer = "-";

          if (answerObj) {
            if (typeof answerObj === "string") {
              readableAnswer = answerObj;
            } else if (typeof answerObj === "object") {
              readableAnswer =
                answerObj.option || answerObj.text || answerObj.value || "";
            }
          }
          base[headerName] = readableAnswer;
        });

        return base;
      });

      const finalHeaders = [
        "#",
        "Name",
        "Email",
        "Organization",
        "Location",
        "Designation",
        "SubmittedAt",
        ...questionHeaders,
      ];

      const worksheet = XLSXLib.utils.json_to_sheet(rows, {
        header: finalHeaders,
      });

      const range = XLSXLib.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSXLib.utils.encode_cell({ r: 0, c: C }); // Row 0
        if (!worksheet[address]) continue;

        // Apply Style Object (supported by xlsx-js-style)
        worksheet[address].s = {
          font: {
            bold: true,
            sz: 12, // slightly larger font
            color: { rgb: "FFFFFF" }, // White text
          },
          fill: {
            fgColor: { rgb: "4b0082" }, // Purple background (matches your app theme)
          },
          alignment: { horizontal: "center" },
        };
      }

      // Auto-width cols
      const wscols = finalHeaders.map((h) => ({ wch: h.length + 5 }));
      worksheet["!cols"] = wscols;

      const workbook = XLSXLib.utils.book_new();
      XLSXLib.utils.book_append_sheet(workbook, worksheet, "Responses");

      const fileName = `${sanitizeFileName(assessment.title)}-responses.xlsx`;

      // 5. Download / Save (Standard Logic)
      if (Platform.OS === "web") {
        const wbout = XLSXLib.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        Toast.show({ type: "success", text1: "Downloaded Responses" });
        return;
      }

      const wbbase64 = XLSXLib.write(workbook, {
        bookType: "xlsx",
        type: "base64",
      });
      const baseDir =
        FileSystem.documentDirectory ||
        FileSystem.cacheDirectory ||
        (FileSystem as any).temporaryDirectory ||
        "";
      if (!baseDir) {
        Toast.show({ type: "error", text1: "Unable to access storage" });
        return;
      }
      const fileUri = `${baseDir}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, wbbase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({
          type: "success",
          text1: "Saved responses",
          text2: fileUri,
        });
      }
    } catch (error: any) {
      console.error("Download responses error:", error);
      const status = error?.response?.status;
      if (status === 404) {
        Toast.show({
          type: "error",
          text1: "Responses endpoint not found (404)",
          text2: "Check server routes: expected /assessments/:id/responses",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to export responses",
          text2: error?.message || "",
        });
      }
    } finally {
      setDownloadingId(null);
    }
  };
  // --- SEND MODAL LOGIC (UPDATED) ---
  const openSendModal = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    // Set default filter type to 'role' if roles exist, otherwise null
    setFilterType(assessment.roles?.length ? "role" : null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue([]);
    setSendingAssessment(false); // Reset sending state
    setSendModalVisible(true);
  };
  const closeSendModal = () => {
    setSendModalVisible(false);
    setActiveAssessment(null);
    setFilterType(null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue([]);
    setSendingAssessment(false); // Reset sending state
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };
  // Debounced search for suggestions (FIXED POINT 1)
  useEffect(() => {
    if (!filterType) {
      setSuggestions([]);
      return;
    }
    const qTrim = filterQuery.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Logic for empty query (FIXED POINT 1)
    if (qTrim.length === 0) {
      setLoadingSuggestions(false); // Ensure loading is false
      if (filterType === "role" && activeAssessment?.roles?.length) {
        // Show existing roles from the assessment as default suggestions
        setSuggestions(activeAssessment.roles.slice(0, 8));
      } else {
        // Set empty list, relying on ListEmptyComponent for message
        setSuggestions([]);
      }
      return;
    }

    setLoadingSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      try {
        let resp = null;
        try {
          // Try the /search/filters endpoint first (preferred)
          resp = await axiosInstance.get("/search/filters", {
            params: { type: filterType, q: qTrim },
          });
        } catch (e1) {
          // Fallback to older /roles or /organizations endpoints
          try {
            const path = filterType === "role" ? "/roles" : "/organizations";
            resp = await axiosInstance.get(path, { params: { q: qTrim } });
          } catch (e2) {
            console.warn("Suggestion fetch fallback failed", e2);
            resp = null;
          }
        }
        let items: string[] = [];
        if (resp && resp.data) {
          if (Array.isArray(resp.data)) {
            items = resp.data
              .map((it: any) =>
                typeof it === "string"
                  ? it
                  : it.name || it.title || it.organization || it.value,
              )
              .filter(Boolean);
          } else if (Array.isArray(resp.data.items)) {
            items = resp.data.items
              .map((it: any) => it.name || it.title || it.value)
              .filter(Boolean);
          }
        }
        // Secondary local fallback for roles if API fails or returns empty
        if ((!items || items.length === 0) && filterType === "role") {
          const pool = new Set<string>();
          activeAssessment?.roles?.forEach((r) => pool.add(r));
          tests.forEach((t) => t.roles?.forEach((r) => pool.add(r)));
          items = Array.from(pool).filter((r) =>
            r.toLowerCase().includes(qTrim.toLowerCase()),
          );
        }
        setSuggestions(items.slice(0, 25));
      } catch (err) {
        console.warn("Suggestion fetch failed", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
        debounceRef.current = null;
      }
    }, 300) as unknown as number;
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [filterQuery, filterType, activeAssessment, axiosInstance, tests]);

  // --- CONFIRM SEND EMAIL (FIXED POINT 3 & 4) ---
  const confirmSendFromModal = async () => {
    if (!activeAssessment || sendingAssessment) return;
    if (!filterType) {
      Toast.show({
        type: "info",
        text1: "Choose a filter type (Role or organization)",
      });
      return;
    }
    const values = Array.isArray(selectedFilterValue)
      ? selectedFilterValue
      : selectedFilterValue
        ? [selectedFilterValue]
        : [];
    if (values.length === 0) {
      Toast.show({
        type: "info",
        text1: `Please select one or more ${filterType}s`,
      });
      return;
    }

    setSendingAssessment(true); // Start animation
    Toast.show({ type: "info", text1: "Sending assessments..." });

    const payload = {
      assessmentId: activeAssessment._id,
      filterType,
      filterValues: values,
      // Keeping filterValue for legacy/simplicity if only one is selected
      filterValue: values.length === 1 ? values[0] : values.join(","),
    };

    try {
      const res = await axiosInstance.post("/assessments/send", payload, {
        headers: { "Content-Type": "application/json" },
      });

      Toast.show({
        type: "success",
        text1: "Assessment sent successfully!",
        text2: "Users should now appear in the Progress chart.",
      });

      // The progress page is updated by the backend creating UserAssessment records.
      // Frontend cannot explicitly force this, only relies on the backend API call.

      closeSendModal();
    } catch (err: any) {
      const status = err?.response?.status;
      const serverBody = err?.response?.data;
      let text1 = "Send failed";
      let text2 = err?.message || String(err);
      if (
        status === 400 &&
        serverBody &&
        /no users found/i.test(JSON.stringify(serverBody))
      ) {
        text1 = "No users found for selected filter";
        text2 = "Check if users match the selected role/organization.";
      } else if (serverBody && (serverBody.message || serverBody.error)) {
        text2 = serverBody.message || serverBody.error;
      } else if (status === 404) {
        text2 = "Endpoint not found: /assessments/send";
      }
      Toast.show({ type: "error", text1, text2 });
    } finally {
      setSendingAssessment(false); // Stop animation
    }
  };
  // ----------------------
  // Render
  // ----------------------
  const fabBottom = showTabs ? 100 : 30;
  const isSendDisabled =
    !filterType || selectedFilterValue.length === 0 || sendingAssessment;

  return (
    <View style={styles.screen}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* FIXED HEADER */}
      <AppHeader
        logoSource={require("../../assets/images/title-logos/title.png")}
      />
      <SafeAreaView style={{ flex: 1, marginTop: 105 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Search + Archive Action */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <SearchBar
                placeholder="Search assessments..."
                value={search}
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/test_pages/deactivatedAssessments")}
              style={[styles.addAssessmentBtn, styles.archiveButton]}
            >
              <Icon name="archive" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Assessment Cards */}
          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#800080"
                style={tw`mt-10`}
              />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : displayTests.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="inbox" size={30} color="#c2a2e2" />
                <Text style={styles.emptyTitle}>No Active Assessments</Text>
                <Text style={styles.emptySubtitle}>
                  Create a new assessment or check the archive.
                </Text>
              </View>
            ) : (
              displayTests.map((test) => (
                <View key={test._id} style={styles.testCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View style={styles.iconPill}>
                        <Icon name="file-text-o" size={16} color="#800080" />
                      </View>
                      <Text style={styles.cardTitle}>{test.title}</Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Icon name="question-circle" size={12} color="#800080" />
                      <Text style={styles.metaText}>
                        {test.questions?.length || 0} questions
                      </Text>
                    </View>
                  </View>
                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <Text style={styles.sectionLabel}>Applicable Roles</Text>
                    <View style={styles.rolesContainer}>
                      {test.roles?.length ? (
                        test.roles.map((role) => (
                          <View key={role} style={styles.roleChip}>
                            <Text style={styles.roleChipText}>{role}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.metaMuted}>No Roles Assigned</Text>
                      )}
                    </View>
                    {/* Date and Copy Link - 🔥 FIX APPLIED HERE 🔥 */}
                    <View style={styles.datesContainer}>
                      <View style={styles.dateItem}>
                        <Text style={styles.sectionLabel}>Created On</Text>
                        <Text style={styles.dateText}>
                          {test.createdAt
                            ? new Date(test.createdAt).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </View>
                      <View
                        style={[styles.dateItem, { alignItems: "flex-end" }]}
                      >
                        <Text style={styles.sectionLabel}>Deadline</Text>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>
                            {test.deadline
                              ? new Date(test.deadline).toLocaleDateString()
                              : "No deadline"}
                          </Text>
                          <TouchableOpacity
                            onPress={() => copyAssessmentLink(test)}
                            style={styles.copyBtn}
                          >
                            <Icon name="copy" size={16} color="#6c2eb9" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {/* End of Card Body */}
                  </View>
                  {/* Actions */}
                  <View
                    style={[
                      styles.actionsRow,
                      isTablet ? styles.actionsRowTablet : undefined,
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.actionButton, styles.detailsAction]}
                      onPress={() => {
                        router.push({
                          pathname: "/test_pages/assessmentProgress",
                          params: { id: test._id },
                        });
                      }}
                    >
                      <Icon name="bar-chart" size={16} color="#fff" />
                      <Text style={styles.actionText}>Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryAction]}
                      onPress={() => openSendModal(test)}
                    >
                      <Icon name="paper-plane" size={16} color="#fff" />
                      <Text style={styles.actionText}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.downloadAction]}
                      onPress={() => handleDownloadResponses(test)}
                      disabled={downloadingId === test._id}
                    >
                      {downloadingId === test._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Icon name="download" size={16} color="#fff" />
                      )}
                      <Text style={styles.actionText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editAction]}
                      onPress={() =>
                        router.push({
                          pathname: "/test_pages/modifyTest",
                          params: { id: test._id },
                        })
                      }
                    >
                      <Icon name="edit" size={16} color="#fff" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteAction]}
                      onPress={() => {
                        setTestToDeactivate(test);
                        setModalVisible(true);
                      }}
                    >
                      <Icon name="archive" size={16} color="#fff" />
                      <Text style={styles.actionText}>Deactivate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* --- (Deactivate Modal) --- */}
      {modalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View
              style={[styles.modalIconWrapper, { backgroundColor: "#fff0e1" }]}
            >
              <Icon name="archive" size={26} color="#ffa726" />
            </View>
            <Text style={styles.modalTitle}>Deactivate Assessment?</Text>
            <Text style={styles.modalMessage}>
              This will hide "{testToDeactivate?.title}" from the main list. You
              can reactivate it later from the archive.
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeactivate}
              >
                <Text style={styles.deleteButtonText}>Deactivate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* --- (Send Modal - UPDATED UI) --- */}
      {sendModalVisible && activeAssessment && (
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 700 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Send "{activeAssessment.title}"
              </Text>
              <TouchableOpacity
                onPress={closeSendModal}
                style={styles.modalCloseButton}
              >
                <Icon name="times" size={20} color="#4b0082" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />

            {/* 1. Filter Type Selection */}
            <Text style={styles.filterSectionTitle}>
              <Icon name="filter" size={14} color="#6c2eb9" /> Choose Filter
              Type
            </Text>
            <View style={styles.pillToggleGroup}>
              <TouchableOpacity
                onPress={() => {
                  setFilterType("role");
                  setSelectedFilterValue([]);
                  setFilterQuery("");
                }}
                style={[
                  styles.pillToggle,
                  filterType === "role" ? styles.pillToggleActive : undefined,
                ]}
              >
                <Icon
                  name="user-tag"
                  size={16}
                  color={filterType === "role" ? "#fff" : "#4b0082"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={
                    filterType === "role"
                      ? styles.pillToggleTextActive
                      : styles.pillToggleText
                  }
                >
                  By Role
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFilterType("organization");
                  setSelectedFilterValue([]);
                  setFilterQuery("");
                }}
                style={[
                  styles.pillToggle,
                  filterType === "organization"
                    ? styles.pillToggleActive
                    : undefined,
                ]}
              >
                <Icon
                  name="building"
                  size={16}
                  color={filterType === "organization" ? "#fff" : "#4b0082"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={
                    filterType === "organization"
                      ? styles.pillToggleTextActive
                      : styles.pillToggleText
                  }
                >
                  By Organization
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Filter Value Input (Chips + Search) */}
            {filterType && (
              <>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { marginTop: 0, marginBottom: 8 },
                  ]}
                >
                  <Icon name="tags" size={14} color="#6c2eb9" />
                  {`Selected ${
                    filterType === "role" ? "Role(s)" : "Organization(s)"
                  }`}
                </Text>
                {/* Selected Chips Display Area */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.selectedChipsDisplay}
                  contentContainerStyle={styles.chipsScrollContent}
                >
                  {(selectedFilterValue ?? []).length === 0 ? (
                    <Text style={styles.chipsPlaceholder}>
                      Start typing below to search and add...
                    </Text>
                  ) : (
                    (selectedFilterValue ?? []).map((val) => (
                      <View key={val} style={styles.selectedChip}>
                        <Text style={styles.selectedChipText} numberOfLines={1}>
                          {val}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedFilterValue((prev) => {
                              const arr = Array.isArray(prev) ? [...prev] : [];
                              return arr.filter((v) => v !== val);
                            })
                          }
                          style={styles.removeChipButton}
                        >
                          <Text style={styles.removeChipText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
                {/* Search Input */}
                <TextInput
                  placeholder={`Search for ${filterType}...`}
                  value={filterQuery}
                  onChangeText={(t) => {
                    setFilterQuery(t);
                  }}
                  style={styles.searchFilterInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                />

                {/* Suggestions List */}
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { marginTop: 10, marginBottom: 8 },
                  ]}
                >
                  <Icon name="list-ul" size={14} color="#6c2eb9" /> Suggestions
                </Text>
                <View style={styles.suggestionsContainer}>
                  {loadingSuggestions ? (
                    <ActivityIndicator style={{ paddingVertical: 12 }} />
                  ) : (
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => {
                        const isSelected =
                          Array.isArray(selectedFilterValue) &&
                          selectedFilterValue.includes(item);
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedFilterValue((prev) => {
                                const arr = Array.isArray(prev)
                                  ? [...prev]
                                  : [];
                                if (arr.includes(item))
                                  return arr.filter((v) => v !== item);
                                return [...arr, item];
                              });
                            }}
                            style={[
                              styles.suggestionRow,
                              isSelected
                                ? styles.suggestionRowSelected
                                : undefined,
                            ]}
                          >
                            <Text
                              style={
                                isSelected
                                  ? { color: "#fff", fontWeight: "700" }
                                  : { color: "#222" }
                              }
                            >
                              {isSelected ? "✓ " : ""}
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={() => (
                        <Text style={styles.emptySuggestionText}>
                          {filterQuery.trim().length > 0
                            ? "No matching items found."
                            : `Type to search or see popular ${filterType}s.`}
                        </Text>
                      )}
                    />
                  )}
                </View>
              </>
            )}

            {/* Modal Actions */}
            <View style={[styles.modalButtonsContainer, { marginTop: 24 }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeSendModal}
                disabled={sendingAssessment}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.sendActionButton,
                  isSendDisabled && styles.sendButtonDisabled, // Apply disabled style
                ]}
                onPress={confirmSendFromModal}
                disabled={isSendDisabled}
              >
                {sendingAssessment ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.deleteButtonText, { color: "#fff" }]}>
                    Send Assessment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <AdminTabs visible={showTabs} />
      <Toast />
      <Animated.View
        style={[
          styles.fabContainer,
          { bottom: fabBottom, transform: [{ scale: fabScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push("/test_pages/addTest")}
        >
          <Icon
            name="pencil"
            size={20}
            color="#fff"
            style={{ marginRight: showFabLabel ? 8 : 0 }}
          />
          {showFabLabel && <Text style={styles.fabLabel}>New Assessment</Text>}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
// --------------------------
// Styles (Updated for Send Modal)
// --------------------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9f6ff" },
  scrollContent: { alignItems: "center", paddingBottom: 40 },
  // --- Header and Search Styles ---
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
    maxWidth: 780,
    gap: 12,
  },
  searchContainer: { marginVertical: 10, marginHorizontal: 2, width: "82%" },
  // searchContainer: { flex: 1 },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0d0ef",
    minHeight: 48,
  },
  // searchInput: { color: "#000", fontSize: 15 },
  searchInput: { color: "#000" },
  noUsersText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    fontSize: 5,
  },
  addAssessmentBtn: {
    height: 52,
    backgroundColor: "#800080",
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  archiveButton: {
    backgroundColor: "#6c2eb9",
    paddingHorizontal: 16,
  },
  // --- List and Card Styles ---
  listContainer: { width: "100%", maxWidth: 780, paddingHorizontal: 16 },
  testCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#efe1fa",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f4ebff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#32174d",
    flexShrink: 1,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#efe1fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  cardBody: { marginTop: 8, marginBottom: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6c2eb9",
    textTransform: "capitalize",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  rolesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: {
    backgroundColor: "#f4ebff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleChipText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  metaMuted: { color: "#666", fontSize: 13 },
  // --- Date/Copy Link Styles ---
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f4ebff",
    paddingTop: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#32174d",
    fontWeight: "600",
    marginTop: 4,
  },
  copyBtn: {
    padding: 8,
    backgroundColor: "#f4ebff",
    borderRadius: 8,
    // The original code had marginLeft: 10 in the style definition, but needed to be contained.
    marginLeft: 8, // Adjusted spacing slightly
  },
  // --- End Date/Copy Link Styles ---
  // --- Action Button Styles ---
  actionsRow: { flexDirection: "column", gap: 10 },
  actionsRowTablet: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    minHeight: 48,
  },
  primaryAction: {
    backgroundColor: "#6c2eb9",
    shadowColor: "#6c2eb9",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  downloadAction: { backgroundColor: "#4b0082" },
  editAction: { backgroundColor: "#40916c" },
  deleteAction: { backgroundColor: "#e53935" },
  detailsAction: {
    backgroundColor: "#007bff",
    shadowColor: "#007bff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  errorText: {
    textAlign: "center",
    color: "#e53935",
    marginTop: 24,
    fontWeight: "600",
  },
  // --- Empty State Styles ---
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "#efe1fa",
    marginTop: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#32174d",
  },
  emptySubtitle: { marginTop: 4, textAlign: "center", color: "#6d6d6d" },
  // --- Modal Styles (Deactivate) ---
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff0e1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3c1053",
    marginBottom: 0, // Adjusted
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsContainer: { flexDirection: "row", gap: 12, width: "100%" },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d0c2e8",
    backgroundColor: "#f9f6ff",
  },
  cancelButtonText: { color: "#4b0082", fontWeight: "600" },
  deleteButton: { backgroundColor: "#e53935" },
  deleteButtonText: { color: "#fff", fontWeight: "700" },
  /* send modal specific (UPDATED) */
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  modalCloseButton: {
    padding: 5,
    marginRight: -5,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e6d9f2",
    width: "100%",
    marginBottom: 16,
  },
  filterSectionTitle: {
    marginBottom: 8,
    color: "#444",
    fontWeight: "700",
    fontSize: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 5,
  },
  pillToggleGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    width: "100%",
    justifyContent: "space-around",
    paddingHorizontal: 5,
  },
  pillToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6d9f2",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Make them take equal space
    justifyContent: "center",
  },
  pillToggleActive: { backgroundColor: "#6c2eb9", borderColor: "#6c2eb9" },
  pillToggleText: { color: "#4b0082", fontWeight: "700" },
  pillToggleTextActive: { color: "#fff", fontWeight: "700" },
  // Selected Chips Area
  selectedChipsDisplay: {
    minHeight: 45,
    maxHeight: 45,
    width: "100%",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#efe1fa",
    marginBottom: 8,
  },
  chipsScrollContent: {
    alignItems: "center",
    paddingRight: 8,
    paddingLeft: 5,
  },
  chipsPlaceholder: {
    color: "#999",
    fontSize: 14,
    paddingLeft: 6,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4ebff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d7c3f2",
    marginRight: 8,
    maxWidth: 200,
  },
  selectedChipText: {
    color: "#4b0082",
    fontWeight: "600",
    marginRight: 6,
    fontSize: 13,
  },
  removeChipButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#6c2eb9",
    alignItems: "center",
    justifyContent: "center",
  },
  removeChipText: {
    color: "#fff",
    fontWeight: "700",
    lineHeight: 18,
  },
  // Search Input
  searchFilterInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#d7c3f2",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  // Suggestions
  suggestionsContainer: {
    width: "100%",
    maxHeight: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6d9f2",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  suggestionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e9fb",
    backgroundColor: "#fff",
  },
  suggestionRowSelected: { backgroundColor: "#6c2eb9" },
  emptySuggestionText: {
    color: "#666",
    paddingVertical: 12,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  // Send Button (FIXED POINT 2)
  sendActionButton: {
    backgroundColor: "#6c2eb9", // Xebia Purple
    shadowColor: "#6c2eb9",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#a0a0a0", // Gray out when disabled/sending
    shadowOpacity: 0.1,
    elevation: 1,
  },
  // --- FAB Styles ---
  fabButton: {
    backgroundColor: "#800080",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#800080",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  fabContainer: {
    position: "absolute",
    right: 10,
    zIndex: 999,
  },
});
