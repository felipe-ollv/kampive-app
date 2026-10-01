import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { countries } from '../data/campsites';
import { Photo, T } from './ui';
export function CountryCard({
  country: c,
  variant = 'carousel',
}: {
  country: (typeof countries)[number];
  variant?: 'carousel' | 'fullWidth';
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Explorar ${c.name}`}
      onPress={() => router.navigate({ pathname: '/', params: { country: c.name } })}
      className={`h-36 shrink-0 overflow-hidden rounded-2xl ${variant === 'fullWidth' ? 'w-full' : 'w-64'}`}
    >
      <Photo uri={c.image} className="absolute inset-0" />
      <LinearGradient
        colors={['transparent', '#07241a66', '#07241ae6']}
        style={{ position: 'absolute', inset: 0 }}
      />
      <View className="flex-1 justify-between p-4">
        <View className="flex-row items-center justify-between">
          <T className="rounded-lg bg-white/20 p-1.5 text-2xl leading-7">{c.flag}</T>
          <T className="rounded-full bg-[#1e3a2f]/80 px-2.5 py-1 font-bold text-[10px] leading-3 text-[#caeada]">
            {c.region}
          </T>
        </View>
        <View>
          <T className="font-bold text-lg leading-6 text-white">{c.name}</T>
          <T className="font-bold text-[10px] leading-3 text-[#caeada]">
            {c.count} campings registrados
          </T>
        </View>
      </View>
    </Pressable>
  );
}
