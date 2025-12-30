import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

// Get screen width to center the floating island nicely
const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = Math.min(width * 0.85, 300); // Max width 300px for tablet look

export default function AdminTabs({ visible = true }) {
  const pathname = usePathname();

  const isUsers = pathname.includes("userManagement");
  const isAssessments = pathname.includes("test_pages/test_management");

  // Animation value
  const translateY = useRef(new Animated.Value(0)).current;

  // Animate when visible changes
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 150, // Move down further to hide completely
      useNativeDriver: true,
      damping: 15,
      stiffness: 120,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[styles.floatingContainer, { transform: [{ translateY }] }]}
    >
      {/* ASSESSMENTS TAB */}
      <TouchableOpacity
        style={[styles.tab, isAssessments && styles.activeTabBackground]}
        onPress={() => router.push("/test_pages/test_management")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isAssessments ? "clipboard" : "clipboard-outline"}
          size={24}
          color={isAssessments ? "#800080" : "#8E8E93"}
        />
        {isAssessments && <Text style={styles.activeLabel}>Assessments</Text>}
      </TouchableOpacity>

      {/* DIVIDER (Optional visual separation) */}
      <View style={styles.divider} />

      {/* USERS TAB */}
      <TouchableOpacity
        style={[styles.tab, isUsers && styles.activeTabBackground]}
        onPress={() => router.push("/userManagement")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isUsers ? "people" : "people-outline"}
          size={24}
          color={isUsers ? "#800080" : "#8E8E93"}
        />
        {isUsers && <Text style={styles.activeLabel}>Users</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    // Positioning
    position: "absolute",
    bottom: 30, // Float 30px from bottom
    alignSelf: "center", // Center horizontally

    // Shape & Size
    width: TAB_BAR_WIDTH,
    height: 65,
    borderRadius: 35, // Full pill shape
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 5,

    // Glass/Visual Effect
    backgroundColor: "rgba(255, 255, 255, 0.92)", // High opacity for readability but slight glass feel
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)", // Subtle frost border

    // Shadows (Crucial for the "Floating" feel)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10, // Android shadow
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    height: 48,
  },
  activeTabBackground: {
    backgroundColor: "#f3e5f5", // Very light purple pill background for active state
  },
  activeLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#800080",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E5EA", // Apple standard divider color
  },
});
