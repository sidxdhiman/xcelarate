module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // If you have other plugins, list them here FIRST.
      // 'react-native-reanimated/plugin' MUST be the LAST plugin.
      'react-native-reanimated/plugin',
    ],
  };
};