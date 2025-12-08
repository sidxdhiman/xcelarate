import React, { useEffect, useState } from "react";
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
import * as Location from "expo-location";

const UserDetailsScreen = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();

    // --- 1. NEW STATE VARIABLES ---
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [phone, setPhone] = useState("");
    const [organization, setOrganization] = useState(""); // <--- ADDED
    const [locationText, setLocationText] = useState(""); // <--- ADDED (User typed location)

    const [assessment, setAssessment] = useState<any>(null);

    useEffect(() => {
        if (data) {
            try {
                const decoded = JSON.parse(decodeURIComponent(data));
                setAssessment(decoded);
            } catch (err) {
                console.warn("Failed to parse assessment data:", err);
            }
        }
    }, [data]);

    const getLocationAsync = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                // alert("Location permission denied."); // Optional: don't block user
                return null;
            }
            const pos = await Location.getCurrentPositionAsync({});
            return { lat: pos.coords.latitude, lon: pos.coords.longitude };
        } catch (err) {
            console.warn("Location error:", err);
            return null;
        }
    };

    const handleSubmit = async () => {
        // --- 2. UPDATED VALIDATION ---
        if (
            !name ||
            !designation ||
            !email ||
            !department ||
            !phone ||
            !organization ||
            !locationText
        ) {
            alert("Please fill in all the details.");
            return;
        }

        if (!id || !assessment) {
            alert("Assessment data missing.");
            return;
        }

        const gpsLoc = await getLocationAsync();

        // --- 3. UPDATED PAYLOAD ---
        const payload = {
            ...assessment,
            user: {
                name,
                designation,
                email,
                department,
                phone,
                organization, // <--- Sent to backend
                location: locationText, // <--- Sent to backend (Text value)
            },
            location: gpsLoc, // GPS coords (separate from user text input)
            startedAt: Date.now(),
        };

        const encoded = encodeURIComponent(JSON.stringify(payload));

        router.push({
            pathname: "/[id]/[q]",
            params: { id, q: "0", data: encoded },
        });
    };

    return (
        <ImageBackground
            source={require("../../assets/images/0002.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.wrapper}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.header}>
                            Please fill your details before proceeding
                        </Text>

                        <View
                            style={[
                                styles.formContainer,
                                { width: isMobile ? "100%" : "100%" },
                            ]}
                        >
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                            />

                            <Text style={styles.label}>Designation</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your role"
                                placeholderTextColor="#999"
                                value={designation}
                                onChangeText={setDesignation}
                            />

                            {/* --- 4. NEW INPUT FIELDS START --- */}
                            <Text style={styles.label}>Organization</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Company / Organization"
                                placeholderTextColor="#999"
                                value={organization}
                                onChangeText={setOrganization}
                            />

                            <Text style={styles.label}>Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City / Region"
                                placeholderTextColor="#999"
                                value={locationText}
                                onChangeText={setLocationText}
                            />
                            {/* --- NEW INPUT FIELDS END --- */}

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                keyboardType="email-address"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <Text style={styles.label}>Department</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Marketing, HR, etc."
                                placeholderTextColor="#999"
                                value={department}
                                onChangeText={setDepartment}
                            />

                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 XXXXX XXXXX"
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                                value={phone}
                                onChangeText={setPhone}
                            />

                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomRight}>
                    <Text style={styles.powered}>Powered By</Text>
                    <Image
                        source={require("../../assets/images/Xebia.png")}
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
        paddingTop: 70,
    },

    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 40, // Added padding to scroll fully
    },

    card: {
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
        backgroundColor: "white",
        padding: 24,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },

    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1c001c",
        marginBottom: 20,
        textAlign: "center",
    },

    formContainer: {
        width: "100%",
        alignSelf: "center",
    },

    label: {
        color: "#800080",
        fontSize: 14,
        marginBottom: 6,
        marginLeft: 6,
        fontWeight: "600",
    },

    input: {
        height: 48,
        borderColor: "#800080",
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 18,
        backgroundColor: "#fff",
        color: "#333",
        fontSize: 15,
    },

    button: {
        backgroundColor: "#800080",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    bottomRight: {
        position: "absolute",
        bottom: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
    },

    powered: {
        fontSize: 12,
        color: "white",
        marginRight: 6,
    },

    logo: {
        width: 70,
        height: 70,
    },
});