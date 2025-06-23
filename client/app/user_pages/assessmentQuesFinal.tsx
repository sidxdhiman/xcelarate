import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

const AssessmentQuestion = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [selectedOption, setSelectedOption] = useState('');
  const [otherText, setOtherText] = useState('');
  const [dissatisfiedReason, setDissatisfiedReason] = useState('');

  const options = ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Other'];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option !== 'Other') setOtherText('');
    if (option !== 'Dissatisfied') setDissatisfiedReason('');
  };

  return (
    <View style={[styles.wrapper, !isMobile && styles.webCenter]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isMobile ? styles.scrollMobile : styles.scrollDesktop,
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.questionNo}>Question 3</Text>
          <Text style={styles.questionText}>How satisfied are you with our product?</Text>

          {options.map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  selectedOption === option && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>

              {option === 'Dissatisfied' && selectedOption === 'Dissatisfied' && (
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us what went wrong..."
                  multiline
                  numberOfLines={4}
                  value={dissatisfiedReason}
                  onChangeText={setDissatisfiedReason}
                />
              )}

              {option === 'Other' && selectedOption === 'Other' && (
                <TextInput
                  style={styles.textArea}
                  placeholder="Please specify..."
                  multiline
                  numberOfLines={4}
                  value={otherText}
                  onChangeText={setOtherText}
                />
              )}
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.prevBtn]}>
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.nextBtn]}
              onPress={() => router.push('/user_pages/submit')}
            >
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveDraftBtn}>
          <Text style={styles.saveDraftText}>Save as Draft</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f6efff',
  },
  webCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  scrollMobile: {
    justifyContent: 'flex-start',
    minHeight: '100%',
    alignItems: 'center',
    paddingTop: 40,
  },
  scrollDesktop: {
    justifyContent: 'center',
    minHeight: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  questionNo: {
    color: '#800080',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionBtn: {
    borderColor: '#800080',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#800080',
  },
  optionText: {
    color: '#800080',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  prevBtn: {
    backgroundColor: '#a0a0a0',
    marginRight: 10,
  },
  nextBtn: {
    backgroundColor: '#800080',
    marginLeft: 10,
  },
  prevBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveDraftBtn: {
    marginTop: 20,
    backgroundColor: '#e0ccf4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignSelf: 'center',
  },
  saveDraftText: {
    color: '#4b0082',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AssessmentQuestion;
