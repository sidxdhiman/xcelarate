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
import Modal from 'react-native-modal';
import { router } from 'expo-router';

const questions = [
  {
    id: 1,
    question: 'How are you feeling today?',
    options: ['Great', 'Good', 'Neutral', 'Not Good', 'Other'],
  },
  {
    id: 2,
    question: 'How was your experience with the service?',
    options: ['Excellent', 'Average', 'Poor', 'Other'],
  },
  {
    id: 3,
    question: 'Would you recommend us to others?',
    options: ['Definitely', 'Maybe', 'Not really', 'Other'],
  },
];

const AssessmentQuestion = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option) => {
    setResponses((prev) => ({
      ...prev,
      [currentIndex]: { option, text: '' },
    }));
  };

  const handleTextChange = (text) => {
    setResponses((prev) => ({
      ...prev,
      [currentIndex]: { ...prev[currentIndex], text },
    }));
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toggleModal();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    toggleModal();
    router.push('/user_pages/submit');
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
          <Text style={styles.questionNo}>Question {currentIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.scrollOptions}
            showsVerticalScrollIndicator={false}
          >
            {currentQuestion.options.map((option, index) => {
              const selected = responses[currentIndex]?.option === option;
              return (
                <View key={index} style={styles.optionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionBtn,
                      selected && styles.optionSelected,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>

                  {selected && (
                    <TextInput
                      style={styles.textArea}
                      placeholder={`Please elaborate on "${option}"...`}
                      multiline
                      numberOfLines={4}
                      value={responses[currentIndex]?.text || ''}
                      onChangeText={handleTextChange}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.prevBtn]}
              onPress={goToPrev}
              disabled={currentIndex === 0}
            >
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.nextBtn]}
              onPress={goToNext}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentIndex !== questions.length - 1 && (
          <TouchableOpacity
            style={styles.saveDraftBtn}
            onPress={() => router.push('/userLanding')}
          >
            <Text style={styles.saveDraftText}>Save as Draft</Text>
          </TouchableOpacity>
        )}

        {/* ✅ Modal */}
        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
          <View style={[styles.modalContent, !isMobile && styles.modalBoxWeb]}>
            <Text style={styles.modalTitle}>Submit Assessment</Text>
            <Text style={styles.modalMessage}>
              You are about to submit your responses. Do you want to continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={toggleModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    width: 360,
    height: 500,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'flex-start',
  },
  questionNo: {
    color: '#800080',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  optionsScroll: {
    flex: 1,
  },
  scrollOptions: {
    paddingBottom: 10,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionBtn: {
    borderColor: '#800080',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    marginTop: 8,
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
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBoxWeb: {
    width: 400, // 👈 Custom width for web
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#4b0082',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#800080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default AssessmentQuestion;
