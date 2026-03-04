import React, {useState} from 'react';
import {View, TextInput, Text, type TextInputProps} from 'react-native';

interface StyledTextInputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function StyledTextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}: StyledTextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-xl px-3 bg-white dark:bg-neutral-800 ${
          error
            ? 'border-danger'
            : focused
              ? 'border-neutral-900 dark:border-neutral-100'
              : 'border-neutral-300 dark:border-neutral-600'
        }`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          {...props}
          className="flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100"
          placeholderTextColor="#a3a3a3"
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      )}
    </View>
  );
}
