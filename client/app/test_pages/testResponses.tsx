import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Pressable,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { generatePDF } from '@/lib/pdfGenerator'; // our working PDF generator

interface Answer {
    questionText: string;
    selectedOption: string;
    inputText?: string;
    type?: string;
}

interface UserResponse {
    name: string;
    email: string;
    startedAt: string | null;
    submittedAt: string | null;
    location: { lat: number; lon: number } | null;
    answers: Answer[];
}

export default function TestResponses() {
    const { id: rawId } = useLocalSearchParams<{ id: string }>();
    const id = decodeURIComponent(rawId?.trim() || '');

    const [responses, setResponses] = useState<UserResponse[]>([]);
    const [filteredResponses, setFilteredResponses] = useState<UserResponse[]>([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const { getAssessmentById, getResponsesByAssessmentId } = useAssessmentStore();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const assessment = await getAssessmentById(id);
                const rawResponses = await getResponsesByAssessmentId(id);

                const parsedResponses: UserResponse[] = rawResponses
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    )
                    .map((res: any) => ({
                        name: res.user?.name || 'Anonymous',
                        email: res.user?.email || '',
                        startedAt: res.startedAt || null,
                        submittedAt: res.submittedAt || null,
                        location: res.location || null,
                        answers: Object.entries(res.answers || {}).map(
                            ([qText, ans]: [string, any]) => ({
                                questionText: qText,
                                selectedOption: ans?.option || 'N/A',
                                inputText: ans?.text || '',
                                type: ans?.type || 'unknown',
                            })
                        ),
                    }));

                setTitle(assessment?.title || 'Untitled');
                setResponses(parsedResponses);
                setFilteredResponses(parsedResponses);
            } catch (err) {
                console.error('Error loading responses:', err);
                setResponses([]);
                setFilteredResponses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredResponses(responses);
            return;
        }
        const q = search.toLowerCase();
        setFilteredResponses(
            responses.filter(
                r =>
                    r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
            )
        );
    }, [search, responses]);

    // PDF download handler
    const handleDownloadPDF = (response: UserResponse, idx: number) => {
        const content = `
Name: ${response.name}
Email: ${response.email || 'N/A'}
Started At: ${response.startedAt || 'N/A'}
Submitted At: ${response.submittedAt || 'N/A'}
Location: ${
            response.location
                ? `Lat: ${response.location.lat}, Lon: ${response.location.lon}`
                : 'N/A'
        }
Answers:
${response.answers
            .map(
                (ans, i) =>
                    `${i + 1}. Q: ${ans.questionText}\n   Selected Option: ${ans.selectedOption}${
                        ans.inputText ? `\n   Text Response: ${ans.inputText}` : ''
                    }\n   Type: ${ans.type}`
            )
            .join('\n')}
    `;

        generatePDF(content)
            .then(() => Alert.alert('Success', 'PDF downloaded successfully!'))
            .catch(err => Alert.alert('Error', 'Failed to generate PDF'));
    };

    return (
        <ScrollView style={tw`bg-white`}>
            <View style={tw`px-4 pt-4`}>
                <Pressable onPress={() => router.back()} style={tw`mb-4`}>
                    <Icon name="arrow-left" size={22} color="#800080" />
                </Pressable>

                <Text style={tw`text-2xl font-bold mb-4 text-purple-800`}>
                    Responses for: {title}
                </Text>

                <TextInput
                    placeholder="Search by name or email"
                    value={search}
                    onChangeText={setSearch}
                    style={tw`border border-gray-300 rounded-md px-3 py-2 mb-4`}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#800080" />
                ) : filteredResponses.length === 0 ? (
                    <Text style={tw`text-gray-600`}>No responses found.</Text>
                ) : (
                    filteredResponses.map((res, idx) => (
                        <View key={idx} style={tw`bg-gray-100 rounded-md p-4 mb-3`}>
                            <Text style={tw`text-base font-semibold text-purple-700`}>
                                Name: {res.name}
                            </Text>
                            <Text style={tw`text-sm text-gray-700`}>
                                Email: {res.email || 'N/A'}
                            </Text>
                            <Text style={tw`text-sm text-gray-700`}>
                                Started At:{' '}
                                {res.startedAt
                                    ? new Date(res.startedAt).toLocaleString()
                                    : 'N/A'}
                            </Text>
                            <Text style={tw`text-sm text-gray-700`}>
                                Submitted At:{' '}
                                {res.submittedAt
                                    ? new Date(res.submittedAt).toLocaleString()
                                    : 'N/A'}
                            </Text>
                            <Text style={tw`text-sm text-gray-700 mb-2`}>
                                Location:{' '}
                                {res.location
                                    ? `Lat: ${res.location.lat}, Lon: ${res.location.lon}`
                                    : 'N/A'}
                            </Text>

                            {res.answers.map((ans, i) => (
                                <View
                                    key={i}
                                    style={tw`mb-3 bg-white rounded-md p-2 border border-gray-200`}
                                >
                                    <Text style={tw`font-semibold text-purple-800`}>
                                        Q: {ans.questionText}
                                    </Text>
                                    <Text style={tw`text-gray-800`}>
                                        Selected Option: {ans.selectedOption}
                                    </Text>
                                    {ans.inputText ? (
                                        <Text style={tw`text-gray-600`}>
                                            Text Response: {ans.inputText}
                                        </Text>
                                    ) : null}
                                    <Text style={tw`text-xs text-gray-500`}>
                                        (Type: {ans.type})
                                    </Text>
                                </View>
                            ))}

                            <Pressable
                                onPress={() => handleDownloadPDF(res, idx)}
                                style={tw`bg-purple-700 px-3 py-2 rounded-md mt-2`}
                            >
                                <Text style={tw`text-white font-semibold text-center`}>
                                    Download PDF
                                </Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}


// import React, { useEffect, useState } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     ActivityIndicator,
//     Pressable,
//     TextInput,
//     Platform,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import tw from 'twrnc';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useAssessmentStore } from '@/store/useAssessmentStore';
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import * as FileSystem from 'expo-file-system';
//
// interface Answer {
//     questionText: string;
//     selectedOption: string;
//     inputText?: string;
//     type?: string;
// }
//
// interface UserResponse {
//     name: string;
//     email: string;
//     startedAt: string | null;
//     submittedAt: string | null;
//     location: { lat: number; lon: number } | null;
//     answers: Answer[];
// }
//
// export default function TestResponses() {
//     const { id: rawId } = useLocalSearchParams<{ id: string }>();
//     const id = decodeURIComponent(rawId?.trim() || '');
//
//     const baseDir = (FileSystem as any).documentDirectory as string;
//
//     const [responses, setResponses] = useState<UserResponse[]>([]);
//     const [filteredResponses, setFilteredResponses] = useState<UserResponse[]>([]);
//     const [title, setTitle] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//
//     const { getAssessmentById, getResponsesByAssessmentId } = useAssessmentStore();
//
//     // Fetch assessment and responses
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!id) return;
//             setLoading(true);
//             try {
//                 const assessment = await getAssessmentById(id);
//                 const rawResponses = await getResponsesByAssessmentId(id);
//
//                 const parsedResponses: UserResponse[] = rawResponses
//                     .sort(
//                         (a: any, b: any) =>
//                             new Date(b.submittedAt).getTime() -
//                             new Date(a.submittedAt).getTime()
//                     )
//                     .map((res: any) => ({
//                         name: res.user?.name || 'Anonymous',
//                         email: res.user?.email || '',
//                         startedAt: res.startedAt || null,
//                         submittedAt: res.submittedAt || null,
//                         location: res.location || null,
//                         answers: Object.entries(res.answers || {}).map(
//                             ([qText, ans]: [string, any]) => ({
//                                 questionText: qText,
//                                 selectedOption: ans?.option || 'N/A',
//                                 inputText: ans?.text || '',
//                                 type: ans?.type || 'unknown',
//                             })
//                         ),
//                     }));
//
//                 setTitle(assessment?.title || 'Untitled');
//                 setResponses(parsedResponses);
//                 setFilteredResponses(parsedResponses);
//             } catch (err) {
//                 console.error('Error loading responses:', err);
//                 setResponses([]);
//                 setFilteredResponses([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id]);
//
//     // Filter responses by search term
//     useEffect(() => {
//         if (!search.trim()) {
//             setFilteredResponses(responses);
//             return;
//         }
//         const q = search.toLowerCase();
//         setFilteredResponses(
//             responses.filter(
//                 r =>
//                     r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
//             )
//         );
//     }, [search, responses]);
//
//     // PDF download function using pdf-lib
//     const downloadPDF = async (response: UserResponse, idx: number) => {
//         try {
//             const pdfDoc = await PDFDocument.create();
//             const page = pdfDoc.addPage([612, 792]); // A4 size
//             const { height } = page.getSize();
//             const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//             let y = height - 50;
//             const lineHeight = 18;
//
//             const addLine = (text: string) => {
//                 page.drawText(text, { x: 40, y, size: 12, font, color: rgb(0, 0, 0) });
//                 y -= lineHeight;
//             };
//
//             addLine(`Name: ${response.name}`);
//             addLine(`Email: ${response.email || 'N/A'}`);
//             addLine(`Started At: ${response.startedAt || 'N/A'}`);
//             addLine(`Submitted At: ${response.submittedAt || 'N/A'}`);
//             addLine(
//                 `Location: ${
//                     response.location
//                         ? `Lat: ${response.location.lat}, Lon: ${response.location.lon}`
//                         : 'N/A'
//                 }`
//             );
//             addLine('Answers:');
//             response.answers.forEach((ans, i) => {
//                 addLine(`${i + 1}. Q: ${ans.questionText}`);
//                 addLine(`   Selected Option: ${ans.selectedOption}`);
//                 if (ans.inputText) addLine(`   Text Response: ${ans.inputText}`);
//                 addLine(`   Type: ${ans.type}`);
//             });
//
//             const pdfBytes = await pdfDoc.save();
//
//             if (Platform.OS === 'web') {
//                 // Web: download using blob
//                 const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//                 const link = document.createElement('a');
//                 link.href = URL.createObjectURL(blob);
//                 link.download = `${response.name}_response_${idx + 1}.pdf`;
//                 link.click();
//             } else {
//                 // Mobile: save to filesystem
//                 const pdfPath = `${baseDir}${response.name}_response_${idx + 1}.pdf`;
//                 await FileSystem.writeAsStringAsync(
//                     pdfPath,
//                     Buffer.from(pdfBytes).toString('base64'),
//                     { encoding: FileSystem.EncodingType.Base64 }
//                 );
//                 alert(`PDF saved to: ${pdfPath}`);
//             }
//         } catch (err) {
//             console.error('Error creating PDF:', err);
//             alert('Failed to generate PDF');
//         }
//     };
//
//     return (
//         <ScrollView style={tw`bg-white`}>
//             <View style={tw`px-4 pt-4`}>
//                 <Pressable onPress={() => router.back()} style={tw`mb-4`}>
//                     <Icon name="arrow-left" size={22} color="#800080" />
//                 </Pressable>
//
//                 <Text style={tw`text-2xl font-bold mb-4 text-purple-800`}>
//                     Responses for: {title}
//                 </Text>
//
//                 <TextInput
//                     placeholder="Search by name or email"
//                     value={search}
//                     onChangeText={setSearch}
//                     style={tw`border border-gray-300 rounded-md px-3 py-2 mb-4`}
//                 />
//
//                 {loading ? (
//                     <ActivityIndicator size="large" color="#800080" />
//                 ) : filteredResponses.length === 0 ? (
//                     <Text style={tw`text-gray-600`}>No responses found.</Text>
//                 ) : (
//                     filteredResponses.map((res, idx) => (
//                         <View key={idx} style={tw`bg-gray-100 rounded-md p-4 mb-3`}>
//                             <Text style={tw`text-base font-semibold text-purple-700`}>
//                                 Name: {res.name}
//                             </Text>
//                             <Text style={tw`text-sm text-gray-700`}>Email: {res.email || 'N/A'}</Text>
//                             <Text style={tw`text-sm text-gray-700`}>
//                                 Started At: {res.startedAt ? new Date(res.startedAt).toLocaleString() : 'N/A'}
//                             </Text>
//                             <Text style={tw`text-sm text-gray-700`}>
//                                 Submitted At: {res.submittedAt ? new Date(res.submittedAt).toLocaleString() : 'N/A'}
//                             </Text>
//                             <Text style={tw`text-sm text-gray-700 mb-2`}>
//                                 Location: {res.location ? `Lat: ${res.location.lat}, Lon: ${res.location.lon}` : 'N/A'}
//                             </Text>
//
//                             {res.answers.map((ans, i) => (
//                                 <View key={i} style={tw`mb-3 bg-white rounded-md p-2 border border-gray-200`}>
//                                     <Text style={tw`font-semibold text-purple-800`}>Q: {ans.questionText}</Text>
//                                     <Text style={tw`text-gray-800`}>Selected Option: {ans.selectedOption}</Text>
//                                     {ans.inputText && <Text style={tw`text-gray-600`}>Text Response: {ans.inputText}</Text>}
//                                     <Text style={tw`text-xs text-gray-500`}>(Type: {ans.type})</Text>
//                                 </View>
//                             ))}
//
//                             <Pressable onPress={() => downloadPDF(res, idx)} style={tw`bg-purple-700 px-3 py-2 rounded-md mt-2`}>
//                                 <Text style={tw`text-white font-semibold text-center`}>Download PDF</Text>
//                             </Pressable>
//                         </View>
//                     ))
//                 )}
//             </View>
//         </ScrollView>
//     );
// }
