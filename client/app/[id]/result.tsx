import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.center}>
      <Text style={styles.h1}>All done! 🎉</Text>
      <Text style={styles.p}>Your answers have been submitted.</Text>
      <Text style={styles.p2}>You can exit the page now.</Text>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.btn}>
        <Text style={styles.btnTxt}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 24, fontWeight: '700', color: '#4b0082' },
  p: { marginTop: 8, fontSize: 16, color: '#555' },
  p2: {marginTop: 10, fontSize: 16, color: '#555'},
  btn: { marginTop: 20, backgroundColor: '#800080', padding: 12, borderRadius: 8 },
  btnTxt: { color: '#fff', fontWeight: '600' },
});
