import { LanguageProvider, useTranslation } from '../lib/i18n';
import '../../global.css';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '../components/ui';
import * as SplashScreen from 'expo-splash-screen';
import { LaunchScreen } from '../components/launch-screen';
import { StoreProvider } from '../lib/store';
import { AuthProvider, useAuth } from '../lib/auth';
import { colors } from '../theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    MaterialSymbols: require('../../assets/stitch/material-symbols.ttf'),
  });
  if (!loaded && !error) return <LaunchScreen />;
  return (
    <AuthProvider>
      <LanguageProvider>
        <StoreProvider>
          <Navigation />
        </StoreProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
function Navigation() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  return (
    <View
      className="w-full max-w-[448px] flex-1 self-center bg-surface"
      onLayout={() => SplashScreen.hide()}
    >
      <StatusBar style="dark" />
      {user &&
        !user.emailVerified &&
        !['/email-verification', '/verify-email', '/email-verified'].includes(pathname) && (
          <SafeAreaView edges={['top', 'left', 'right']} className="bg-surface">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/email-verification')}
              className="bg-primary p-3"
            >
              <T className="text-white text-center">
                {t('Confirme seu e-mail para participar da comunidade. Toque aqui.')}
              </T>
            </Pressable>
          </SafeAreaView>
        )}
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
      >
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="campsite" />
          <Stack.Screen name="requests" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/delete" />
        </Stack.Protected>
        <Stack.Screen name="email-verification" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="email-verified" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="password-reset-success" />
      </Stack>
    </View>
  );
}
