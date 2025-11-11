import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

type SnackPayload = { text: string };

let listeners: Array<(p: SnackPayload) => void> = [];

export function showSnack(text: string) {
  listeners.forEach((l) => l({ text }));
}

export const SnackHost: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = ({ text }: SnackPayload) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      setMessage(text);
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 80,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }, 2500);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [opacity, translateY]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View
        style={[
          styles.snack,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.select({ web: 24, default: 16 }),
    alignItems: 'center',
    zIndex: 10000,
  },
  snack: {
    backgroundColor: '#32174d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 780,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});


