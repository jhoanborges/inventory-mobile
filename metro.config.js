const { withRozenite } = require('@rozenite/metro');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {});

module.exports = withRozenite(withNativeWind(config, {input: './global.css'}), { enabled: process.env.WITH_ROZENITE === 'true' });