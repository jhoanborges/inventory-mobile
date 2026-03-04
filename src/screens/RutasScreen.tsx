import React, {useEffect} from 'react';
import {View, FlatList, Text} from 'react-native';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchRutas} from '../store/rutasSlice';
import {StyledCard, Badge} from '../components/ui';
import type {StackNavigationProp} from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

const estadoConfig = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return {color: 'warning' as const, label: 'Pendiente'};
    case 'en_progreso':
      return {color: 'info' as const, label: 'En Progreso'};
    case 'completada':
      return {color: 'success' as const, label: 'Completada'};
    default:
      return {color: 'neutral' as const, label: estado};
  }
};

export default function RutasScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {items, loading} = useAppSelector(s => s.rutas);

  useEffect(() => {
    dispatch(fetchRutas({}));
  }, [dispatch]);

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black p-4">
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        refreshing={loading}
        onRefresh={() => dispatch(fetchRutas({}))}
        renderItem={({item}) => {
          const config = estadoConfig(String(item.estado));
          return (
            <StyledCard
              className="mb-3"
              onPress={() => navigation.navigate('RutaDetail', {ruta: item})}>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex-1 mr-2">
                  {item.nombre}
                </Text>
                <Badge color={config.color}>{config.label}</Badge>
              </View>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.origen} → {item.destino}
              </Text>
              {item.vehiculo && (
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Vehiculo: {item.vehiculo}
                </Text>
              )}
              {item.operador && (
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Operador: {item.operador.name}
                </Text>
              )}
            </StyledCard>
          );
        }}
      />
    </View>
  );
}
