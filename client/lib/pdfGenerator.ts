import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { encode } from "base64-arraybuffer";

const BASE_URL = "https://xcelarate-backend.onrender.com/api";

/**
 * 🔹 Download and open an assessment PDF from backend
 */
export const downloadAssessmentPDF = async (assessmentId: string) => {
    const url = `${BASE_URL}/assessments/${assessmentId}/pdf`;

    try {
        console.log("Downloading PDF from:", url);

        // For Web
        if (Platform.OS === "web") {
            const res = await axios.get(url, { responseType: "blob" });
            const blobUrl = window.URL.createObjectURL(res.data);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `assessment_${assessmentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            console.log("✅ PDF downloaded on web");
            return;
        }

        // For iOS / Android
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const base64 = encode(res.data);

        const fileUri = FileSystem.documentDirectory + `assessment_${assessmentId}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log("PDF saved to:", fileUri);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            console.log("Sharing not available on this platform.");
        }
    } catch (err) {
        console.error("❌ PDF download error:", err);
        throw err;
    }
};
