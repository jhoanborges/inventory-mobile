import React from 'react';
import {View, Text} from 'react-native';
import {StyledCard, Badge} from './ui';
import type {Producto} from '../types';

type Props = {producto: Producto; onPress?: () => void};

export default function ProductCard({producto, onPress}: Props) {
  const isLowStock = producto.stock_actual <= producto.stock_minimo;

  return (
    <StyledCard onPress={onPress} className="mb-3">
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {producto.nombre}
      </Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
        SKU: {producto.sku}
      </Text>
      <View className="flex-row items-center mt-2">
        <Text className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">
          Stock:
        </Text>
        <Badge color={isLowStock ? 'danger' : 'success'}>
          {producto.stock_actual}
        </Badge>
      </View>
      {producto.precio && (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          ${Number(producto.precio).toFixed(2)}
        </Text>
      )}
    </StyledCard>
  );
}
