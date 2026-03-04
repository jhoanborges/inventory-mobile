import React, {useState} from 'react';
import {View, Text, Alert} from 'react-native';
import {useAppDispatch} from '../store/hooks';
import {addMovimiento} from '../store/movimientosSlice';
import {SegmentedButtons, StyledTextInput, StyledButton} from '../components/ui';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RouteProp} from '@react-navigation/native';

type Props = {
  route: RouteProp<{params: {producto_id: number}}, 'params'>;
  navigation: StackNavigationProp<any>;
};

export default function MovimientoScreen({route, navigation}: Props) {
  const dispatch = useAppDispatch();
  const {producto_id} = route.params;
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cantidad || parseInt(cantidad) <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad valida');
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        addMovimiento({
          producto_id,
          tipo,
          cantidad: parseInt(cantidad),
          motivo: motivo || undefined,
        }),
      ).unwrap();
      Alert.alert('Exito', 'Movimiento registrado', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo registrar el movimiento');
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Nuevo Movimiento
      </Text>

      <SegmentedButtons
        value={tipo}
        onValueChange={v => setTipo(v as 'entrada' | 'salida')}
        buttons={[
          {value: 'entrada', label: 'Entrada'},
          {value: 'salida', label: 'Salida'},
        ]}
        className="mb-4"
      />

      <StyledTextInput
        label="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        placeholder="0"
      />

      <StyledTextInput
        label="Motivo (opcional)"
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Razon del movimiento"
      />

      <StyledButton
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        className="mt-2">
        Registrar
      </StyledButton>
    </View>
  );
}
