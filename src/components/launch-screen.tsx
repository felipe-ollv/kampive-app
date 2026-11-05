import { useTranslation } from '../lib/i18n';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

export function LaunchScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require('../../assets/splash.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        fadeDuration={0}
        accessibilityLabel={t('Kampive — Explore a vida ao ar livre. Carregando.')}
        onLoadEnd={() => SplashScreen.hide()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003c2d' },
});
