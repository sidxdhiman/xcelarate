import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Platform, Share } from 'react-native';

export const generatePDF = async (content: string) => {
    try {
        // Create PDF
        const { uri } = await Print.printToFileAsync({
            html: `<html><body><pre>${content}</pre></body></html>`,
            base64: false,
        });

        // Save to app storage
        const fileName = `${FileSystem.documentDirectory}assessment.pdf`;
        await FileSystem.moveAsync({
            from: uri,
            to: fileName,
        });

        // Share / open PDF
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            await Share.share({
                url: fileName,
                title: 'Assessment PDF',
            });
        }

        return true;
    } catch (err) {
        console.error('PDF generation error:', err);
        throw err;
    }
};
