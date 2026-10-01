import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { type Campsite } from '../data/campsites';
import { useStore } from '../lib/store';
import { Photo, T } from './ui';
import { C, SIcon, cardShadow, type SymbolName } from './stitch';
const icons: Record<string, SymbolName> = {
  'Fogueira permitida': 'fireplace',
  'Chuveiro quente': 'shower',
  'Pet Friendly': 'pets',
  'Banho natural': 'pool',
  'Pontos de energia': 'bolt',
  'Wi-Fi Starlink': 'wifi',
  'Vaga Motorhome': 'rv_hookup',
  'Cafeteria rústica': 'local_cafe',
  'Trilha direta': 'hiking',
};
export function CampsiteCard({ campsite: c }: { campsite: Campsite }) {
  const { saved, toggleSaved } = useStore();
  const selected = saved.includes(c.id);
  return (
    <View className="overflow-hidden rounded-2xl border border-line/60 bg-white" style={cardShadow}>
      <View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Ver ${c.name}`}
          onPress={() => router.push(`/campsite/${c.id}`)}
        >
          <Photo uri={c.image} style={{ aspectRatio: 16 / 10 }} />
        </Pressable>
        <View className="absolute inset-x-3 top-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1 rounded-full border border-[#aecebe]/30 bg-[#07241a]/80 px-2.5 py-1">
            <SIcon name="verified" size={12} color={C.mint} />
            <T className="font-bold text-[10px] leading-3 text-[#caeada]">Verificado Online</T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${selected ? 'Remover' : 'Salvar'} ${c.name}`}
            accessibilityState={{ selected }}
            onPress={() => toggleSaved(c.id)}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface/95"
          >
            <SIcon
              name="favorite"
              size={21}
              color={selected || (c.featured && c.id === 'pedra-da-mina') ? C.secondary : C.outline}
            />
          </Pressable>
        </View>
        <View className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-full bg-secondary px-3 py-1">
          <T className="font-bold text-xs leading-4 text-white">R$ {c.price}</T>
          <T className="text-[10px] leading-3 text-white">/noite</T>
        </View>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Detalhes de ${c.name}`}
        onPress={() => router.push(`/campsite/${c.id}`)}
        className="gap-3 p-4"
      >
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <T className="flex-1 font-semibold text-lg leading-6 text-primary">{c.name}</T>
            <View className="flex-row items-center gap-1 rounded-md bg-surface-high px-2 py-0.5">
              <SIcon name="star" size={14} color="#f59e0b" />
              <T className="font-bold text-xs leading-4">{c.rating}</T>
              <T className="text-xs leading-4 text-ink-muted">({c.reviews})</T>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <SIcon name="location_on" size={16} color={C.secondary} />
            <T className="flex-1 text-xs leading-4 text-ink-variant">
              {c.location} • {c.meta || c.region}
            </T>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-1.5 border-t border-line/40 pt-2">
          {c.amenities.slice(0, 3).map((a) => (
            <View
              key={a}
              className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1"
            >
              <SIcon name={icons[a] || 'check'} size={12} />
              <T className="font-bold text-[10px] leading-3 text-ink-variant">{a}</T>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}
