import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = Math.min(width * 0.9, 340);

export default function AdminTabs({ visible = true, onAddPress }) {
  const pathname = usePathname();

  const isUsers = pathname.includes("userManagement");
  const isAssessments = pathname.includes("test_pages/test_management");

  // Animation for Visibility (Up/Down only)
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 180, // Hide downwards
      useNativeDriver: true,
      damping: 15,
      stiffness: 120,
    }).start();
  }, [visible]);

  // Handle the Center "+" Button Logic
  const handleCenterPress = () => {
    if (isUsers) {
      // Trigger user-provided action (e.g., open Bulk/Single modal)
      if (onAddPress) {
        onAddPress();
      }
    } else {
      // Default: Go to Add Assessment Page
      router.push("/test_pages/addTest");
    }
  };

  return (
    <Animated.View
      style={[styles.floatingContainer, { transform: [{ translateY }] }]}
    >
      {/* --- LEFT TAB: ASSESSMENTS --- */}
      <TouchableOpacity
        style={[styles.tab, isAssessments && styles.activeTab]}
        onPress={() => router.push("/test_pages/test_management")}
        activeOpacity={0.6}
      >
        <Ionicons
          name={isAssessments ? "clipboard" : "clipboard-outline"}
          size={22}
          color={isAssessments ? "#800080" : "#8E8E93"}
        />
        {isAssessments && <Text style={styles.activeLabel}>Tests</Text>}
      </TouchableOpacity>

      {/* --- CENTER ACTION: DYNAMIC ADD --- */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterPress}
          activeOpacity={0.9}
        >
          {/* Icon switches based on context */}
          <Feather
            name={isUsers ? "user-plus" : "plus"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* --- RIGHT TAB: USERS --- */}
      <TouchableOpacity
        style={[styles.tab, isUsers && styles.activeTab]}
        onPress={() => router.push("/userManagement")}
        activeOpacity={0.6}
      >
        <Ionicons
          name={isUsers ? "people" : "people-outline"}
          size={22}
          color={isUsers ? "#800080" : "#8E8E93"}
        />
        {isUsers && <Text style={styles.activeLabel}>Users</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    zIndex: 1000,
    width: TAB_BAR_WIDTH,
    height: 65,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Spread tabs apart
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Glass-like background
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",

    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    height: 48,
    flex: 1,
    // Ensure tabs don't overlap the center button space visually
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#f3e5f5", // Light purple pill for the active state
  },
  activeLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#800080", // Purple text
  },

  // Center Button Styles
  centerButtonContainer: {
    position: "absolute",
    left: "50%",
    marginLeft: -28, // Half width (56/2)
    top: -22, // Float upwards
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#800080", // Solid Purple
    borderWidth: 4,
    borderColor: "#f9f6ff", // Matches background to create "cutout" effect

    shadowColor: "#800080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
