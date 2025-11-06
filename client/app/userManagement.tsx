import React, { useEffect, useState } from "react";
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
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { SearchBar } from "react-native-elements";
import { useAuthStore } from "@/store/useAuthStore";
import Toast from "react-native-toast-message";
import tw from "twrnc";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

export default function UserManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const axiosInstance = useAuthStore((state) => state.axiosInstance);
  const { addUser, uploadBulkUsers, modifyUser, deleteUser } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Modals
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  // Modify Fields
  const [selectedUser, setSelectedUser] = useState(null);
  const [modUsername, setModUsername] = useState("");
  const [modEmail, setModEmail] = useState("");
  const [modContact, setModContact] = useState("");
  const [modOrganisation, setModOrganisation] = useState("");
  const [modDesignation, setModDesignation] = useState("");
  const [modLocation, setModLocation] = useState("");
  const [modAccessLevel, setModAccessLevel] = useState(1);
  const [modLoading, setModLoading] = useState(false);

  // Delete Fields
  const [delEmail, setDelEmail] = useState("");
  const [delLoading, setDelLoading] = useState(false);

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

  // === ADD USER ===
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
      Toast.show({ type: "error", text1: "All fields are required!" });
      return;
    }

    setLoadingAdd(true);
    try {
      const response = await addUser({
        username,
        email,
        contact,
        organisation,
        designation,
        accessLevel,
        location,
      });
      if (response.success) {
        Toast.show({ type: "success", text1: "User added successfully!" });
        setAddUserModalVisible(false);
        const res = await axiosInstance.get("/users");
        setUsers(res.data.reverse());
      } else {
        Toast.show({ type: "error", text1: "Failed to add user" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error adding user" });
    } finally {
      setLoadingAdd(false);
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
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });
      setBulkLoading(true);
      const uploadResponse = await uploadBulkUsers(formData);
      if (uploadResponse.success) {
        Toast.show({ type: "success", text1: "Users added successfully!" });
      } else {
        Toast.show({ type: "error", text1: "Failed to upload users!" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error uploading file" });
    } finally {
      setBulkLoading(false);
    }
  };

  // === MODIFY USER ===
  const openModifyModal = (user) => {
    setSelectedUser(user);
    setModUsername(user.username || "");
    setModEmail(user.email || "");
    setModContact(user.contact || "");
    setModOrganisation(user.organisation || "");
    setModDesignation(user.designation || "");
    setModLocation(user.location || "");
    setModAccessLevel(user.accessLevel || 1);
    setModifyModalVisible(true);
  };

  const handleModifyUser = async () => {
    if (
        !modUsername ||
        !modContact ||
        !modOrganisation ||
        !modDesignation ||
        !modLocation
    ) {
      Toast.show({ type: "error", text1: "All fields are required!" });
      return;
    }

    setModLoading(true);
    try {
      const res = await modifyUser(modEmail, {
        username: modUsername,
        contact: modContact,
        organisation: modOrganisation,
        designation: modDesignation,
        location: modLocation,
        accessLevel: modAccessLevel,
      });
      if (res.success) {
        Toast.show({ type: "success", text1: "User modified successfully!" });
        setModifyModalVisible(false);
        const refreshed = await axiosInstance.get("/users");
        setUsers(refreshed.data.reverse());
      } else {
        Toast.show({ type: "error", text1: "Failed to modify user" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error updating user" });
    } finally {
      setModLoading(false);
    }
  };

  // === DELETE USER ===
  const openDeleteModal = (user) => {
    setDelEmail(user.email);
    setDeleteModalVisible(true);
  };

  const handleDeleteUser = async () => {
    setDelLoading(true);
    try {
      const res = await deleteUser(delEmail);
      if (res.success) {
        Toast.show({ type: "success", text1: "User flagged successfully!" });
        setDeleteModalVisible(false);
        const refreshed = await axiosInstance.get("/users");
        setUsers(refreshed.data.reverse());
      } else {
        Toast.show({ type: "error", text1: "Failed to flag user" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Error flagging user" });
    } finally {
      setDelLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View
            style={[
              styles.headerArc,
              { paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight || 24 },
            ]}
        >
          <Text style={styles.headerText}>USER MANAGEMENT</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.inlineButtonsContainer, !isMobile && styles.inlineButtonsContainerWeb]}>
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
                onChangeText={setSearch}
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
                  <View key={user.id} style={[styles.card, !isMobile && styles.cardWeb]}>
                    <View style={tw`flex-row justify-between items-center mb-2`}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <View style={tw`flex-row`}>
                        <Pressable onPress={() => openModifyModal(user)} style={tw`mr-4`}>
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
                      <Text style={styles.infoText}>🏢 {user.organisation}</Text>
                      <Text style={styles.infoText}>💼 {user.designation}</Text>
                      <Text style={styles.infoText}>📍 {user.location}</Text>
                    </View>
                  </View>
              ))
          )}
        </ScrollView>

        {/* === Add User Modal === */}
        <Modal visible={addUserModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add New User</Text>
              {[
                { placeholder: "Username", value: username, setter: setUsername },
                { placeholder: "Email", value: email, setter: setEmail },
                { placeholder: "Contact", value: contact, setter: setContact },
                { placeholder: "Organisation", value: organisation, setter: setOrganisation },
                { placeholder: "Designation", value: designation, setter: setDesignation },
                { placeholder: "Access Level", value: accessLevel, setter: setAccessLevel },
                { placeholder: "Location", value: location, setter: setLocation },
              ].map((field, i) => (
                  <TextInput
                      key={i}
                      style={styles.input}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChangeText={field.setter}
                  />
              ))}

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddUser} disabled={loadingAdd}>
                <Text style={styles.submitBtnText}>
                  {loadingAdd ? "Adding User..." : "Add User"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddUserModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* === Bulk Upload Modal === */}
        <Modal visible={bulkModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Upload Bulk Users</Text>
              <TouchableOpacity style={styles.submitBtn} onPress={handleDownload}>
                <Text style={styles.submitBtnText}>Download Format</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleFilePick}
                  disabled={bulkLoading}
              >
                <Text style={styles.submitBtnText}>
                  {bulkLoading ? "Uploading..." : "Upload File"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBulkModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* === Modify User Modal === */}
        <Modal visible={modifyModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Modify User</Text>
              {[
                { placeholder: "Username", value: modUsername, setter: setModUsername },
                { placeholder: "Email", value: modEmail, setter: () => {}, disabled: true },
                { placeholder: "Contact", value: modContact, setter: setModContact },
                { placeholder: "Organisation", value: modOrganisation, setter: setModOrganisation },
                { placeholder: "Designation", value: modDesignation, setter: setModDesignation },
                { placeholder: "Location", value: modLocation, setter: setModLocation },
                { placeholder: "Access Level", value: String(modAccessLevel), setter: (v) => setModAccessLevel(Number(v)) },
              ].map((field, i) => (
                  <TextInput
                      key={i}
                      style={[styles.input, field.disabled && { color: "#aaa" }]}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChangeText={field.setter}
                      editable={!field.disabled}
                  />
              ))}

              <TouchableOpacity style={styles.submitBtn} onPress={handleModifyUser} disabled={modLoading}>
                <Text style={styles.submitBtnText}>
                  {modLoading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModifyModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* === Delete User Modal === */}
        <Modal visible={deleteModalVisible} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Flag User</Text>
              <TextInput value={delEmail} editable={false} style={styles.input} />
              <Text style={styles.warningText}>
                Are you sure you want to flag this user? This action cannot be undone.
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f6ff" },
  headerArc: {
    backgroundColor: "#800080",
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerText: { color: "#fff", fontSize: 26, fontWeight: "bold", letterSpacing: 1, paddingTop: 15 },
  scrollContent: { paddingBottom: 40 },
  inlineButtonsContainer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    width: "90%", alignSelf: "center", marginBottom: 10,
  },
  inlineButtonsContainerWeb: { width: 700, justifyContent: "space-between" },
  inlineButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 10, marginHorizontal: 5, gap: 8,
  },
  inlineButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  searchContainer: { marginVertical: 10, marginHorizontal: 12 },
  searchWeb: { alignSelf: "center", width: 700 },
  searchBarContainer: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0 },
  searchInputContainer: {
    backgroundColor: "#fff", borderRadius: 30, borderWidth: 1, borderColor: "#e0d0ef",
  },
  searchInput: { color: "#000" },
  noUsersText: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 16 },
  card: {
    backgroundColor: "#fff", padding: 16, margin: 10, borderRadius: 16,
    borderWidth: 1, borderColor: "#f0e6fa",
  },
  cardWeb: { width: 700, alignSelf: "center" },
  userName: { fontSize: 18, fontWeight: "700", color: "#4b0082" },
  infoBox: { marginTop: 6 },
  infoText: { color: "#333", fontSize: 14, marginBottom: 3 },
  modalContainer: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "90%", maxWidth: 450,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#4b0082", marginBottom: 10 },
  warningText: {
    color: "red", fontSize: 14, marginTop: 8, marginBottom: 10, textAlign: "center",
  },
  input: {
    backgroundColor: "#fff", borderColor: "#ccc", borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 12, height: 44, marginVertical: 6, color: "#000",
  },
  submitBtn: {
    backgroundColor: "#800080", borderRadius: 10, paddingVertical: 12,
    alignItems: "center", marginVertical: 6,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#ddd", borderRadius: 10, paddingVertical: 12,
    alignItems: "center", marginTop: 16,
  },
  cancelBtnText: { color: "#333", fontSize: 16, fontWeight: "600" },
});
