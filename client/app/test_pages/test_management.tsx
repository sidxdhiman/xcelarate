import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Alert,
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
// Note: XLSX is imported dynamically in the download function

type Assessment = {
  _id: string;
  title: string;
  roles: string[];
  questions: { text: string; options: { text: string }[] }[];
  createdAt: string; // This comes from timestamps
  deadline?: string; // This is the new field
};

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function TestManagement() {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [testToDeactivate, setTestToDeactivate] = useState<Assessment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // send modal state
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [filterType, setFilterType] = useState<"role" | "organization" | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string[]>([]);
  const debounceRef = useRef<number | null>(null);

  const axiosInstance = useAuthStore((s) => s.axiosInstance);
  const deactivateAssessmentById = useAssessmentStore((s) => s.deactivateAssessmentById);

  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 60;
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get("/assessments");
        setTests(res.data.reverse());
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

  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFilteredTests(
          tests.filter(
              (t) =>
                  t.title.toLowerCase().includes(q) ||
                  t.roles?.some((r) => r.toLowerCase().includes(q))
          )
      );
    } else {
      setFilteredTests([]);
    }
  }, [search, tests]);

  const displayTests = search ? filteredTests : tests;

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

  const sanitizeFileName = (raw: string) =>
      raw
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "assessment";

  const handleDownloadResponses = async (assessment: Assessment) => {
    try {
      setDownloadingId(assessment._id);

      const { data } = await axiosInstance.get(`/assessments/${assessment._id}/responses`);

      if (!data || !Array.isArray(data) || data.length === 0) {
        Toast.show({ type: 'info', text1: 'No responses yet for this assessment' });
        return;
      }

      let mod: any;
      try {
        mod = await import('xlsx');
      } catch (impErr) {
        console.error('Failed to import xlsx dynamically:', impErr);
        Toast.show({ type: 'error', text1: 'Missing dependency: xlsx', text2: 'Install xlsx and restart the app' });
        return;
      }
      const XLSXLib = mod?.default || mod;
      if (!XLSXLib || !XLSXLib.utils) {
        console.error('XLSX loaded but utils missing', mod);
        Toast.show({ type: 'error', text1: 'xlsx module loaded incorrectly' });
        return;
      }

      let rowsData = data;
      if (rowsData.items && Array.isArray(rowsData.items)) rowsData = rowsData.items;

      const keys = new Set<string>();
      rowsData.forEach((r: any) => {
        const answers = r.answers || {};
        Object.keys(answers).forEach((k) => keys.add(k));
      });
      const questionKeys = Array.from(keys);

      const rows = rowsData.map((respRow: any, idx: number) => {
        const base: Record<string, any> = {
          '#': idx + 1,
          Name: respRow.user?.name || respRow.user?.username || 'Anonymous',
          Email: respRow.user?.email || '',
          Designation: respRow.user?.designation || '',
          SubmittedAt: respRow.submittedAt ? new Date(respRow.submittedAt).toLocaleString() : '',
        };
        questionKeys.forEach((qk) => {
          const ans = (respRow.answers && respRow.answers[qk]) || '';
          base[qk] =
              ans && typeof ans === 'object'
                  ? (ans.option ?? ans.text ?? '')
                  : (typeof ans === 'string' ? ans : '');
        });
        return base;
      });

      const worksheet = XLSXLib.utils.json_to_sheet(rows, {
        header: ['#', 'Name', 'Email', 'Designation', 'SubmittedAt', ...questionKeys],
      });
      const workbook = XLSXLib.utils.book_new();
      XLSXLib.utils.book_append_sheet(workbook, worksheet, 'Responses');

      const safe = (s: string) =>
          s?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'assessment';
      const fileName = `${safe(assessment.title)}-responses.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSXLib.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        Toast.show({ type: 'success', text1: 'Downloaded Responses' });
        return;
      }

      const wbbase64 = XLSXLib.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const baseDir =
          FileSystem.documentDirectory || FileSystem.cacheDirectory || (FileSystem as any).temporaryDirectory || '';
      if (!baseDir) {
        Toast.show({ type: 'error', text1: 'Unable to access storage' });
        return;
      }
      const fileUri = `${baseDir}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, wbbase64, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({ type: 'success', text1: 'Saved responses', text2: fileUri });
      }
    } catch (error: any) {
      console.error('Download responses error:', error);
      const status = error?.response?.status;
      if (status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Responses endpoint not found (404)',
          text2: 'Check server routes: expected /assessments/:id/responses',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to export responses', text2: error?.message || '' });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const openSendModal = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setFilterType(null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue([]);
    setSendModalVisible(true);
  };
  const closeSendModal = () => {
    setSendModalVisible(false);
    setActiveAssessment(null);
    setFilterType(null);
    setFilterQuery("");
    setSuggestions([]);
    setSelectedFilterValue([]);
    ;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };
  useEffect(() => {
    if (!filterType) {
      setSuggestions([]);
      return;
    }
    if (!filterQuery || filterQuery.trim().length === 0) {
      if (filterType === "role" && activeAssessment?.roles?.length) {
        setSuggestions(activeAssessment.roles.slice(0, 8));
      } else {
        setSuggestions([]);
      }
      return;
    }
    setLoadingSuggestions(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = (setTimeout(async () => {
      try {
        let resp = null;
        const qTrim = filterQuery.trim();
        try {
          resp = await axiosInstance.get("/search/filters", { params: { type: filterType, q: qTrim } });
        } catch (e1) {
          try {
            if (filterType === "role") {
              resp = await axiosInstance.get("/roles", { params: { q: qTrim } });
            } else {
              resp = await axiosInstance.get("/organizations", { params: { q: qTrim } });
            }
          } catch (e2) {
            console.warn("Suggestion fetch fallback failed", e2);
            resp = null;
          }
        }
        let items: string[] = [];
        if (resp && resp.data) {
          if (Array.isArray(resp.data)) {
            items = resp.data.map((it: any) => (typeof it === "string" ? it : it.name || it.title || it.organization || it.value)).filter(Boolean);
          } else if (Array.isArray(resp.data.items)) {
            items = resp.data.items.map((it: any) => it.name || it.title || it.value).filter(Boolean);
          }
        }
        if ((!items || items.length === 0) && filterType === "role") {
          const pool = new Set<string>();
          activeAssessment?.roles?.forEach((r) => pool.add(r));
          tests.forEach((t) => t.roles?.forEach((r) => pool.add(r)));
          items = Array.from(pool).filter((r) => r.toLowerCase().includes(qTrim.toLowerCase()));
        }
        setSuggestions(items.slice(0, 25));
      } catch (err) {
        console.warn("Suggestion fetch failed", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
        debounceRef.current = null;
      }
    }, 300) as unknown) as number;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [filterQuery, filterType, activeAssessment, axiosInstance, tests]);
  const confirmSendFromModal = async () => {
    if (!activeAssessment) return;
    if (!filterType) {
      Toast.show({ type: "info", text1: "Choose a filter type (Role or organization)" });
      return;
    }
    const values = Array.isArray(selectedFilterValue) ? selectedFilterValue : selectedFilterValue ? [selectedFilterValue] : [];
    const payload = {
      assessmentId: activeAssessment._id,
      filterType,
      filterValues: values,
      filterValue: values.length === 1 ? values[0] : values.join(','),
    };
    console.log('[SEND PAYLOAD]', payload);
    Toast.show({ type: "info", text1: "Sending assessments..." });
    try {
      const res = await axiosInstance.post("/assessments/send", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("[SEND OK]", res.status, res.data);
      Toast.show({ type: "success", text1: "Assessment sent" });
      closeSendModal();
    } catch (err: any) {
      console.warn("[SEND FAIL]", err);
      const status = err?.response?.status;
      const serverBody = err?.response?.data;
      console.log("Server response body:", serverBody);
      if (status === 400 && serverBody && /no users found/i.test(JSON.stringify(serverBody))) {
        Toast.show({ type: "error", text1: "No users found for selected filter" });
      } else if (serverBody && (serverBody.message || serverBody.error)) {
        Toast.show({ type: "error", text1: "Send failed", text2: serverBody.message || serverBody.error });
      } else {
        Toast.show({ type: "error", text1: "Send failed", text2: err?.message || String(err) });
      }
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
      <View style={styles.screen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header Arc */}
            <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
              <Text style={styles.headerText}>ASSESSMENT MANAGEMENT</Text>
            </View>

            {/* Search + Actions */}
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

              <TouchableOpacity onPress={() => router.push("/test_pages/addTest")} style={styles.addAssessmentBtn}>
                <Icon name="plus" size={16} color="#fff" />
                <Text style={styles.addAssessmentText}>New Assessment</Text>
              </TouchableOpacity>
            </View>

            {/* Assessment Cards */}
            <View style={styles.listContainer}>
              {loading ? (
                  <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
              ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
              ) : displayTests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="inbox" size={30} color="#c2a2e2" />
                    <Text style={styles.emptyTitle}>No Active Assessments</Text>
                    <Text style={styles.emptySubtitle}>Create a new assessment or check the archive.</Text>
                  </View>
              ) : (
                  // --- THIS IS THE CORRECTED MAP FUNCTION ---
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
                            <Text style={styles.metaText}>{test.questions?.length || 0} questions</Text>
                          </View>
                        </View>

                        {/* --- THIS IS THE UPDATED cardBody --- */}
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

                          {/* --- THIS IS THE NEW PART --- */}
                          <View style={styles.datesContainer}>
                            <View style={styles.dateItem}>
                              <Text style={styles.sectionLabel}>Created On</Text>
                              <Text style={styles.dateText}>
                                {/* This check fixes the "Invalid Date" bug */}
                                {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.dateItem}>
                              <Text style={styles.sectionLabel}>Deadline</Text>
                              <Text style={styles.dateText}>
                                {test.deadline ? new Date(test.deadline).toLocaleDateString() : 'No deadline'}
                              </Text>
                            </View>
                          </View>
                          {/* --- END OF NEW PART --- */}
                        </View>
                        {/* --- END OF UPDATED cardBody --- */}

                        <View style={[styles.actionsRow, isTablet ? styles.actionsRowTablet : undefined]}>
                          <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={() => openSendModal(test)}>
                            <Icon name="paper-plane" size={16} color="#fff" />
                            <Text style={styles.actionText}>Send</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={[styles.actionButton, styles.downloadAction]} onPress={() => handleDownloadResponses(test)} disabled={downloadingId === test._id}>
                            {downloadingId === test._id ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={16} color="#fff" />}
                            <Text style={styles.actionText}>Download</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={[styles.actionButton, styles.editAction]} onPress={() => router.push({ pathname: "/test_pages/modifyTest", params: { id: test._id } })}>
                            <Icon name="edit" size={16} color="#fff" />
                            <Text style={styles.actionText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                              style={[styles.actionButton, styles.deleteAction]}
                              onPress={() => { setTestToDeactivate(test); setModalVisible(true); }}
                          >
                            <Icon name="archive" size={16} color="#fff" />
                            <Text style={styles.actionText}>Deactivate</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                  ))
                  // --- END OF CORRECTED MAP FUNCTION ---
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* --- (Modals are unchanged) --- */}
        {modalVisible && (
            <View style={styles.overlay}>
              <View style={styles.modalBox}>
                <View style={[styles.modalIconWrapper, {backgroundColor: '#fff0e1'}]}>
                  <Icon name="archive" size={26} color="#ffa726" />
                </View>
                <Text style={styles.modalTitle}>Deactivate Assessment?</Text>
                <Text style={styles.modalMessage}>
                  This will hide "{testToDeactivate?.title}" from the main list.
                  You can reactivate it later from the archive.
                </Text>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={confirmDeactivate}>
                    <Text style={styles.deleteButtonText}>Deactivate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        )}

        {sendModalVisible && activeAssessment && (
            <View style={styles.overlay}>
              <View style={[styles.modalBox, { maxWidth: 700 }]}>
                <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Send "{activeAssessment.title}"</Text>
                <Text style={{ marginBottom: 8, color: "#444", fontWeight: "600" }}>Choose filter type</Text>
                <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                  <TouchableOpacity
                      onPress={() => {
                        setFilterType("role");
                        setSelectedFilterValue([]);
                        ;
                        setFilterQuery("");
                      }}
                      style={[styles.pillToggle, filterType === "role" ? styles.pillToggleActive : undefined]}
                  >
                    <Text style={filterType === "role" ? styles.pillToggleTextActive : styles.pillToggleText}>By Role</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      onPress={() => {
                        setFilterType("organization");
                        setSelectedFilterValue([]);
                        ;
                        setFilterQuery("");
                      }}
                      style={[styles.pillToggle, filterType === "organization" ? styles.pillToggleActive : undefined]}
                  >
                    <Text style={filterType === "organization" ? styles.pillToggleTextActive : styles.pillToggleText}>By organization</Text>
                  </TouchableOpacity>
                </View>
                {filterType && (
                    <>
                      <Text style={{ color: "#444", marginBottom: 6, fontWeight: "600" }}>
                        {`Search ${filterType === "role" ? "role" : "organization"}`}
                      </Text>
                      <View style={styles.chipsInputWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsScrollContent}
                        >
                          {(selectedFilterValue ?? []).length === 0 ? (
                              <Text style={styles.chipsPlaceholder}>
                                {filterType === "role" ? "Add Role" : "Add organization"}
                              </Text>
                          ) : (
                              (selectedFilterValue ?? []).map((val) => (
                                  <View key={val} style={styles.selectedChip}>
                                    <Text style={styles.selectedChipText} numberOfLines={1}>{val}</Text>
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
                        <TextInput
                            placeholder={(selectedFilterValue ?? []).length === 0 ? (filterType === "role" ? "Type role name..." : "Type organization name...") : ""}
                            value={filterQuery}
                            onChangeText={(t) => {
                              setFilterQuery(t);
                            }}
                            style={styles.inlineSearchInputWithChips}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                      </View>
                      <View style={{ width: "100%", maxHeight: 180 }}>
                        {loadingSuggestions ? (
                            <ActivityIndicator style={{ marginTop: 8 }} />
                        ) : (
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                  const isSelected = Array.isArray(selectedFilterValue) && selectedFilterValue.includes(item);
                                  return (
                                      <TouchableOpacity
                                          onPress={() => {
                                            setSelectedFilterValue((prev) => {
                                              const arr = Array.isArray(prev) ? [...prev] : [];
                                              if (arr.includes(item)) return arr.filter((v) => v !== item);
                                              return [...arr, item];
                                            });
                                          }}
                                          style={[
                                            styles.suggestionRow,
                                            isSelected ? styles.suggestionRowSelected : undefined,
                                          ]}
                                      >
                                        <Text style={isSelected ? { color: "#fff", fontWeight: "700" } : { color: "#222" }}>
                                          {isSelected ? "✓ " : ""}
                                          {item}
                                        </Text>
                                      </TouchableOpacity>
                                  );
                                }}
                                ListEmptyComponent={() => (
                                    <Text style={{ color: "#666", paddingVertical: 8 }}>
                                      No suggestions. Type to search or enter a value.
                                    </Text>
                                )}
                            />
                        )}
                      </View>
                    </>
                )}
                <View style={[styles.modalButtonsContainer, { marginTop: 16 }]}>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeSendModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.primaryAction, { paddingVertical: 12 }]} onPress={confirmSendFromModal}>
                    <Text style={[styles.deleteButtonText, { color: "#fff" }]}>Send Assessment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        )}

        <Toast />
      </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9f6ff" },
  scrollContent: { alignItems: "center", paddingBottom: 40 },
  headerArc: {
    backgroundColor: "#800080",
    width: "100%",
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerText: { color: "#fff", fontSize: 28, fontWeight: "bold", textAlign: "center", letterSpacing: 1 },
  backButton: { position: "absolute", left: 24, top: 0, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)" },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16, width: "100%", maxWidth: 780, gap: 12 },
  searchContainer: { flex: 1 },
  searchBarContainer: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0, padding: 0 },
  searchInputContainer: { backgroundColor: "#fff", borderRadius: 30, borderWidth: 1, borderColor: "#e0d0ef", minHeight: 48 },
  searchInput: { color: "#000", fontSize: 15 },
  addAssessmentBtn: {
    height: 52,
    backgroundColor: "#800080",
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 4
  },
  archiveButton: {
    backgroundColor: "#6c2eb9",
    paddingHorizontal: 16,
  },
  addAssessmentText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14
  },
  listContainer: { width: "100%", maxWidth: 780, paddingHorizontal: 16 },
  testCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginVertical: 10, borderWidth: 1, borderColor: "#efe1fa", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconPill: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f4ebff", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#32174d", flexShrink: 1 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#efe1fa", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  metaText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  cardBody: { marginTop: 8, marginBottom: 16 },

  // --- STYLES FOR DATES (Already added from your last paste) ---
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4ebff',
    paddingTop: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#32174d',
    fontWeight: '600',
    marginTop: 4,
  },
  // ---

  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#6c2eb9", textTransform: "capitalize", letterSpacing: 0.6, marginBottom: 6 },
  rolesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: { backgroundColor: "#f4ebff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  roleChipText: { color: "#4b0082", fontWeight: "600", fontSize: 12 },
  metaMuted: { color: "#666", fontSize: 13 },
  actionsRow: { flexDirection: "column", gap: 10 },
  actionsRowTablet: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, flex: 1, minHeight: 48 },
  primaryAction: { backgroundColor: "#6c2eb9", shadowColor: "#6c2eb9", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  downloadAction: { backgroundColor: "#4b0082" },
  editAction: { backgroundColor: "#40916c" },
  deleteAction: { backgroundColor: "#e53935" },
  secondaryAction: { backgroundColor: "#f4ebff", borderWidth: 1, borderColor: "#e0d0ef" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryText: { color: "#4b0082", fontWeight: "600", fontSize: 14 },
  errorText: { textAlign: "center", color: "#e53935", marginTop: 24, fontWeight: "600" },
  emptyState: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 20, padding: 32, borderWidth: 1, borderColor: "#efe1fa", marginTop: 24 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "700", color: "#32174d" },
  emptySubtitle: { marginTop: 4, textAlign: "center", color: "#6d6d6d" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalBox: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  modalIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff0e1", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#3c1053", marginBottom: 8, textAlign: "center" },
  modalMessage: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  modalButtonsContainer: { flexDirection: "row", gap: 12, width: "100%" },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelButton: { borderWidth: 1, borderColor: "#d0c2e8", backgroundColor: "#f9f6ff" },
  cancelButtonText: { color: "#4b0082", fontWeight: "600" },
  deleteButton: { backgroundColor: "#e53935" },
  deleteButtonText: { color: "#fff", fontWeight: "700" },

  /* send modal specific */
  pillToggle: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e6d9f2", backgroundColor: "#fff" },
  pillToggleActive: { backgroundColor: "#6c2eb9", borderColor: "#6c2eb9" },
  pillToggleText: { color: "#4b0082", fontWeight: "700" },
  pillToggleTextActive: { color: "#fff", fontWeight: "700" },
  inlineSearchInput: { borderWidth: 1, borderColor: "#e6d9f2", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, width: "100%", backgroundColor: "#fff" },
  suggestionRow: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f0e9fb", backgroundColor: "#fff" },
  suggestionRowSelected: { backgroundColor: "#6c2eb9" },

  selectedChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    justifyContent: "flex-start",
  },

  chipsInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6d9f2",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#fff",
    width: "100%",
    minHeight: 46,
  },
  chipsScrollContent: {
    alignItems: "center",
    paddingRight: 8,
  },
  chipsPlaceholder: {
    color: "#999",
    fontSize: 14,
    paddingLeft: 6,
  },
  inlineSearchInputWithChips: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
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

});
