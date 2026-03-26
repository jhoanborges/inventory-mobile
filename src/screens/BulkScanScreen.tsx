import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ScanBarcode, ClipboardCheck, Route, CircleCheckBig, ChevronRight, ChevronLeft} from 'lucide-react-native';
import {useTheme} from '../context/ThemeContext';
import EscaneoStep from './bulkscan/EscaneoStep';
import VerificacionStep from './bulkscan/VerificacionStep';
import RutaStep from './bulkscan/RutaStep';
import ResultadoStep from './bulkscan/ResultadoStep';

const STEPS = [
  {key: 'escaneo', label: 'Escaneo', icon: ScanBarcode, component: EscaneoStep},
  {key: 'verificacion', label: 'Verificacion', icon: ClipboardCheck, component: VerificacionStep},
  {key: 'ruta', label: 'Ruta', icon: Route, component: RutaStep},
  {key: 'resultado', label: 'Resultado', icon: CircleCheckBig, component: ResultadoStep},
];

export default function BulkScanScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const {isDark} = useTheme();

  const StepComponent = STEPS[currentStep].component;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      {/* Stepper indicator */}
      <View className="bg-white dark:bg-neutral-900 px-4 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <View style={styles.stepperRow}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const iconColor = isActive
              ? (isDark ? '#f5f5f5' : '#171717')
              : isDone
                ? '#22c55e'
                : (isDark ? '#525252' : '#a3a3a3');

            return (
              <React.Fragment key={step.key}>
                {i > 0 && (
                  <View
                    style={[
                      styles.stepLine,
                      {backgroundColor: isDone ? '#22c55e' : (isDark ? '#404040' : '#e5e5e5')},
                    ]}
                  />
                )}
                <TouchableOpacity
                  onPress={() => setCurrentStep(i)}
                  style={styles.stepItem}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isActive
                          ? (isDark ? '#262626' : '#f5f5f5')
                          : 'transparent',
                        borderColor: isActive
                          ? (isDark ? '#f5f5f5' : '#171717')
                          : isDone
                            ? '#22c55e'
                            : (isDark ? '#404040' : '#e5e5e5'),
                      },
                    ]}>
                    <Icon size={16} color={iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isActive
                          ? (isDark ? '#f5f5f5' : '#171717')
                          : (isDark ? '#525252' : '#a3a3a3'),
                        fontWeight: isActive ? '600' : '400',
                      },
                    ]}
                    numberOfLines={1}>
                    {step.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* Step content */}
      <View className="flex-1">
        <StepComponent />
      </View>

      {/* Navigation buttons */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <TouchableOpacity
          onPress={() => setCurrentStep(s => s - 1)}
          disabled={isFirst}
          style={[styles.navButton, isFirst && styles.navButtonDisabled]}
          activeOpacity={0.7}>
          <ChevronLeft size={18} color={isFirst ? '#a3a3a3' : (isDark ? '#f5f5f5' : '#171717')} />
          <Text
            style={[
              styles.navButtonText,
              {color: isFirst ? '#a3a3a3' : (isDark ? '#f5f5f5' : '#171717')},
            ]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={() => setCurrentStep(s => s + 1)}
          disabled={isLast}
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            isLast && styles.navButtonDisabled,
            {backgroundColor: isLast ? (isDark ? '#262626' : '#e5e5e5') : (isDark ? '#f5f5f5' : '#171717')},
          ]}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.navButtonText,
              {color: isLast ? '#a3a3a3' : (isDark ? '#171717' : '#f5f5f5')},
            ]}>
            Siguiente
          </Text>
          <ChevronRight size={18} color={isLast ? '#a3a3a3' : (isDark ? '#171717' : '#f5f5f5')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    height: 2,
    flex: 1,
    maxWidth: 32,
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 4,
  },
  navButtonPrimary: {
    borderRadius: 10,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
