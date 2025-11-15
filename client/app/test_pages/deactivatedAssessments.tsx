import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuthStore } from "@/store/useAuthStore";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { router } from 'expo-router';
import Icon from "react-native-vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// 1. Updated Interface
interface Assessment {
  _id: string;
  title: string;
  roles: string[];
  questions: any[];
}

// Get tablet dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const DeactivatedAssessmentsScreen: React.FC = () => {

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const axiosInstance = useAuthStore((s) => s.axiosInstance);
  const activateAssessmentById = useAssessmentStore((s) => s.activateAssessmentById);
  const fetchDeactivatedFromStore = useAssessmentStore((s) => s.fetchDeactivatedAssessments);

  // Calculates padding for the header arc
  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 60;
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  // (fetchDeactivatedAssessments is unchanged)
  const fetchDeactivatedAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, data } = await fetchDeactivatedFromStore();
      if (success) {
        setAssessments(data.reverse());
      } else {
        setError("Could not load assessments.");
      }
    } catch (err) {
      console.error("Failed to fetch deactivated assessments:", err);
      setError("Could not load assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeactivatedAssessments();
  }, []);

  // (handleReactivate is unchanged)
  const handleReactivate = async (id: string) => {
    const success = await activateAssessmentById(id);
    if (success) {
      setAssessments((prev) => prev.filter(a => a._id !== id));
      Toast.show({ type: "success", text1: "Assessment Activated" });
    }
  };

  // (handleDownloadResponses is unchanged)
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

  // (renderItem is unchanged)
  const renderItem = ({ item }: { item: Assessment }) => (
      <View style={styles.testCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.iconPill}>
              <Icon name="file-text-o" size={16} color="#800080" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <View style={styles.metaPill}>
            <Icon name="question-circle" size={12} color="#800080" />
            <Text style={styles.metaText}>{item.questions?.length || 0} questions</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.sectionLabel}>Applicable Roles</Text>
          <View style={styles.rolesContainer}>
            {item.roles?.length ? (
                item.roles.map((role) => (
                    <View key={role} style={styles.roleChip}>
                      <Text style={styles.roleChipText}>{role}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.metaMuted}>No Roles Assigned</Text>
            )}
          </View>
        </View>
        <View style={[styles.actionsRow, isTablet ? styles.actionsRowTablet : undefined]}>
          <TouchableOpacity
              style={[styles.actionButton, styles.downloadAction]}
              onPress={() => handleDownloadResponses(item)}
              disabled={downloadingId === item._id}
          >
            {downloadingId === item._id ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <Icon name="download" size={16} color="#fff" />
            )}
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.actionButton, styles.editAction]}
              onPress={() => router.push({ pathname: "/test_pages/modifyTest", params: { id: item._id } })}
          >
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.actionButton, styles.reactivateAction]}
              onPress={() => handleReactivate(item._id)}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.actionText}>Reactivate</Text>
          </TouchableOpacity>
        </View>
      </View>
  );

  // (renderEmptyList is unchanged)
  const renderEmptyList = () => (
      <View style={styles.emptyState}>
        <Icon name="archive" size={30} color="#c2a2e2" />
        <Text style={styles.emptyTitle}>Archive is Empty</Text>
        <Text style={styles.emptySubtitle}>No deactivated assessments found.</Text>
      </View>
  );

  // (Loading/Error checks are unchanged)
  if (loading) {
    return (
        <View style={[styles.screen, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#800080" />
          <Text style={styles.emptyText}>Loading archived tests...</Text>
        </View>
    );
  }
  if (error) {
    return (
        <View style={[styles.screen, styles.loadingContainer]}>
          <Text style={[styles.emptyText, { color: 'red' }]}>{error}</Text>
        </View>
    );
  }

  // --- Main return block (UPDATED) ---
  return (
      <View style={styles.screen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        {/* Header Arc (Back button REMOVED) */}
        <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
          <Text style={styles.headerText}>DEACTIVATED ASSESSMENTS</Text>
        </View>

        <View style={styles.listContainer}>
          <FlatList
              data={assessments}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={renderEmptyList}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchDeactivatedAssessments}
              refreshing={loading}
          />
        </View>
        <Toast />
      </View>
  );
};

// --- Stylesheet (UPDATED) ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9f6ff"
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f6ff',
  },
  headerArc: {
    backgroundColor: "#800080",
    width: "100%",
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1
  },
  // --- backButton style REMOVED ---
  listContainer: {
    width: "100%",
    maxWidth: 780,
    paddingHorizontal: 16,
    flex: 1,
    alignSelf: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 16,
  },
  testCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#efe1fa",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f4ebff",
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#32174d",
    flexShrink: 1
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#efe1fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  metaText: {
    color: "#4b0082",
    fontWeight: "600",
    fontSize: 12
  },
  cardBody: {
    marginTop: 8,
    marginBottom: 16
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6c2eb9",
    textTransform: "capitalize",
    letterSpacing: 0.6,
    marginBottom: 6
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  roleChip: {
    backgroundColor: "#f4ebff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  roleChipText: {
    color: "#4b0082",
    fontWeight: "600",
    fontSize: 12
  },
  metaMuted: {
    color: "#666",
    fontSize: 13
  },
  actionsRow: {
    flexDirection: "column",
    gap: 10
  },
  actionsRowTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    minHeight: 48
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
  downloadAction: {
    backgroundColor: "#4b0082"
  },
  editAction: {
    backgroundColor: "#40916c"
  },
  reactivateAction: {
    backgroundColor: "#6c2eb9",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "#efe1fa",
    marginTop: 24
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#32174d"
  },
  emptySubtitle: {
    marginTop: 4,
    textAlign: "center",
    color: "#6d6d6d"
  },
});

export default DeactivatedAssessmentsScreen;