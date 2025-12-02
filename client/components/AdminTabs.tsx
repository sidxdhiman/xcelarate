import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

export default function AdminTabs({ visible = true }) {
  const pathname = usePathname();

  const isUsers = pathname.includes("userManagement");
  const isAssessments = pathname.includes("test_pages/test_management");

  // Animation value
  const translateY = useRef(new Animated.Value(0)).current;

  // Animate when visible changes
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 70, // move down to hide
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {/* ASSESSMENTS (LEFT) */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/test_pages/test_management")}
      >
        <Ionicons
          name="clipboard-outline"
          size={26}
          color={isAssessments ? "#800080" : "#777"}
        />
        <Text style={[styles.label, isAssessments && styles.active]}>
          Assessments
        </Text>
      </TouchableOpacity>

      {/* USERS */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/userManagement")}
      >
        <Ionicons
          name="people-outline"
          size={26}
          color={isUsers ? "#800080" : "#777"}
        />
        <Text style={[styles.label, isUsers && styles.active]}>Users</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e8d9f8",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
  },
  active: {
    color: "#800080",
  },
});
