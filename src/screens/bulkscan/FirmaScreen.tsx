import React, {useRef} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import SignatureCanvas, {type SignatureViewRef} from 'react-native-signature-canvas';
import {Eraser} from 'lucide-react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAppDispatch} from '../../store/hooks';
import {setFirma} from '../../store/bulkScanSlice';

export default function FirmaScreen({navigation, route}: any) {
  const {isDark} = useTheme();
  const dispatch = useAppDispatch();
  const signatureRef = useRef<SignatureViewRef>(null);
  const label = route.params?.label ?? 'operacion';

  const handleOK = (sig: string) => {
    dispatch(setFirma(sig));
    navigation.goBack();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1">
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={() => {}}
          autoClear={false}
          descriptionText=""
          webStyle={`
            .m-signature-pad { box-shadow: none; border: none; margin: 0; height: 100%; }
            .m-signature-pad--body { border: none; height: 100%; }
            .m-signature-pad--footer { display: none; }
            body, html { margin: 0; padding: 0; height: 100%; background: ${isDark ? '#0a0a0a' : '#ffffff'}; }
            canvas { width: 100%; height: 100%; }
          `}
          backgroundColor={isDark ? '#0a0a0a' : '#ffffff'}
          penColor={isDark ? '#f5f5f5' : '#171717'}
        />
      </View>

      <View className="flex-row px-4 pb-6 pt-3 gap-3 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
        <TouchableOpacity
          onPress={handleClear}
          className="flex-row items-center justify-center gap-2 flex-1 rounded-xl py-3 border border-neutral-300 dark:border-neutral-700"
          activeOpacity={0.7}>
          <Eraser size={16} color={isDark ? '#a3a3a3' : '#737373'} />
          <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Limpiar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          className="flex-1 rounded-xl py-3 items-center bg-neutral-900 dark:bg-neutral-100"
          activeOpacity={0.7}>
          <Text className="text-sm font-semibold text-white dark:text-neutral-900">
            Guardar firma
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
