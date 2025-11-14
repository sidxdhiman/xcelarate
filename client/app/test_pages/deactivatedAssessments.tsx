import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert, // Keep this import for the error alert
} from 'react-native';
import { useAuthStore } from "@/store/useAuthStore";
import { useAssessmentStore } from "@/store/useAssessmentStore"; // Import Assessment store
import { router } from 'expo-router';
import Icon from "react-native-vector-icons/FontAwesome"; // Import Icon

// 1. Updated Interface
interface Assessment {
  _id: string;
  title: string;
  roles: string[]; // For the roles list
  questions: any[];  // For the question count
}

const DeactivatedAssessmentsScreen: React.FC = () => {
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Get functions from your store
  const activateAssessmentById = useAssessmentStore((s) => s.activateAssessmentById);
  const fetchDeactivatedFromStore = useAssessmentStore((s) => s.fetchDeactivatedAssessments);

  const fetchDeactivatedAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, data } = await fetchDeactivatedFromStore();
      if (success) {
        setAssessments(data.reverse()); // Show newest first
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

  // --- 3. This is the FINAL, WORKING Reactivate function ---
  // It removes the confirmation alert that was not working.
  const handleReactivate = async (id: string) => {
    
    // 1. We call the store function directly.
    //    The store will show the "Failed to activate" toast if this fails.
    const success = await activateAssessmentById(id);
    
    // 2. The store ALREADY shows the "Assessment activated" toast (your request #1)
    
    // 3. If it was successful, we remove the item from this list (your request #2)
    if (success) {
      setAssessments((prev) => prev.filter(a => a._id !== id));
    }
    // When you go back to the main list, it will be there after a refresh.
  };

  // --- 4. This is the FINAL renderItem ---
  const renderItem = ({ item }: { item: Assessment }) => (
    <View style={styles.testCard}>
      {/* Card Header */}
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

      {/* Card Body (with Roles) */}
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

      {/* Card Actions (Reactivate Button) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.reactivateAction]} 
          // This now calls the final, working function
          onPress={() => handleReactivate(item._id)} 
        >
          <Icon name="check" size={16} color="#fff" />
          <Text style={styles.actionText}>Reactivate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // (The rest of the file is unchanged and correct)
  // ...
  // This component is shown if the assessments array is empty
  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Icon name="archive" size={30} color="#c2a2e2" />
      <Text style={styles.emptyTitle}>Archive is Empty</Text>
      <Text style={styles.emptySubtitle}>No deactivated assessments found.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#800080" />
        <Text style={styles.emptyText}>Loading archived tests...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={[styles.emptyText, { color: 'red' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={18} color="#800080" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deactivated Assessments</Text>
      </View>

      <FlatList
        data={assessments}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchDeactivatedAssessments}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

// --- 5. Stylesheet (with all card styles) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#f9f6ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#efe1fa',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#32174d',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 16,
  },
  // --- Card Styles (copied from test_management) ---
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
  // --- Roles Styles ---
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
  // --- Action Button Styles ---
  actionsRow: { 
    flexDirection: "row", 
    gap: 10,
    marginTop: 10,
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
  reactivateAction: {
    backgroundColor: "#40916c", // Green "go" color
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