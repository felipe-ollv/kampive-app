import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CampsiteCard } from '../../components/campsite-card';
import { CountryCard } from '../../components/country-card';
import { C, CTA, Page, SIcon, ToggleChip, TopBar, type SymbolName } from '../../components/stitch';
import { Empty, T } from '../../components/ui';
import { countries, filterCampsites, filters } from '../../data/campsites';
const icons: SymbolName[] = ['near_me', 'water', 'landscape', 'pets', 'rv_hookup', 'wifi'];
export default function Explore() {
  const { country: param } = useLocalSearchParams<{ country?: string }>();
  const country = param || 'Brasil';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Perto de você');
  const [selecting, setSelecting] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [all, setAll] = useState(false);
  const results = filterCampsites(
    query,
    filter === 'Perto de você' ? 'Todos' : filter,
    country,
  ).filter((c) => query || all || (!c.featured && country !== 'Brasil') || c.featured);
  return (
    <Page
      top={16}
      header={<TopBar mode="home" country={country} onCountry={() => setSelecting(!selecting)} />}
    >
      {selecting && (
        <View className="gap-2 rounded-xl border border-line bg-white p-3">
          {['Brasil', ...countries.map((c) => c.name)].map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              onPress={() => {
                router.setParams({ country: name });
                setSelecting(false);
                setFilter('Perto de você');
              }}
              className="flex-row justify-between p-2"
            >
              <T>{name}</T>
              {name === country && <SIcon name="check" size={18} />}
            </Pressable>
          ))}
        </View>
      )}
      <View className="gap-1">
        <View className="self-start flex-row items-center gap-1 rounded-full bg-[#ffdbce] px-2.5 py-0.5">
          <SIcon name="wb_sunny" size={12} color="#370e00" />
          <T className="font-bold text-[10px] leading-3 text-[#370e00]">Bom dia, Aventureiro</T>
        </View>
        <T
          accessibilityRole="header"
          className="font-bold text-[28px] leading-[34px] tracking-tight text-primary"
        >
          Onde você vai acampar?
        </T>
        <T className="text-sm leading-5 text-ink-variant">
          Descubra campings selvagens, glampings e refúgios com infraestrutura completa.
        </T>
      </View>
      <View
        className="flex-row items-center rounded-full border border-line bg-white p-1.5"
        style={{
          shadowColor: C.forest,
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <View className="pl-3 pr-2">
          <SIcon name="search" size={24} color={C.secondary} />
        </View>
        <TextInput
          accessibilityLabel="Buscar campings"
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por cidade, parque ou nome do camping..."
          placeholderTextColor={C.outline}
          className="min-h-10 min-w-0 flex-1 font-jakarta text-sm text-ink"
        />
        <View className="mx-1 h-6 w-px bg-line" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir filtros avançados"
          onPress={() => setAdvanced(!advanced)}
          className="items-center justify-center rounded-full bg-[#1e3a2f] px-4 py-2.5"
        >
          <SIcon name="tune" size={18} color="#fff" />
        </Pressable>
      </View>
      {advanced && (
        <View className="gap-3 rounded-xl bg-white p-4">
          <T className="font-semibold">Filtrar por tipo de camping</T>
          <View className="flex-row flex-wrap gap-2">
            {filters.map((f, i) => (
              <ToggleChip
                key={f}
                icon={icons[i]}
                selected={filter === f}
                onPress={() => setFilter(f)}
              >
                {f}
              </ToggleChip>
            ))}
          </View>
          <CTA title="Aplicar filtros" icon="check" onPress={() => setAdvanced(false)} />
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {filters.map((f, i) => (
          <ToggleChip
            key={f}
            icon={icons[i]}
            selected={filter === f}
            onPress={() => setFilter(filter === f ? 'Perto de você' : f)}
          >
            {f}
          </ToggleChip>
        ))}
      </ScrollView>
      <View className="gap-4">
        <View className="flex-row items-end justify-between gap-5">
          <View className="flex-1">
            <T className="font-bold text-[10px] leading-3 uppercase tracking-[0.4px] text-secondary">
              Descobertas Recomendadas
            </T>
            <T
              accessibilityRole="header"
              className="font-bold text-[18px] leading-7 tracking-tight text-primary"
            >
              Em Destaque no {country} {country === 'Brasil' ? '🇧🇷' : ''}
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAll(!all);
              setQuery('');
              setFilter('Perto de você');
            }}
            className="w-[78px] flex-row items-center gap-1"
          >
            <T className="flex-1 font-bold text-xs leading-4 text-secondary">
              {all ? 'Ver destaques' : 'Ver todos (142)'}
            </T>
            <SIcon name="chevron_right" size={16} color={C.secondary} />
          </Pressable>
        </View>
        <View className="gap-6">
          {results.length ? (
            results.map((c) => <CampsiteCard key={c.id} campsite={c} />)
          ) : (
            <Empty
              title="Nenhum camping encontrado"
              text="Experimente outro filtro ou país. O catálogo desta prévia é demonstrativo."
            />
          )}
        </View>
      </View>
      <View className="gap-4 pt-4">
        <View className="flex-row items-end justify-between gap-6">
          <View className="flex-1">
            <T className="font-bold text-[10px] leading-3 uppercase tracking-[0.4px] text-secondary">
              Mundo Selvagem
            </T>
            <T className="font-bold text-[22px] leading-7 text-primary">Descubra por Países</T>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.navigate('/countries')}
            className="w-32 flex-row items-center gap-1"
          >
            <T className="flex-1 font-bold text-xs leading-4 text-secondary">
              Mapa global
            </T>
            <SIcon name="chevron_right" size={16} color={C.secondary} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        >
          {countries.map((c) => (
            <CountryCard key={c.name} country={c} />
          ))}
        </ScrollView>
      </View>
      <LinearGradient
        colors={[C.forest, C.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16, padding: 24, overflow: 'hidden' }}
      >
        <View className="absolute -bottom-4 right-0 opacity-10">
          <SIcon name="forest" size={130} color={C.mint} />
        </View>
        <View className="gap-2">
          <View className="self-start flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
            <SIcon name="campaign" size={12} color="#fff" />
            <T className="font-bold text-[10px] leading-3 text-white">Comunidade Kampive</T>
          </View>
          <T className="font-bold text-[22px] leading-7 text-white">
            Tem um espaço para camping ou glamping?
          </T>
          <T className="text-sm leading-5 text-[#caeada]">
            Cadastre sua propriedade selvagem e receba aventureiros responsáveis de todo o mundo.
          </T>
          <View className="mt-2 self-start">
            <CTA
              compact
              title="Cadastrar meu espaço"
              icon="add"
              onPress={() => router.push('/campsite/create')}
            />
          </View>
        </View>
      </LinearGradient>
    </Page>
  );
}
