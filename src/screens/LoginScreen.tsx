import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk } from '../store/authSlice';
import { StyledTextInput, StyledButton } from '../components/ui';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('admin@bodega.com');
  const [password, setPassword] = useState('password');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = () => {
    dispatch(loginThunk({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <View className="flex-1 items-center justify-center pt-10">
          <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-white">IB</Text>
          </View>
          <Text className="text-3xl font-bold text-white text-center">
            Inventario Bodega
          </Text>
          <Text className="text-sm text-white/60 mt-1">
            Gestiona tu inventario
          </Text>
        </View>

        <View className="bg-white dark:bg-neutral-800 rounded-t-3xl px-6 pt-8 pb-10">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            Iniciar Sesion
          </Text>

          <StyledTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="correo@ejemplo.com"
            leftIcon={<Mail size={20} color="#a3a3a3" />}
          />

          <StyledTextInput
            label="Contrasena"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            placeholder="Tu contrasena"
            leftIcon={<Lock size={20} color="#a3a3a3" />}
            rightIcon={
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                {secureText ? (
                  <EyeOff size={20} color="#a3a3a3" />
                ) : (
                  <Eye size={20} color="#a3a3a3" />
                )}
              </TouchableOpacity>
            }
          />

          {error && (
            <Text className="text-sm text-danger mb-2">{error}</Text>
          )}

          <StyledButton
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !email || !password}
            className="mt-2">
            Iniciar Sesion
          </StyledButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
