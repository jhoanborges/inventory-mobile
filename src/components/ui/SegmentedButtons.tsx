import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';

interface SegmentedButton {
  value: string;
  label: string;
}

interface SegmentedButtonsProps {
  value: string;
  onValueChange: (value: string) => void;
  buttons: SegmentedButton[];
  className?: string;
}

export default function SegmentedButtons({
  value,
  onValueChange,
  buttons,
  className = '',
}: SegmentedButtonsProps) {
  return (
    <View
      className={`flex-row border border-neutral-300 dark:border-neutral-600 rounded-xl overflow-hidden ${className}`}>
      {buttons.map((btn, i) => {
        const active = btn.value === value;
        return (
          <TouchableOpacity
            key={btn.value}
            onPress={() => onValueChange(btn.value)}
            activeOpacity={0.7}
            className={`flex-1 py-3 items-center ${
              active
                ? 'bg-neutral-900 dark:bg-neutral-100'
                : 'bg-white dark:bg-neutral-800'
            } ${i > 0 ? 'border-l border-neutral-300 dark:border-neutral-600' : ''}`}>
            <Text
              className={`text-sm font-semibold ${
                active
                  ? 'text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
