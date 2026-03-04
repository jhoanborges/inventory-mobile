import React, {useState} from 'react';
import {View} from 'react-native';
import {SegmentedButtons, StyledTextInput, StyledButton} from './ui';

type Props = {
  onSubmit: (data: {tipo: 'entrada' | 'salida'; cantidad: number; motivo?: string}) => void;
  loading?: boolean;
};

export default function MovimientoForm({onSubmit, loading}: Props) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');

  const handleSubmit = () => {
    onSubmit({tipo, cantidad: parseInt(cantidad) || 0, motivo: motivo || undefined});
  };

  return (
    <View className="p-4">
      <SegmentedButtons
        value={tipo}
        onValueChange={v => setTipo(v as 'entrada' | 'salida')}
        buttons={[{value: 'entrada', label: 'Entrada'}, {value: 'salida', label: 'Salida'}]}
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

      <StyledButton onPress={handleSubmit} loading={loading}>
        Registrar
      </StyledButton>
    </View>
  );
}
