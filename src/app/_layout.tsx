import '../../global.css';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { StoreProvider, useStore } from '../lib/store';
import { colors } from '../theme/tokens';
import { Notice } from '../components/ui';
export default function Layout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    MaterialSymbols: require('../../assets/stitch/material-symbols.ttf'),
  });
  if (!loaded && !error)
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  return (
    <StoreProvider>
      <Navigation />
    </StoreProvider>
  );
}
function Navigation() {
  const { ready, storageError } = useStore();
  if (!ready)
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  return (
    <View className="w-full max-w-[448px] flex-1 self-center bg-surface">
      <StatusBar style="dark" />
      {storageError && (
        <Notice error>
          Não foi possível salvar os dados neste dispositivo. Suas alterações podem ser perdidas ao
          fechar.
        </Notice>
      )}
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="campsite" />
      </Stack>
    </View>
  );
}
