import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, type ViewStyle} from 'react-native';

interface StyledButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'contained' | 'outlined';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export default function StyledButton({
  onPress,
  children,
  variant = 'contained',
  loading = false,
  disabled = false,
  className = '',
  style,
}: StyledButtonProps) {
  const isDisabled = disabled || loading;

  const contained = variant === 'contained';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
      className={`flex-row items-center justify-center py-3.5 px-6 rounded-xl ${
        contained
          ? 'bg-neutral-900 dark:bg-neutral-100'
          : 'border border-neutral-300 dark:border-neutral-600 bg-transparent'
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={contained ? '#ffffff' : '#171717'}
          className="mr-2"
        />
      )}
      <Text
        className={`text-base font-semibold ${
          contained
            ? 'text-white dark:text-neutral-900'
            : 'text-neutral-900 dark:text-neutral-100'
        }`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
