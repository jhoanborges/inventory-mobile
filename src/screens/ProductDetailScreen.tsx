import React from 'react';
import {View, ScrollView, Text} from 'react-native';
import {StyledCard, Badge, Divider, StyledButton} from '../components/ui';
import type {Producto} from '../types';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RouteProp} from '@react-navigation/native';

type Props = {
  route: RouteProp<{params: {producto: Producto}}, 'params'>;
  navigation: StackNavigationProp<any>;
};

export default function ProductDetailScreen({route, navigation}: Props) {
  const {producto} = route.params;
  const isLowStock = producto.stock_actual <= producto.stock_minimo;

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-black p-4">
      <StyledCard className="mb-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {producto.nombre}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          SKU: {producto.sku}
        </Text>
        {producto.barcode && (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Codigo: {producto.barcode}
          </Text>
        )}

        <Divider />

        <Text className="text-sm text-neutral-700 dark:text-neutral-300">
          Categoria: {producto.categoria ?? 'N/A'}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          Unidad: {producto.unidad_medida}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          Precio: {producto.precio ? `$${Number(producto.precio).toFixed(2)}` : 'N/A'}
        </Text>

        <Divider />

        <View className="flex-row items-center mb-1">
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">
            Stock Actual:
          </Text>
          <Badge color={isLowStock ? 'danger' : 'success'}>
            {producto.stock_actual}
          </Badge>
        </View>
        <Text className="text-sm text-neutral-700 dark:text-neutral-300">
          Stock Minimo: {producto.stock_minimo}
        </Text>
      </StyledCard>

      {producto.lotes && producto.lotes.length > 0 && (
        <StyledCard className="mb-4">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Lotes
          </Text>
          {producto.lotes.map(lote => (
            <View
              key={lote.id}
              className="py-2 border-b border-neutral-200 dark:border-neutral-700">
              <Text className="text-sm text-neutral-700 dark:text-neutral-300">
                {lote.numero_lote} - Cant: {lote.cantidad} - {String(lote.estado)}
              </Text>
              {lote.fecha_vencimiento && (
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  Vence: {lote.fecha_vencimiento}
                </Text>
              )}
            </View>
          ))}
        </StyledCard>
      )}

      <StyledButton
        onPress={() => navigation.navigate('Movimiento', {producto_id: producto.id})}
        className="mb-4">
        Registrar Movimiento
      </StyledButton>
    </ScrollView>
  );
}
