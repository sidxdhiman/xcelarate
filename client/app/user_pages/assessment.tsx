import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';

const questions = [
  {
    id: 1,
    question: 'How satisfied are you with our product?',
    options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Other'],
  },
  {
    id: 2,
    question: 'How easy was it to use our platform?',
    options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Other'],
  },
];

const AssessmentScreen: React.FC = () => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [responses, setResponses] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentQIndex];

  const handleSaveResponse = () => {
    if (!selectedOption) {
      Alert.alert('Select an option before saving.');
      return;
    }

    if (selectedOption === 'Other' && customAnswer.trim() === '') {
      Alert.alert('Please provide your custom answer.');
      return;
    }

    const answer = selectedOption === 'Other' ? customAnswer : selectedOption;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    Alert.alert('Response saved!');
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setCustomAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setSelectedOption(null);
      setCustomAnswer('');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/0001.jpg')} // Replace with your actual path
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {currentQIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedOption === option && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          {selectedOption === 'Other' && (
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Please specify your answer"
              placeholderTextColor="#666"
              value={customAnswer}
              onChangeText={setCustomAnswer}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveResponse}>
            <Text style={styles.saveButtonText}>Save Response</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.navButton, currentQIndex === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            disabled={currentQIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentQIndex === questions.length - 1 && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={currentQIndex === questions.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  questionNumber: {
    fontSize: 18,
    color: '#800080',
    fontWeight: '600',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#800080',
    marginBottom: 10,
  },
  optionText: {
    color: '#800080',
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#800080',
  },
  selectedOptionText: {
    color: 'white',
  },
  textArea: {
    marginTop: 12,
    borderColor: '#800080',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#800080',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    marginTop: 20,
  },
  navButton: {
    flex: 0.48,
    backgroundColor: '#800080',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AssessmentScreen;
