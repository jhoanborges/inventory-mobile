import React, {useEffect} from 'react';
import {StatusBar, View, ActivityIndicator} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {Provider as StoreProvider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/store/store';
import {restoreToken} from './src/store/authSlice';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#171717',
    border: '#e5e5e5',
    primary: '#171717',
  },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#171717',
    text: '#f5f5f5',
    border: '#262626',
    primary: '#f5f5f5',
  },
};

function AppContent() {
  const {isDark} = useTheme();

  useEffect(() => {
    store.dispatch(restoreToken());
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#ffffff'}
      />
      <NavigationContainer theme={isDark ? DarkNavTheme : LightNavTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

function LoadingScreen() {
  return (
    <View style={{flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator size="large" color="#171717" />
    </View>
  );
}

export default function App() {
  return (
    <StoreProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </StoreProvider>
  );
}
