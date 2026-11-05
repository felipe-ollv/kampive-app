import { useTranslation } from '../lib/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { Country } from '../lib/api';
import { Photo, T } from './ui';
export function CountryCard({
  country: c,
  variant = 'carousel',
}: {
  country: Country;
  variant?: 'carousel' | 'fullWidth';
}) {
  const { t } = useTranslation();
  const flag = /^[A-Z]{2}$/.test(c.isoCode)
    ? String.fromCodePoint(...[...c.isoCode].map((letter) => 127397 + letter.charCodeAt(0)))
    : '🌎';
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={t('Explorar {name}', { name: c.name })}
      onPress={() =>
        router.navigate({ pathname: '/', params: { country: c.name, countryUuid: c.uuid } })
      }
      className={`h-36 shrink-0 overflow-hidden rounded-2xl bg-primary ${variant === 'fullWidth' ? 'w-full' : 'w-64'}`}
    >
      {c.imageUrl?.startsWith('https://') && (
        <Photo uri={c.imageUrl} className="absolute inset-0" />
      )}
      <LinearGradient
        colors={['transparent', '#07241a66', '#07241ae6']}
        style={{ position: 'absolute', inset: 0 }}
      />
      <View className="flex-1 justify-between p-4">
        <View className="flex-row items-center justify-between">
          <T className="rounded-lg bg-white/20 p-1.5 text-2xl">{flag}</T>
          <T className="rounded-full bg-[#1e3a2f]/80 px-2.5 py-1 font-bold text-[10px] text-[#caeada]">
            {c.continentName}
          </T>
        </View>
        <View>
          <T className="font-bold text-lg text-white">{c.name}</T>
          <T className="font-bold text-[10px] text-[#caeada]">
            {c.campsiteCount} {t('campings publicados')}
          </T>
        </View>
      </View>
    </Pressable>
  );
}
