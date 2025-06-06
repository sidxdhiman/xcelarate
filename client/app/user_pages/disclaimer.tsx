import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const DisclaimerScreen: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter(); // ✅ Initialize router

  const disclaimerTexts: string[] = [
    'This survey is for feedback purpose and responses will only be used for that purpose.',
    'Responses are confidential and will only be used in aggregate. No personal data will be shared.',
    'By completing this survey, you consent to the use of your data for research purposes only.',
    'By participating, you agree to the terms outlined here. For questions, contact us at [contact information].',
    'No financial compensation is offered for completing this survey.',
    'Participants must be [insert minimum age].',
    'We are not responsible for any technical issues encountered. Contact [contact information] for help.',
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Top Image */}
      <Image
        source={require("../../assets/images/0001.jpg")}
        style={styles.headerImage}
      />

      {/* White Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Disclaimer</Text>

        <Text style={styles.introText}>
          Before proceeding, confirm that you understand and accept the following rules:
        </Text>

        {disclaimerTexts.map((item, index) => (
          <Text key={index} style={styles.bulletText}>• {item}</Text>
        ))}

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={styles.checkboxContainer}
        >
          {agreed ? (
            <CheckSquare size={24} color="#800080" />
          ) : (
            <Square size={24} color="#800080" />
          )}
          <Text style={styles.checkboxText}>
            I have read and agree to the assessment terms.
          </Text>
        </TouchableOpacity>

        {/* Start Assessment Button */}
        <TouchableOpacity
          disabled={!agreed}
          onPress={() => router.push('/user_pages/assessment')} // ✅ Use router.push properly
          style={[
            styles.button,
            { backgroundColor: agreed ? '#800080' : '#ccc' },
          ]}
        >
          <Text style={styles.buttonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: -30,
    minHeight: 760,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 20,
    textAlign: 'center',
  },
  introText: {
    fontSize: 18,
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#800080',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DisclaimerScreen;
