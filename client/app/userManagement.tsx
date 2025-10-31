import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Toast from "react-native-toast-message";
import tw from "twrnc";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy"; // use legacy

export default function UserManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const axiosInstance = useAuthStore((state) => state.axiosInstance);
  const { addUser, uploadBulkUsers } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Modals
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);

  // Add User Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [designation, setDesignation] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];

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
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredUsers(
          users.filter((u) =>
              u.username?.toLowerCase().includes(search.toLowerCase())
          )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [search, users]);

  const openModifyPage = (user) => {
    const query = Object.entries(user)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join("&");
    router.push(`/user_pages/modifyUser?${query}`);
  };

  // ✅ FIXED ADD USER LOGIC
  const handleAddUser = async () => {
    if (
        !username ||
        !email ||
        !contact ||
        !organisation ||
        !designation ||
        !accessLevel ||
        !location
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required!",
      });
      return;
    }

    setError("");
    setLoadingAdd(true);
    const userData = {
      username,
      email,
      contact,
      organisation,
      designation,
      accessLevel,
      location,
    };

    try {
      let response;

      if (typeof addUser === "function") {
        response = await addUser(userData);
      } else {
        // fallback if addUser isn't available
        const res = await axiosInstance.post("/users", userData);
        response = { success: res.status === 200 || res.status === 201 };
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "User added successfully!",
          text2: "User has been added to the database.",
        });
        setAddUserModalVisible(false);

        // clear fields
        setUsername("");
        setEmail("");
        setContact("");
        setOrganisation("");
        setDesignation("");
        setAccessLevel("");
        setLocation("");

        // refresh user list
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } else {
        Toast.show({
          type: "error",
          text1: "Failed!",
          text2: "Failed to add user. Please try again.",
        });
      }
    } catch (err) {
      console.error("Add User Error:", err);
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "An error occurred while adding user.",
      });
    } finally {
      setLoadingAdd(false);
    }
  };

  // ✅ BULK UPLOAD LOGIC (unchanged)
  const handleDownload = async () => {
    const fileUrl =
        "https://raw.githubusercontent.com/sidxdhiman/xcelarate/main/client/assets/format_BulkUpload.xlsx";
    const fileName = "format_BulkUpload.xlsx";
    const downloadUri = FileSystem.documentDirectory + fileName;

    if (Platform.OS === "web") {
      try {
        const anchor = document.createElement("a");
        anchor.href = fileUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } catch (err) {
        console.error("Web download error:", err);
        Alert.alert("Download Failed", "Could not download file on web.");
      }
    } else {
      try {
        const result = await FileSystem.downloadAsync(fileUrl, downloadUri);
        Alert.alert("Download Complete", `Saved to: ${result.uri}`);
      } catch (err) {
        console.error("Native download error:", err);
        Alert.alert("Download Failed", "Could not download file on device.");
      }
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      setBulkLoading(true);

      let fileData;
      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append("file", blob, file.name);
        fileData = formData;
      } else {
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type:
              file.mimeType ||
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        fileData = formData;
      }

      const uploadResponse = await uploadBulkUsers(fileData);
      setBulkLoading(false);

      if (uploadResponse?.success) {
        Toast.show({
          type: "success",
          text1: "Users Added Successfully!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to upload users!",
        });
      }
    } catch (error) {
      console.error("File picking/upload error:", error);
      setBulkLoading(false);
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Failed to upload file!",
      });
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerArc}>
          <View style={tw`absolute top-4 left-4 z-10 flex-row items-center gap-4`}>
            <Pressable onPress={() => router.push("/landing")}>
              <Icon name="arrow-left" size={22} color="white" />
            </Pressable>
          </View>
          <Text style={styles.headerText}>USER MANAGEMENT</Text>
        </View>

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          {/* Inline Buttons */}
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

          {/* Search Bar */}
          <View style={[styles.searchContainer, !isMobile && styles.searchWeb]}>
            <SearchBar
                placeholder="Search users..."
                value={search}
                onChangeText={setSearch}
                round
                platform="default"
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
            />
          </View>

          {/* User List */}
          {loading ? (
              <ActivityIndicator size="large" color="#800080" style={tw`mt-10`} />
          ) : (filteredUsers.length ? filteredUsers : users).length === 0 ? (
              <Text style={styles.noUsersText}>No users found.</Text>
          ) : (
              (filteredUsers.length ? filteredUsers : users).map((user) => (
                  <View key={user.id} style={[styles.card, !isMobile && styles.cardWeb]}>
                    <View style={tw`flex-row justify-between items-center mb-2`}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <View style={tw`flex-row`}>
                        <Pressable onPress={() => openModifyPage(user)} style={tw`mr-4`}>
                          <Feather name="edit" size={20} color="#800080" />
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                router.push(
                                    `/user_pages/deleteUser?email=${encodeURIComponent(user.email)}`
                                )
                            }
                        >
                          <Feather name="trash-2" size={20} color="red" />
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>📧 {user.email}</Text>
                      <Text style={styles.infoText}>📞 {user.contact}</Text>
                      <Text style={styles.infoText}>🏢 {user.organisation}</Text>
                      <Text style={styles.infoText}>💼 {user.designation}</Text>
                      <Text style={styles.infoText}>📍 {user.location}</Text>
                    </View>
                  </View>
              ))
          )}
        </ScrollView>

        {/* ✅ Add Bulk User Modal */}
        <Modal visible={bulkModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Upload Bulk Users</Text>

              <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownload}
              >
                <Text style={styles.downloadButtonText}>
                  Download Excel Sheet Format
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleFilePick}
                  disabled={bulkLoading}
              >
                {bulkLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.uploadButtonText}>Upload Excel File</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setBulkModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ✅ Add User Modal (unchanged) */}
        <Modal visible={addUserModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add New User</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {[
                { icon: "user", placeholder: "Username", value: username, setter: setUsername },
                { icon: "envelope", placeholder: "Email", value: email, setter: setEmail },
                { icon: "phone", placeholder: "Contact", value: contact, setter: setContact },
                { icon: "building", placeholder: "Organisation", value: organisation, setter: setOrganisation },
                { icon: "briefcase", placeholder: "Designation", value: designation, setter: setDesignation },
                { icon: "lock", placeholder: "Access Level", value: accessLevel, setter: setAccessLevel },
              ].map((field, idx) => (
                  <View key={idx} style={styles.inputContainer}>
                    <Icon name={field.icon} size={18} color="#999" style={styles.icon} />
                    <TextInput
                        placeholder={field.placeholder}
                        placeholderTextColor="#999"
                        value={field.value}
                        onChangeText={field.setter}
                        style={styles.input}
                    />
                  </View>
              ))}

              {/* Location Picker */}
              <View style={styles.pickerWrapper}>
                <Text style={styles.label}>Location</Text>
                {Platform.OS === "web" ? (
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={styles.webSelect}
                    >
                      <option value="">Select a location</option>
                      {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                      ))}
                    </select>
                ) : (
                    <TextInput
                        placeholder="Location"
                        value={location}
                        onChangeText={setLocation}
                        style={styles.input}
                        placeholderTextColor="#999"
                    />
                )}
              </View>

              <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleAddUser}
                  disabled={loadingAdd}
              >
                <Text style={styles.submitBtnText}>
                  {loadingAdd ? "Adding User..." : "Add User"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddUserModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f6ff" },
  headerArc: {
    backgroundColor: "#800080",
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerText: { color: "#fff", fontSize: 26, fontWeight: "bold", letterSpacing: 1 },
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
    gap: 8,
    marginHorizontal: 5,
  },
  inlineButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  searchContainer: { marginVertical: 10, marginHorizontal: 12 },
  searchWeb: { alignSelf: "center", width: 700 },
  searchBarContainer: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0 },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  searchInput: { color: "#000" },
  noUsersText: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 16 },
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
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#4b0082", marginBottom: 10 },
  downloadButton: {
    backgroundColor: "#B300B3",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 10,
  },
  downloadButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  uploadButton: {
    backgroundColor: "#800080",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 20,
  },
  uploadButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  cancelBtn: {
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  cancelBtnText: { color: "#333", fontSize: 16, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    marginVertical: 6,
    height: 44,
  },
  icon: { marginRight: 8, color: "black" },
  input: { flex: 1, color: "black", fontSize: 16 },
  pickerWrapper: { marginTop: 8, marginBottom: 10 },
  label: { color: "black", marginBottom: 6, fontWeight: "600" },
  webSelect: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    color: "#000",
    paddingHorizontal: 12,
  },
  submitBtn: {
    backgroundColor: "#800080",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
