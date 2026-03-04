import React, {useState} from 'react';
import {View, Text, Alert} from 'react-native';
import {Search} from 'lucide-react-native';
import {scanBarcode} from '../services/api';
import {StyledTextInput, StyledButton} from '../components/ui';
import type {StackNavigationProp} from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function ScannerScreen({navigation}: Props) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!barcode.trim()) {
      return;
    }
    setLoading(true);
    try {
      const {data} = await scanBarcode(barcode.trim());
      navigation.navigate('ProductDetail', {producto: data.data});
    } catch {
      Alert.alert('No encontrado', 'Producto no encontrado con ese codigo');
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-6">
        Escanear Producto
      </Text>

      <StyledTextInput
        label="Codigo de barras"
        value={barcode}
        onChangeText={setBarcode}
        placeholder="Ingresa el codigo"
        leftIcon={<Search size={20} color="#a3a3a3" />}
        onSubmitEditing={handleScan}
      />

      <StyledButton
        onPress={handleScan}
        loading={loading}
        disabled={loading}
        className="mt-2">
        Buscar
      </StyledButton>
    </View>
  );
}
