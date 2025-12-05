import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
  StatusBar,
  FlatList,
  Animated,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { SearchBar } from "react-native-elements";
import { useAuthStore } from "@/store/useAuthStore";
import { SnackHost, showSnack } from "@/components/Snack";
import tw from "twrnc";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import MobileDropdown from "@/app/MobileDropdown";
import AdminTabs from "@/components/AdminTabs";
import { Image } from "react-native";

interface User {
  id?: string;
  username?: string;
  email?: string;
  contact?: string | number;
  organization?: string;
  designation?: string;
  role?: string;
  location?: string;
  accessLevel?: number;
}

// The provided Organization interface
interface Organization {
  _id?: string;
  organization?: string;
  spoc?: string;
  spoc_email?: string;
  spoc_contact?: string | number;
  org_location?: string;
  businessUnit?: string;
  industry?: string;
}

const headerPaddingTop = useMemo(() => {
  if (Platform.OS === "ios") return 60;
  return (StatusBar.currentHeight || 24) + 24;
}, []);

export default function UserManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const axiosInstance = useAuthStore((state) => state.axiosInstance);
  const {
    addUser,
    uploadBulkUsers,
    modifyUser,
    deleteUser,
    fetchOrganizations,
    addOrganization,
  } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Modals
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addOrgModalVisible, setAddOrgModalVisible] = useState(false);

  // Country codes data
  const countryCodes = [
    { code: "+91", country: "India (IN)", flag: "🇮🇳" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
  ];

  // Add User Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countryCallingCode, setCountryCallingCode] = useState("+91");
  const [contact, setContact] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [error, setError] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modify Fields
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modUsername, setModUsername] = useState("");
  const [modEmail, setModEmail] = useState("");
  const [modCountryCallingCode, setModCountryCallingCode] = useState("+91");
  const [modContact, setModContact] = useState("");
  const [modOrganization, setModOrganization] = useState("");
  const [modDesignation, setModDesignation] = useState("");
  const [modRole, setModRole] = useState("");
  const [modLocation, setModLocation] = useState("");
  const [modAccessLevel, setModAccessLevel] = useState(1);
  const [modLoading, setModLoading] = useState(false);

  // Delete Fields
  const [delEmail, setDelEmail] = useState("");
  const [delLoading, setDelLoading] = useState(false);

  // Organization Fields
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSuggestions, setOrgSuggestions] = useState<Organization[]>([]);
  const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSpoc, setOrgSpoc] = useState("");
  const [orgSpocEmail, setOrgSpocEmail] = useState("");
  const [orgCountryCallingCode, setOrgCountryCallingCode] = useState("+91");
  const [orgSpocContact, setOrgSpocContact] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [orgLocationSearch, setOrgLocationSearch] = useState("");
  const [showOrgLocationSuggestions, setShowOrgLocationSuggestions] =
    useState(false);
  const [orgBusinessUnit, setOrgBusinessUnit] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [noOrgFound, setNoOrgFound] = useState(false);

  // Location Autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // Organization Location Autocomplete
  const [orgLocationSuggestions, setOrgLocationSuggestions] = useState<
    string[]
  >([]);

  // Popular locations for autocomplete (you can replace this with an API)
  const popularLocations = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Fetch organizations
    const fetchOrgs = async () => {
      const res = await fetchOrganizations();
      if (res.success) {
        setOrganizations(res.data || []);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredUsers(
        users.filter((u) =>
          u.username?.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    } else {
      setFilteredUsers([]);
    }
  }, [search, users]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  // Organization autocomplete
  useEffect(() => {
    if (organization.trim()) {
      const filtered = organizations
        .filter((org) =>
          org.organization?.toLowerCase().includes(organization.toLowerCase()),
        )
        .slice(0, 5);
      setOrgSuggestions(filtered);
      setShowOrgSuggestions(filtered.length > 0);
      setNoOrgFound(filtered.length === 0);
    } else {
      setOrgSuggestions([]);
      setShowOrgSuggestions(false);
      setNoOrgFound(false);
    }
  }, [organization, organizations]);

  // Location autocomplete
  useEffect(() => {
    if (locationSearch.trim()) {
      const filtered = popularLocations
        .filter((loc) =>
          loc.toLowerCase().includes(locationSearch.toLowerCase()),
        )
        .slice(0, 5);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [locationSearch]);

  // Organization location autocomplete
  useEffect(() => {
    if (orgLocationSearch.trim()) {
      const filtered = popularLocations
        .filter((loc) =>
          loc.toLowerCase().includes(orgLocationSearch.toLowerCase()),
        )
        .slice(0, 5);
      setOrgLocationSuggestions(filtered);
      setShowOrgLocationSuggestions(filtered.length > 0);
    } else {
      setOrgLocationSuggestions([]);
      setShowOrgLocationSuggestions(false);
    }
  }, [orgLocationSearch]);

  // === ADD USER ===
  const handleAddUser = async () => {
    if (
      !username ||
      !email ||
      !contact ||
      !organization ||
      !designation ||
      !accessLevel ||
      !location
    ) {
      showSnack("All fields are required");
      return;
    }

    setLoadingAdd(true);
    try {
      // Combine country code with contact
      const fullContact = countryCallingCode + contact;
      const response = await addUser({
        username,
        email,
        contact: fullContact,
        organization,
        designation,
        role: role || undefined,
        accessLevel,
        location,
      });
      if (response.success) {
        showSnack("User added successfully");
        setAddUserModalVisible(false);
        // Reset fields
        setUsername("");
        setEmail("");
        setContact("");
        setOrganization("");
        setDesignation("");
        setRole("");
        setAccessLevel("");
        setLocation("");
        setCountryCallingCode("+91");
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } else {
        showSnack("Failed to add user");
      }
    } catch (err) {
      showSnack("Error adding user");
    } finally {
      setLoadingAdd(false);
    }
  };

  // === ADD ORGANIZATION ===
  const handleAddOrganization = async () => {
    if (!orgName || !orgSpoc || !orgSpocEmail || !orgSpocContact) {
      showSnack("Please fill all required fields");
      return;
    }

    setOrgLoading(true);
    try {
      // Combine country code with contact
      const fullContact = orgCountryCallingCode + orgSpocContact;

      // *** UPDATED PAYLOAD to match Organization interface ***
      const response = await addOrganization({
        organization: orgName,
        spoc: orgSpoc,
        spoc_email: orgSpocEmail, // Changed from email
        spoc_contact: fullContact, // Changed from contact
        org_location: orgLocation || undefined, // Changed from location
        businessUnit: orgBusinessUnit || undefined,
        industry: orgIndustry || undefined,
      });
      // *** END OF UPDATE ***

      if (response.success) {
        showSnack("Organization added successfully");
        setAddOrgModalVisible(false);
        // Reset fields
        setOrgName("");
        setOrgSpoc("");
        setOrgSpocEmail("");
        setOrgSpocContact("");
        setOrgCountryCallingCode("+91");
        setOrgLocation("");
        setOrgLocationSearch("");
        setOrgBusinessUnit("");
        setOrgIndustry("");
        // Refresh organizations
        const res = await fetchOrganizations();
        if (res.success) {
          setOrganizations(res.data || []);
        }
      } else {
        showSnack(response.message || "Failed to add organization");
      }
    } catch (err) {
      showSnack("Error adding organization");
    } finally {
      setOrgLoading(false);
    }
  };

  // === BULK UPLOAD ===
  const handleDownload = async () => {
    const fileUrl =
      "https://raw.githubusercontent.com/sidxdhiman/xcelarate/main/client/assets/format_BulkUpload.xlsx";
    const fileName = "format_BulkUpload.xlsx";
    const downloadUri = FileSystem.documentDirectory + fileName;

    if (Platform.OS === "web") {
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      const result = await FileSystem.downloadAsync(fileUrl, downloadUri);
      Alert.alert("Download Complete", `Saved to: ${result.uri}`);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ],
        copyToCacheDirectory: false, // Recommended for web
      });
      if (!result.assets || result.assets.length === 0) {
        console.log("No file selected or picker was cancelled.");
        return;
      }

      const file = result.assets[0];
      const formData = new FormData();

      if (Platform.OS === "web") {
        // On WEB, we need to append the 'File' object itself.
        // DocumentPicker provides it in `file.file`.
        if (file.file) {
          formData.append("file", file.file as any);
        } else {
          // Fallback: If `file.file` isn't there, fetch the blob from the URI
          const response = await fetch(file.uri);
          const blob = await response.blob();
          formData.append("file", blob, file.name);
        }
      } else {
        // On NATIVE (iOS/Android), we append the special object
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // We hard-code the type
        } as any);
      }

      setBulkLoading(true);
      const uploadResponse = await uploadBulkUsers(formData);

      if (uploadResponse.success) {
        showSnack("Users added successfully");
        // We should also refresh the user list here
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } else {
        showSnack(uploadResponse.message || "Failed to upload users");
      }
    } catch (error: any) {
      console.error("File pick error:", error);
      showSnack(error.message || "Error uploading file");
    } finally {
      setBulkLoading(false);
    }
  };

  // === MODIFY USER ===
  const openModifyModal = (user: User) => {
    setSelectedUser(user);
    setModUsername(user.username || "");
    setModEmail(user.email || "");
    // Extract country code from contact if present
    const contactStr = String(user.contact || "");
    if (contactStr.startsWith("+")) {
      const match = contactStr.match(/^(\+\d{1,3})(.+)$/);
      if (match) {
        setModCountryCallingCode(match[1]);
        setModContact(match[2]);
      } else {
        setModContact(contactStr);
      }
    } else {
      setModContact(contactStr);
    }
    setModOrganization(user.organization || "");
    setModDesignation(user.designation || "");
    setModRole(user.role || "");
    setModLocation(user.location || "");
    setModAccessLevel(user.accessLevel || 1);
    setModifyModalVisible(true);
  };

  const handleModifyUser = async () => {
    if (
      !modUsername ||
      !modContact ||
      !modOrganization ||
      !modDesignation ||
      !modLocation
    ) {
      showSnack("All fields are required");
      return;
    }

    setModLoading(true);
    try {
      const fullContact = modCountryCallingCode + modContact;
      const res = await modifyUser(modEmail, {
        username: modUsername,
        contact: fullContact,
        organization: modOrganization,
        designation: modDesignation,
        role: modRole || undefined,
        location: modLocation,
        accessLevel: modAccessLevel,
      });
      if (res.success) {
        showSnack("User modified successfully");
        setModifyModalVisible(false);
        const refreshed = await axiosInstance.get("/users");
        setUsers(refreshed.data.reverse());
      } else {
        showSnack("Failed to modify user");
      }
    } catch (err) {
      showSnack("Error updating user");
    } finally {
      setModLoading(false);
    }
  };

  // === DELETE USER ===
  const openDeleteModal = (user: User) => {
    setDelEmail(user.email || "");
    setDeleteModalVisible(true);
  };

  const handleDeleteUser = async () => {
    setDelLoading(true);
    try {
      const res = await deleteUser(delEmail);
      if (res.success) {
        showSnack("User flagged successfully");
        setDeleteModalVisible(false);
        const refreshed = await axiosInstance.get("/users");
        setUsers(refreshed.data.reverse());
      } else {
        showSnack("Failed to flag user");
      }
    } catch {
      showSnack("Error flagging user");
    } finally {
      setDelLoading(false);
    }
  };

  // --- FAB SCROLL LOGIC ---
  const [showTabs, setShowTabs] = useState(true);
  const [showFabLabel, setShowFabLabel] = useState(true);
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > 50) {
      setShowTabs(false);

      if (showFabLabel) {
        setShowFabLabel(false);
        Animated.spring(fabScale, {
          toValue: 0.75, // Scale down the FAB button
          useNativeDriver: true,
        }).start();
      }
    } else {
      setShowTabs(true);

      if (!showFabLabel) {
        setShowFabLabel(true);
        Animated.spring(fabScale, {
          toValue: 1, // Scale up the FAB button
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // Adjust bottom position based on AdminTabs visibility
  const fabBottom = showTabs ? 100 : 30;

  return (
    <View style={styles.container}>
      <View style={[styles.headerArc, { paddingTop: headerPaddingTop }]}>
        <Image
          source={require("../assets/images/title-logos/title.png")}
          style={styles.titleLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.inlineButtonsContainer,
            !isMobile && styles.inlineButtonsContainerWeb,
          ]}
        >
          <TouchableOpacity
            style={[styles.inlineButton, { backgroundColor: "#800080" }]}
            onPress={() => setAddUserModalVisible(true)}
          >
            <FontAwesome5 name="user-plus" size={18} color="#fff" />
            <Text style={styles.inlineButtonText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.inlineButton, { backgroundColor: "#9b59b6" }]}
            onPress={() => setBulkModalVisible(true)}
          >
            <FontAwesome5 name="users" size={18} color="#fff" />
            <Text style={styles.inlineButtonText}>Add Bulk Users</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, !isMobile && styles.searchWeb]}>
          <SearchBar
            placeholder="Search users..."
            value={search}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - react-native-elements SearchBar has conflicting type definitions
            onChangeText={handleSearchChange}
            round
            platform="default"
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
        ) : (filteredUsers.length ? filteredUsers : users).length === 0 ? (
          <Text style={styles.noUsersText}>No users found.</Text>
        ) : (
          (filteredUsers.length ? filteredUsers : users).map((user) => (
            <View
              key={user.id}
              style={[styles.card, !isMobile && styles.cardWeb]}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={styles.userName}>{user.username}</Text>
                <View style={tw`flex-row`}>
                  <Pressable
                    onPress={() => openModifyModal(user)}
                    style={tw`mr-4`}
                  >
                    <Feather name="edit" size={20} color="#800080" />
                  </Pressable>
                  <Pressable onPress={() => openDeleteModal(user)}>
                    <Feather name="trash-2" size={20} color="red" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>📧 {user.email}</Text>
                <Text style={styles.infoText}>📞 {user.contact}</Text>
                <Text style={styles.infoText}>🏢 {user.organization}</Text>
                <Text style={styles.infoText}>💼 {user.designation}</Text>
                {user.role && (
                  <Text style={styles.infoText}>👤 Role: {user.role}</Text>
                )}
                <Text style={styles.infoText}>📍 {user.location}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* === Add User Modal === */}
      <Modal
        visible={addUserModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddUserModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setAddUserModalVisible(false);
                    setShowOrgSuggestions(false);
                    setShowLocationSuggestions(false);
                  }}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Personal Information</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Contact Details</Text>

                <View style={styles.contactContainer}>
                  {Platform.OS === "web" ? (
                    <select
                      value={countryCallingCode}
                      onChange={(e) => setCountryCallingCode(e.target.value)}
                      style={styles.countryCodeSelect}
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <View style={styles.countryCodePickerContainer}>
                      <MobileDropdown
                        data={countryCodes.map((item, idx) => ({
                          key: idx,
                          label: `${item.flag} ${item.code}`,
                        }))}
                        initValue={countryCallingCode}
                        onChange={(option) => {
                          const selected = countryCodes.find(
                            (c) => `${c.flag} ${c.code}` === option.label,
                          );
                          if (selected) setCountryCallingCode(selected.code);
                        }}
                      />
                    </View>
                  )}
                  <View
                    style={[styles.inputWrapper, styles.contactInputWrapper]}
                  >
                    <Feather
                      name="phone"
                      size={18}
                      color="#800080"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Contact Number"
                      value={contact}
                      onChangeText={setContact}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Professional Details</Text>

                <View style={styles.orgContainer}>
                  <View style={styles.orgInputRow}>
                    <View style={[styles.inputWrapper, styles.orgInputWrapper]}>
                      <Feather
                        name="briefcase"
                        size={18}
                        color="#800080"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.orgInput]}
                        placeholder="Organization"
                        value={organization}
                        onChangeText={(text: string) => {
                          setOrganization(text);
                          setLocationSearch("");
                        }}
                        onFocus={() => {
                          if (organization.trim()) {
                            setShowOrgSuggestions(true);
                          }
                        }}
                        placeholderTextColor="#999"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.addOrgButton}
                      onPress={() => setAddOrgModalVisible(true)}
                    >
                      <Feather name="plus" size={20} color="#800080" />
                    </TouchableOpacity>
                  </View>
                  {showOrgSuggestions && orgSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {orgSuggestions.map((org, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setOrganization(org.organization || "");
                            setShowOrgSuggestions(false);
                            setNoOrgFound(false);
                          }}
                        >
                          <Feather
                            name="briefcase"
                            size={16}
                            color="#800080"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.suggestionText}>
                            {org.organization || ""}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {noOrgFound && !showOrgSuggestions && (
                    <Text style={{ color: "red", marginTop: 6, fontSize: 13 }}>
                      No organization found. Please add the organization
                      information.
                    </Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="briefcase"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Designation"
                    value={designation}
                    onChangeText={setDesignation}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Role"
                    value={role}
                    onChangeText={setRole}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Access & Location</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="shield"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Access Level (1-5)"
                    value={accessLevel}
                    onChangeText={setAccessLevel}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.helpTextContainer}>
                  <Feather
                    name="info"
                    size={14}
                    color="#666"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.helpText}>
                    Access Level 1 = Admin, 5 = User
                  </Text>
                </View>

                <View style={styles.locationContainer}>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name="map-pin"
                      size={18}
                      color="#800080"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      value={location}
                      onChangeText={(text) => {
                        setLocation(text);
                        setLocationSearch(text);
                      }}
                      onFocus={() => {
                        if (location.trim()) {
                          setShowLocationSuggestions(true);
                        }
                      }}
                      placeholderTextColor="#999"
                    />
                  </View>
                  {showLocationSuggestions &&
                    locationSuggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        {locationSuggestions.map((loc, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setLocation(loc);
                              setLocationSearch("");
                              setShowLocationSuggestions(false);
                            }}
                          >
                            <Feather
                              name="map-pin"
                              size={16}
                              color="#800080"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.suggestionText}>{loc}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, styles.modalActionBtn]}
                  onPress={() => {
                    setAddUserModalVisible(false);
                    setShowOrgSuggestions(false);
                    setShowLocationSuggestions(false);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, styles.modalActionBtn]}
                  onPress={handleAddUser}
                  disabled={loadingAdd}
                >
                  {loadingAdd ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name="user-plus"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.submitBtnText}>Add User</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* === Bulk Upload Modal === */}
      <Modal
        visible={bulkModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBulkModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.modalScrollContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upload Bulk Users</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setBulkModalVisible(false)}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.bulkUploadContent}>
                <View style={styles.bulkUploadInfo}>
                  <Feather
                    name="info"
                    size={20}
                    color="#800080"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.bulkUploadInfoText}>
                    Download the format file, fill in user details, and upload
                    it here.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.bulkActionBtn, styles.downloadBtn]}
                  onPress={handleDownload}
                >
                  <Feather
                    name="download"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.bulkActionBtnText}>Download Format</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bulkActionBtn, styles.uploadBtn]}
                  onPress={handleFilePick}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name="upload"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.bulkActionBtnText}>Upload File</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, styles.modalActionBtn]}
                  onPress={() => setBulkModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* === Modify User Modal === */}
      <Modal
        visible={modifyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModifyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Modify User</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModifyModalVisible(false)}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Personal Information</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={modUsername}
                    onChangeText={setModUsername}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    placeholder="Email"
                    value={modEmail}
                    editable={false}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Contact Details</Text>

                <View style={styles.contactContainer}>
                  {Platform.OS === "web" ? (
                    <select
                      value={modCountryCallingCode}
                      onChange={(e) => setModCountryCallingCode(e.target.value)}
                      style={styles.countryCodeSelect}
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <View style={styles.countryCodePickerContainer}>
                      <MobileDropdown
                        data={countryCodes.map((item, idx) => ({
                          key: idx,
                          label: `${item.flag} ${item.code}`,
                        }))}
                        initValue={modCountryCallingCode}
                        onChange={(option) => {
                          const selected = countryCodes.find(
                            (c) => `${c.flag} ${c.code}` === option.label,
                          );
                          if (selected) setModCountryCallingCode(selected.code);
                        }}
                      />
                    </View>
                  )}
                  <View
                    style={[styles.inputWrapper, styles.contactInputWrapper]}
                  >
                    <Feather
                      name="phone"
                      size={18}
                      color="#800080"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Contact Number"
                      value={modContact}
                      onChangeText={setModContact}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Professional Details</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="briefcase"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Organization"
                    value={modOrganization}
                    onChangeText={setModOrganization}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="briefcase"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Designation"
                    value={modDesignation}
                    onChangeText={setModDesignation}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Role"
                    value={modRole}
                    onChangeText={setModRole}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Access & Location</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="shield"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Access Level (1-5)"
                    value={String(modAccessLevel)}
                    onChangeText={(v) => setModAccessLevel(Number(v) || 1)}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.helpTextContainer}>
                  <Feather
                    name="info"
                    size={14}
                    color="#666"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.helpText}>
                    Access Level 1 = Admin, 5 = User
                  </Text>
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="map-pin"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={modLocation}
                    onChangeText={setModLocation}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, styles.modalActionBtn]}
                  onPress={() => setModifyModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, styles.modalActionBtn]}
                  onPress={handleModifyUser}
                  disabled={modLoading}
                >
                  {modLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name="save"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.submitBtnText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* === Delete User Modal === */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Flag User</Text>
            <TextInput value={delEmail} editable={false} style={styles.input} />
            <Text style={styles.warningText}>
              Are you sure you want to flag this user? This action cannot be
              undone.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: "red" }]}
              onPress={handleDeleteUser}
              disabled={delLoading}
            >
              <Text style={styles.submitBtnText}>
                {delLoading ? "Flagging..." : "Flag User"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* === Add Organization Modal === */}
      <Modal
        visible={addOrgModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddOrgModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Organization</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setAddOrgModalVisible(false);
                    setShowOrgLocationSuggestions(false);
                  }}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Organization Details</Text>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="briefcase"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Organization Name *"
                    value={orgName}
                    onChangeText={setOrgName}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="SPOC Name *"
                    value={orgSpoc}
                    onChangeText={setOrgSpoc}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="SPOC Email *"
                    value={orgSpocEmail}
                    onChangeText={setOrgSpocEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.contactContainer}>
                  {Platform.OS === "web" ? (
                    <select
                      value={orgCountryCallingCode}
                      onChange={(e) => setOrgCountryCallingCode(e.target.value)}
                      style={styles.countryCodeSelect}
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <View style={styles.countryCodePickerContainer}>
                      <MobileDropdown
                        data={countryCodes.map((item, idx) => ({
                          key: idx,
                          label: `${item.flag} ${item.code}`,
                        }))}
                        initValue={orgCountryCallingCode}
                        onChange={(option) => {
                          const selected = countryCodes.find(
                            (c) => `${c.flag} ${c.code}` === option.label,
                          );
                          if (selected) setOrgCountryCallingCode(selected.code);
                        }}
                      />
                    </View>
                  )}
                  <View
                    style={[styles.inputWrapper, styles.contactInputWrapper]}
                  >
                    <Feather
                      name="phone"
                      size={18}
                      color="#800080"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="SPOC Contact *"
                      value={orgSpocContact}
                      onChangeText={setOrgSpocContact}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Additional Information</Text>

                <View style={styles.locationContainer}>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name="map-pin"
                      size={18}
                      color="#800080"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      value={orgLocation}
                      onChangeText={(text) => {
                        setOrgLocation(text);
                        setOrgLocationSearch(text);
                      }}
                      onFocus={() => {
                        if (orgLocation.trim()) {
                          setShowOrgLocationSuggestions(true);
                        }
                      }}
                      placeholderTextColor="#999"
                    />
                  </View>
                  {showOrgLocationSuggestions &&
                    orgLocationSuggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        {orgLocationSuggestions.map((loc, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setOrgLocation(loc);
                              setOrgLocationSearch("");
                              setShowOrgLocationSuggestions(false);
                            }}
                          >
                            <Feather
                              name="map-pin"
                              size={16}
                              color="#800080"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.suggestionText}>{loc}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="layers"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Business Unit"
                    value={orgBusinessUnit}
                    onChangeText={setOrgBusinessUnit}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="briefcase"
                    size={18}
                    color="#800080"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Industry"
                    value={orgIndustry}
                    onChangeText={setOrgIndustry}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, styles.modalActionBtn]}
                  onPress={() => {
                    setAddOrgModalVisible(false);
                    setShowOrgLocationSuggestions(false);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, styles.modalActionBtn]}
                  onPress={handleAddOrganization}
                  disabled={orgLoading}
                >
                  {orgLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name="plus"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.submitBtnText}>Add Organization</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AdminTabs />
      <SnackHost />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f6ff" },
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
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingTop: 15,
  },
  scrollContent: { paddingBottom: 40 },
  inlineButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  inlineButtonsContainerWeb: { width: 700, justifyContent: "space-between" },
  inlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    gap: 8,
  },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 10 }, // Adjusted padding for main content
  // REMOVED: inlineButtonsContainer and inlineButtonsContainerWeb styles
  // REMOVED: inlineButton and inlineButtonText styles
  searchContainer: { marginVertical: 10, marginHorizontal: 2 }, // Adjusted margin
  searchWeb: { alignSelf: "center", width: 700 },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  searchInput: { color: "#000" },
  noUsersText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0e6fa",
  },
  cardWeb: { width: 700, alignSelf: "center" },
  userName: { fontSize: 18, fontWeight: "700", color: "#4b0082" },
  infoBox: { marginTop: 6 },
  infoText: { color: "#333", fontSize: 14, marginBottom: 3 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 0,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  modalScrollContent: {
    padding: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4b0082",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#800080",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  warningText: {
    color: "red",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    flex: 1,
    color: "#000",
    fontSize: 15,
    paddingVertical: 0,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  contactInputWrapper: {
    flex: 1,
    marginVertical: 0,
    minWidth: 0,
  },
  countryCodeSelect: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 14,
    minWidth: 110,
    maxWidth: 120,
    flexShrink: 0,
  },
  countryCodePickerContainer: {
    width: 110,
    maxWidth: 120,
    flexShrink: 0,
  },
  orgContainer: {
    position: "relative",
    marginBottom: 8,
  },
  orgInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  orgInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orgInputWrapper: {
    flex: 1,
    marginVertical: 0,
  },
  orgInput: {
    flex: 1,
  },
  addOrgButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#800080",
    backgroundColor: "#f9f6ff",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  locationContainer: {
    position: "relative",
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
  helpTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 4,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitBtn: {
    backgroundColor: "#800080",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelBtnText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  bulkUploadContent: {
    paddingVertical: 8,
  },
  bulkUploadInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9f6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  bulkUploadInfoText: {
    flex: 1,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  bulkActionBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  downloadBtn: {
    backgroundColor: "#9b59b6",
  },
  uploadBtn: {
    backgroundColor: "#800080",
  },
  bulkActionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  titleLogo: {
    width: 280,
    height: 25,
    marginTop: 0,
  },
});
