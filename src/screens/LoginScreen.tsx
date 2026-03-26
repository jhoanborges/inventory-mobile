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
    console.log('LOGIN ATTEMPT:', { email, password });
    dispatch(loginThunk({ email, password }))
      .unwrap()
      .then(res => console.log('LOGIN SUCCESS:', JSON.stringify(res)))
      .catch(err => console.log('LOGIN ERROR:', err));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-900"
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center pt-10">
          <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-white">IB</Text>
          </View>
          <Text className="text-3xl font-bold text-white text-center">
            InventoryX
          </Text>
          <Text className="text-sm text-white/60 mt-1">
            Gestiona tu inventario
          </Text>
        </View>

        <View className="bg-white dark:bg-neutral-800 rounded-t-3xl px-6 pt-8 pb-20">
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
            <View className="bg-red-100 rounded-lg p-3 mb-2">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
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
