import React from 'react';
import {View, Text} from 'react-native';

type Props = {label: string; type: 'origen' | 'destino'};

export default function MapMarker({label, type}: Props) {
  return (
    <View
      className={`px-2 py-1.5 rounded-lg min-w-[40px] items-center ${
        type === 'origen' ? 'bg-success' : 'bg-danger'
      }`}>
      <Text className="text-xs font-bold text-white">{label}</Text>
    </View>
  );
}
