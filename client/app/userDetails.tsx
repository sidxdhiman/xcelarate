import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
  ImageBackground,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const UserDetailsScreen = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [assessment, setAssessment] = useState<any>(null);

  const handleSubmit = () => {
    if (!name || !designation || !email || !department || !phone) {
      alert("Please fill in all the details.");
      return;
    }

    if (!id || !assessment) {
      alert("Assessment data is missing.");
      return;
    }

    const encoded = encodeURIComponent(JSON.stringify(assessment));
    router.push({
      pathname: "/[id]/[q]",
      params: { id, q: "0", data: encoded },
    });
  };

  return (
    <ImageBackground
      source={require("../assets/images/0002.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.header}>User Details</Text>

            <View
              style={[
                styles.formContainer,
                { width: isMobile ? "100%" : "90%" },
              ]}
            >
              {/* --- FIELD: NAME --- */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />

              {/* --- FIELD: DESIGNATION --- */}
              <Text style={styles.label}>Designation</Text>
              <TextInput
                style={styles.input}
                placeholder="Your role"
                placeholderTextColor="#999"
                value={designation}
                onChangeText={setDesignation}
              />

              {/* --- FIELD: EMAIL --- */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                keyboardType="email-address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
              />

              {/* --- FIELD: DEPARTMENT --- */}
              <Text style={styles.label}>Department</Text>
              <TextInput
                style={styles.input}
                placeholder="Marketing, HR, etc."
                placeholderTextColor="#999"
                value={department}
                onChangeText={setDepartment}
              />

              {/* --- FIELD: PHONE --- */}
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 XXXXX XXXXX"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
              />

              {/* --- BUTTON --- */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* --- BRANDING: POWERED BY XEBIA --- */}
        <View style={styles.bottomRight}>
          <Text style={styles.powered}>Powered By</Text>
          <Image
            source={require("../assets/images/Xebia.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default UserDetailsScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  wrapper: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 90,
  },

  // ✨ Enhanced Glass Card
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 26,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  header: {
    fontSize: 30,
    fontWeight: "900",
    color: "#4a004a",
    marginBottom: 24,
    textAlign: "center",
  },

  formContainer: {
    width: "100%",
  },

  label: {
    color: "#530053",
    fontSize: 15.5,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "700",
  },

  input: {
    height: 50,
    borderColor: "#800080",
    borderWidth: 1.4,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: "white",
    color: "#333",
    fontSize: 15.5,
  },

  button: {
    backgroundColor: "#800080",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.4,
  },

  // --- POWERED BY (BOTTOM RIGHT) ---
  bottomRight: {
    position: "absolute",
    bottom: 25,
    right: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  powered: {
    fontSize: 14,
    color: "#222",
    marginRight: 6,
    fontWeight: "500",
  },
  logo: {
    width: 70,
    height: 70,
  },
});
