import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import tw from 'twrnc'; // since you are using Tailwind (twrnc)

const HomeScreen = () => {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={tw`text-2xl font-bold text-purple-800`}>
        You have been logged in!
      </Text>
    </View>
  );
};

export default HomeScreen;
