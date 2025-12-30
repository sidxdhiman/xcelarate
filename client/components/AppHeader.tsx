import React, { useMemo, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  Modal,
  Animated,
  SafeAreaView,
  Pressable,
  Easing,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// --- Configuration ---
const SIDEBAR_WIDTH = 300;
const PRIMARY_COLOR = "#800080"; // Xebia Purple
const ACCENT_BG_COLOR = "#f3e5f5"; // Light purple for tablet background
const DANGER_COLOR = "#dc2626"; // Red for logout

// --- Types ---
interface AppHeaderProps {
  logoSource: ImageSourcePropType;
  children?: React.ReactNode;
  activeRouteName?: string;
  onNavigate?: (route: string) => void;
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  isDanger?: boolean;
}

// --- Components ---

// 1. Curved Tablet Menu Item
const SidebarItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  isActive,
  onPress,
  isDanger = false,
}) => {
  const iconColor = isDanger ? DANGER_COLOR : isActive ? PRIMARY_COLOR : "#666";

  const labelStyle = [
    styles.sidebarLabel,
    isDanger && { color: DANGER_COLOR },
    isActive && { color: PRIMARY_COLOR, fontWeight: "700" as const },
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabletItem,
        isActive && styles.tabletItemActive,
        pressed && styles.tabletItemPressed,
      ]}
      android_ripple={{
        color: isDanger ? "#fee2e2" : "#e9d5ff",
        borderless: false,
      }}
    >
      <Feather
        name={icon}
        size={20}
        color={iconColor}
        style={styles.sidebarIcon}
      />
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
};

const AppHeader: React.FC<AppHeaderProps> = ({
  logoSource,
  children,
  activeRouteName = "",
  onNavigate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation Values
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle Safe Area
  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 50;
    return (StatusBar.currentHeight || 24) + 15;
  }, []);

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        easing: Easing.in(Easing.poly(4)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsMenuOpen(false));
  };

  const handleInternalNav = (route: string) => {
    closeMenu();
    if (onNavigate) {
      setTimeout(() => onNavigate(route), 50);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => handleInternalNav("/logout"),
      },
    ]);
  };

  const bottomMenuItems = [
    { label: "Settings", icon: "settings", route: "/settings" },
    { label: "Help & Support", icon: "help-circle", route: "/help" },
  ] as const;

  return (
    <>
      {/* --- Fixed Header --- */}
      <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* Changed name="menu" to name="chevron-right" */}
          <Feather name="chevron-right" size={34} color="#fff" />
        </TouchableOpacity>

        {/* Header Image (Large) */}
        <Image
          source={logoSource}
          style={styles.titleLogo}
          resizeMode="contain"
        />
        <View style={{ width: 28 }} />
        {children}
      </View>

      {/* --- Sidebar Modal --- */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>

          {/* Sidebar Panel */}
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <SafeAreaView style={styles.sidebarSafeArea}>
              {/* Top Profile Section */}
              <View style={styles.sidebarHeader}>
                <Pressable
                  style={styles.profileCard}
                  onPress={() => handleInternalNav("/profile")}
                  android_ripple={{ color: ACCENT_BG_COLOR }}
                >
                  <View style={styles.profileAvatar}>
                    <Feather name="user" size={20} color={PRIMARY_COLOR} />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>John Doe</Text>
                    <Text style={styles.profileRole}>View Profile</Text>
                  </View>
                </Pressable>

                <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Main Menu Area (EMPTY as requested) */}
              <View style={{ flex: 1 }}>
                {/* This section is intentionally left blank */}
              </View>

              {/* Bottom Menu Area */}
              <View style={styles.bottomMenuContainer}>
                <Text style={styles.sectionTitle}>OPTIONS</Text>

                {bottomMenuItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    isActive={activeRouteName === item.label}
                    onPress={() => handleInternalNav(item.route)}
                  />
                ))}

                <View style={[styles.divider, { marginVertical: 10 }]} />

                <SidebarItem
                  icon="log-out"
                  label="Log Out"
                  route="/logout"
                  isActive={false}
                  isDanger={true}
                  onPress={handleLogout}
                />
              </View>

              {/* Footer Logo */}
              <View style={styles.footer}>
                {/* EDIT PATH HERE FOR XEBIA LOGO */}
                <Text>Powered By</Text>
                <Image
                  source={require("../assets/images/Xebia.png")}
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // --- Header ---
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: PRIMARY_COLOR,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuButton: { padding: 1 },
  titleLogo: { width: 250, height: 45 },

  // --- Modal ---
  modalContainer: { flex: 1, flexDirection: "row" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  sidebarSafeArea: { flex: 1, backgroundColor: "#fff" },

  // --- Profile Header ---
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  profileCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ACCENT_BG_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#333" },
  profileRole: { fontSize: 13, color: PRIMARY_COLOR },
  closeBtn: { padding: 6 },
  divider: { height: 1, backgroundColor: "#eee", marginHorizontal: 16 },

  // --- Bottom Section ---
  bottomMenuContainer: {
    paddingBottom: 10,
    paddingHorizontal: 12, // Increased padding for tablet look
  },
  sectionTitle: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 12,
  },

  // --- Tablet Styles (Curved & Floating) ---
  tabletItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 30, // High radius for pill/tablet shape
    marginHorizontal: 4, // Floating effect away from edge
  },
  tabletItemActive: {
    backgroundColor: ACCENT_BG_COLOR,
  },
  tabletItemPressed: {
    backgroundColor: "#f5f5f5",
    opacity: 0.8,
  },
  sidebarIcon: { width: 24, marginRight: 12 },
  sidebarLabel: { fontSize: 15, color: "#444", fontWeight: "500" },

  // --- Footer ---
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerLogo: { width: 120, height: 40 },
});

export { AppHeader };
export default AppHeader;
