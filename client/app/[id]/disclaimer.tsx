import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

const DisclaimerScreen: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const {id, data } = useLocalSearchParams<{id: string; data?: string}>();

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
    <View style={[styles.wrapper, !isMobile && styles.webCenter]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isMobile ? { justifyContent: 'flex-start' } : { justifyContent: 'center' },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Disclaimer</Text>
          <Text style={styles.introText}>
            Before proceeding, confirm that you understand and accept the following rules:
          </Text>

          {disclaimerTexts.map((item, index) => (
            <Text key={index} style={styles.bulletText}>• {item}</Text>
          ))}

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

          <TouchableOpacity
            disabled={!agreed}
            onPress={() => 
              router.push({
                pathname: '/userDetails',
                params: {id, data},
              })
            }
            style={[
              styles.button,
              { backgroundColor: agreed ? '#800080' : '#ccc' },
            ]}
          >
            <Text style={styles.buttonText}>Start Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f6efff',
    height: screenHeight,
    width: screenWidth
  },
  webCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c001c',
    marginBottom: 20,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#222',
  },
  bulletText: {
    fontSize: 15,
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
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DisclaimerScreen;
