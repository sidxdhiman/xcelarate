// module.exports = function (api) {
//   api.cache(true);

//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [["babel-plugin-react-native-reanimated", {}]],
//   };
// };

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "babel-plugin-react-native-reanimated",
      "react-native-reanimated/plugin",
    ],
  };
};
