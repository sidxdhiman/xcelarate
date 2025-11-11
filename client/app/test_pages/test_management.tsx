import React, { useEffect, useMemo, useState, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SnackHost, showSnack } from '@/components/Snack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

type Assessment = {
  _id: string;
  title: string;
  roles: string[];
  questions: { text: string; options: { text: string }[] }[];
};

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const iconSize = isTablet ? 22 : 20;

const TestManagement = () => {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filteredTests, setFilteredTests] = useState<Assessment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Assessment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- New state for Send modal / filter UI ---
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [filterType, setFilterType] = useState<'role' | 'organisation' | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const axiosInstance = useAuthStore((state) => state.axiosInstance);
  const deleteAssessmentById = useAssessmentStore((state) => state.deleteAssessmentById);

  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === 'ios') return 60;
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get('/assessments');
        setTests(res.data.reverse());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredTests(
        tests.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.roles?.some((r) => r.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredTests([]);
    }
  }, [search, tests]);

  const displayTests = search ? filteredTests : tests;

  const confirmDelete = async () => {
    if (!testToDelete) return;
    try {
      const confirmed = await deleteAssessmentById(testToDelete._id);
      if (confirmed) {
        setTests((prev) => prev.filter((t) => t._id !== testToDelete._id));
        showSnack('Assessment deleted successfully');
      } else {
        showSnack('Failed to delete assessment');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showSnack('Something went wrong while deleting');
    } finally {
      setModalVisible(false);
      setTestToDelete(null);
    }
  };

  const sanitizeFileName = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'assessment';

  const handleDownloadResponses = async (assessment: Assessment) => {
    try {
      setDownloadingId(assessment._id);
      const { data } = await axiosInstance.get(`/assessments/${assessment._id}/responses`);

      if (!data || !Array.isArray(data) || data.length === 0) {
        showSnack('No responses yet for this assessment');
        return;
      }

      const formatted = data.map((resp: any, index: number) => {
        const answerEntries = Object.entries(resp.answers || {}).reduce(
          (acc: Record<string, string>, [questionKey, answer]: [string, any]) => {
            const value =
              answer?.option ??
              answer?.text ??
              (typeof answer === 'string' ? answer : '');
            acc[questionKey] = value || '';
            return acc;
          },
          {}
        );

        return {
          '#': index + 1,
          Name: resp.user?.name || 'Anonymous',
          Email: resp.user?.email || '',
          Designation: resp.user?.designation || '',
          SubmittedAt: resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : '',
          ...answerEntries,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

      const fileName = `${sanitizeFileName(assessment.title)}-responses.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        const baseDir =
          (FileSystem.cacheDirectory ||
            FileSystem.documentDirectory ||
            (FileSystem as any).temporaryDirectory ||
            '') as string;

        if (!baseDir) {
          showSnack('Unable to access storage. Could not determine a directory.');
          return;
        }

        const fileUri = `${baseDir}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: 'base64',
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          showSnack(`Responses saved to: ${fileUri}`);
        }
      }

      showSnack('Responses exported successfully');
    } catch (error) {
      console.error('Download responses error:', error);
      showSnack('Failed to export responses');
    } finally {
      setDownloadingId(null);
    }
  };

  // Original send function kept, but now accepts explicit filter type/value.
  const handleSendAssessment = async (
    assessment: Assessment,
    filterTypeParam?: 'role' | 'organisation',
    filterValueParam?: string
  ): Promise<boolean> => {
    const roleFallback = assessment.roles?.[0];
    const type = filterTypeParam ?? 'role';
    const value = filterValueParam ?? roleFallback;

    if (!value) {
      showSnack('Add at least one role or choose a filter value to send the assessment');
      return false;
    }

    const payload = {
      assessmentId: assessment._id,
      filterType: type,
      filterValue: value,
    } as const;

    if (!axiosInstance) {
      console.warn('[SEND] no axiosInstance available');
      showSnack('Unable to send assessment (no network client).');
      return false;
    }

    try {
      console.log('[SEND] POST /assessments/send', payload);
      const res = await axiosInstance.post('/assessments/send', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[SEND OK]', res.status, res.data);
      showSnack('Assessment send initiated');
      return true;
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const serverMsg = data?.message || data?.error || null;
      const fallbackMsg = err?.message || 'Unknown error';

      console.warn('[SEND FAIL]', {
        status,
        data,
        url: err?.config?.url,
        method: err?.config?.method,
        payload,
      });

      if (status === 400 && serverMsg && /no users found/i.test(serverMsg)) {
        showSnack('No users found for that role — check roles or user data.');
      } else if (serverMsg) {
        showSnack(`Failed to send: ${serverMsg}`);
      } else {
        showSnack(`Failed to send: ${status ?? ''} ${fallbackMsg}`);
      }

      return false;
    }
  };

  // Show the Send modal and set the active assessment
  const openSendModal = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setFilterType(null);
    setFilterQuery('');
    setSuggestions([]);
    setSelectedFilterValue(null);
    setSendModalVisible(true);
  };

  // Close and clear
  const closeSendModal = () => {
    setSendModalVisible(false);
    setActiveAssessment(null);
    setFilterType(null);
    setFilterQuery('');
    setSuggestions([]);
    setSelectedFilterValue(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  // Fetch suggestions based on filterType + query (debounced)
  useEffect(() => {
    if (!filterType) {
      setSuggestions([]);
      return;
    }

    if (!filterQuery || filterQuery.trim().length === 0) {
      // If user cleared query, optionally show some top suggestions:
      // Try to supply quick suggestions: for role, use roles from the assessment if available.
      if (filterType === 'role' && activeAssessment?.roles?.length) {
        setSuggestions(activeAssessment.roles.slice(0, 6));
      } else {
        setSuggestions([]);
      }
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = (setTimeout(async () => {
      try {
        let resp = null;
        if (axiosInstance) {
          try {
            resp = await axiosInstance.get('/search/filters', {
              params: { type: filterType, q: filterQuery.trim() },
            });
          } catch (e1: any) {
            // fallback to specific endpoints; tolerate 404s
            try {
              if (filterType === 'role') {
                resp = await axiosInstance.get('/roles', { params: { q: filterQuery.trim() } });
              } else {
                // backend might use british spelling 'organisations'
                try {
                  resp = await axiosInstance.get('/organisations', { params: { q: filterQuery.trim() } });
                } catch (orgErr: any) {
                  if (orgErr?.response?.status === 404) {
                    resp = await axiosInstance.get('/organizations', { params: { q: filterQuery.trim() } });
                  } else {
                    throw orgErr;
                  }
                }
              }
            } catch (e2) {
              resp = null;
            }
          }
        }

        let items: string[] = [];
        if (resp && resp.data) {
          if (Array.isArray(resp.data)) {
            items = resp.data
              .map((it: any) => (typeof it === 'string' ? it : it.name || it.title || it.value))
              .filter(Boolean);
          } else if (Array.isArray(resp.data.items)) {
            items = resp.data.items.map((it: any) => it.name || it.title || it.value).filter(Boolean);
          }
        }

        // Fallback: if searching roles, use roles from active assessment or from loaded tests
        if ((!items || items.length === 0) && filterType === 'role') {
          const pool = new Set<string>();
          activeAssessment?.roles?.forEach((r) => pool.add(r));
          tests.forEach((t) => t.roles?.forEach((r) => pool.add(r)));
          items = Array.from(pool).filter((r) =>
            r.toLowerCase().includes(filterQuery.trim().toLowerCase())
          );
        }

        setSuggestions(items.slice(0, 25));
      } catch (err) {
        console.warn('Suggestion fetch failed', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
        debounceRef.current = null;
      }
    }, 350) as unknown) as number;

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
      showSnack('Choose a filter type (Role or organisation)');
      return;
    }
    if (!selectedFilterValue) {
      showSnack('Select a role or organisation from suggestions');
      return;
    }

    // call the send function
    const ok = await handleSendAssessment(activeAssessment, filterType, selectedFilterValue);
    if (ok) {
      closeSendModal();
    }
  };

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
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - react-native-elements SearchBar has conflicting type definitions
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/test_pages/addTest')} style={styles.addAssessmentBtn}>
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
                <Text style={styles.emptyTitle}>No Assessments yet</Text>
                <Text style={styles.emptySubtitle}>Create your first assessment to start tracking responses.</Text>
              </View>
            ) : (
              displayTests.map((test) => (
                <View key={test._id} style={styles.testCard}>
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
                        <Text style={styles.metaMuted}>No roles assigned</Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.actionsRow, isTablet ? styles.actionsRowTablet : undefined]}>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={() => openSendModal(test)}>
                      <Icon name="paper-plane" size={16} color="#fff" />
                      <Text style={styles.actionText}>Send</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.downloadAction]}
                      onPress={() => handleDownloadResponses(test)}
                      disabled={downloadingId === test._id}
                    >
                      {downloadingId === test._id ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={16} color="#fff" />}
                      <Text style={styles.actionText}>Download Responses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.editAction]}
                      onPress={() =>
                        router.push({
                          pathname: '/test_pages/modifyTest',
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
                        setTestToDelete(test);
                        setModalVisible(true);
                      }}
                    >
                      <Icon name="trash" size={16} color="#fff" />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Delete Confirmation Modal */}
      {modalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrapper}>
              <Icon name="trash" size={26} color="#e53935" />
            </View>
            <Text style={styles.modalTitle}>Delete assessment?</Text>
            <Text style={styles.modalMessage}>
              This will permanently remove "{testToDelete?.title}". You cannot undo this action.
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Send Modal */}
      {sendModalVisible && activeAssessment && (
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 700 }]}>
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Send "{activeAssessment.title}"</Text>

            <Text style={{ marginBottom: 8, color: '#444', fontWeight: '600' }}>Choose filter type</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setFilterType('role');
                  setSelectedFilterValue(null);
                  setFilterQuery('');
                }}
                style={[styles.pillToggle, filterType === 'role' ? styles.pillToggleActive : undefined]}
              >
                <Text style={filterType === 'role' ? styles.pillToggleTextActive : styles.pillToggleText}>By Role</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFilterType('organisation');
                  setSelectedFilterValue(null);
                  setFilterQuery('');
                }}
                style={[styles.pillToggle, filterType === 'organisation' ? styles.pillToggleActive : undefined]}
              >
                <Text style={filterType === 'organisation' ? styles.pillToggleTextActive : styles.pillToggleText}>By organisation</Text>
              </TouchableOpacity>
            </View>

            {filterType && (
              <>
                <Text style={{ color: '#444', marginBottom: 6, fontWeight: '600' }}>Search {filterType === 'role' ? 'role' : 'organisation'}</Text>

                <View style={{ width: '100%', marginBottom: 8 }}>
                  <TextInput
                    placeholder={filterType === 'role' ? 'Type role name...' : 'Type organisation name...'}
                    value={filterQuery}
                    onChangeText={(t) => {
                      setFilterQuery(t);
                      setSelectedFilterValue(null);
                    }}
                    style={styles.inlineSearchInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ width: '100%', maxHeight: 180 }}>
                  {loadingSuggestions ? (
                    <ActivityIndicator style={{ marginTop: 8 }} />
                  ) : (
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => {
                        const isSelected = selectedFilterValue === item;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedFilterValue(item);
                              setFilterQuery(item);
                            }}
                            style={[styles.suggestionRow, isSelected ? styles.suggestionRowSelected : undefined]}
                          >
                            <Text style={isSelected ? { color: '#fff', fontWeight: '700' } : { color: '#222' }}>{item}</Text>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={() => (
                        <Text style={{ color: '#666', paddingVertical: 8 }}>No suggestions. Type to search or enter a value.</Text>
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
                <Text style={[styles.deleteButtonText, { color: '#fff' }]}>Send Assessment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <SnackHost />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9f6ff' },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerArc: {
    backgroundColor: '#800080',
    width: '100%',
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 780,
    gap: 12,
  },
  searchContainer: { flex: 1 },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e0d0ef',
    minHeight: 48,
  },
  searchInput: {
    color: '#000',
    fontSize: 15,
  },
  addAssessmentBtn: {
    height: 52,
    backgroundColor: '#800080',
    borderRadius: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#800080',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addAssessmentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listContainer: {
    width: '100%',
    maxWidth: 780,
    paddingHorizontal: 16,
  },
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#efe1fa',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f4ebff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#32174d',
    flexShrink: 1,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#efe1fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: {
    color: '#4b0082',
    fontWeight: '600',
    fontSize: 12,
  },
  cardBody: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c2eb9',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    backgroundColor: '#f4ebff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleChipText: {
    color: '#4b0082',
    fontWeight: '600',
    fontSize: 12,
  },
  metaMuted: {
    color: '#666',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 10,
  },
  actionsRowTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    minHeight: 48,
  },
  primaryAction: {
    backgroundColor: '#6c2eb9',
    shadowColor: '#6c2eb9',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  downloadAction: {
    backgroundColor: '#4b0082',
  },
  editAction: {
    backgroundColor: '#40916c',
  },
  deleteAction: {
    backgroundColor: '#e53935',
  },
  secondaryAction: {
    backgroundColor: '#f4ebff',
    borderWidth: 1,
    borderColor: '#e0d0ef',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryText: {
    color: '#4b0082',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: '#e53935',
    marginTop: 24,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#efe1fa',
    marginTop: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#32174d',
  },
  emptySubtitle: {
    marginTop: 4,
    textAlign: 'center',
    color: '#6d6d6d',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fdecea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3c1053',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#d0c2e8',
    backgroundColor: '#f9f6ff',
  },
  cancelButtonText: { color: '#4b0082', fontWeight: '600' },
  deleteButton: { backgroundColor: '#e53935' },
  deleteButtonText: { color: '#fff', fontWeight: '700' },

  // New styles for send modal
  pillToggle: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6d9f2',
    backgroundColor: '#fff',
  },
  pillToggleActive: {
    backgroundColor: '#6c2eb9',
    borderColor: '#6c2eb9',
  },
  pillToggleText: {
    color: '#4b0082',
    fontWeight: '700',
  },
  pillToggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  inlineSearchInput: {
    borderWidth: 1,
    borderColor: '#e6d9f2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
    backgroundColor: '#fff',
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e9fb',
    backgroundColor: '#fff',
  },
  suggestionRowSelected: {
    backgroundColor: '#6c2eb9',
  },
});

export default TestManagement;
