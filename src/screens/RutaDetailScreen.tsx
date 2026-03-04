import React from 'react';
import {ScrollView, Text} from 'react-native';
import {StyledCard, Divider} from '../components/ui';
import type {Ruta} from '../types';
import type {RouteProp} from '@react-navigation/native';

type Props = {
  route: RouteProp<{params: {ruta: Ruta}}, 'params'>;
};

export default function RutaDetailScreen({route}: Props) {
  const {ruta} = route.params;

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-black p-4">
      <StyledCard className="mb-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {ruta.nombre}
        </Text>

        <Divider />

        <Text className="text-sm text-neutral-700 dark:text-neutral-300">
          Origen: {ruta.origen}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          Destino: {ruta.destino}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          Estado: {String(ruta.estado)}
        </Text>
        {ruta.vehiculo && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Vehiculo: {ruta.vehiculo}
          </Text>
        )}
        {ruta.operador && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Operador: {ruta.operador.name}
          </Text>
        )}

        <Divider />

        {ruta.fecha_inicio && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300">
            Inicio: {ruta.fecha_inicio}
          </Text>
        )}
        {ruta.fecha_fin && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Fin: {ruta.fecha_fin}
          </Text>
        )}
      </StyledCard>
    </ScrollView>
  );
}
