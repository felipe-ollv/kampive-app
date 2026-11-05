import { useTranslation } from '../../lib/i18n';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CampsiteCard } from '../../components/campsite-card';
import { CountryCard } from '../../components/country-card';
import { C, CTA, Page, SIcon, ToggleChip, TopBar } from '../../components/stitch';
import { Empty, Notice, T } from '../../components/ui';
import { api } from '../../lib/api';
import { useExploreCampsites } from '../../hooks/use-explore-campsites';
import { useAuth } from '../../lib/auth';
import { useApiResource } from '../../hooks/use-api-resource';
import { useCountries } from '../../hooks/use-countries';
import { greetingForHour } from '../../lib/greeting';
export default function Explore() {
  const { t } = useTranslation();
  const { country: param, countryUuid } = useLocalSearchParams<{
    country?: string;
    countryUuid?: string;
  }>();
  const { user, loading: authLoading } = useAuth();
  const [focused, setFocused] = useState(false);
  const [greeting, setGreeting] = useState(() => greetingForHour(new Date().getHours()));
  useEffect(() => {
    if (!focused) return;
    const updateGreeting = () => setGreeting(greetingForHour(new Date().getHours()));
    updateGreeting();
    const timer = setInterval(updateGreeting, 30_000);
    return () => clearInterval(timer);
  }, [focused]);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const [allRegions, setAllRegions] = useState(false);
  const listEnd = useRef(0);
  const country = countryUuid ? param || t('País selecionado') : t('Todos os países');
  const catalog = useCountries();
  const countries = catalog.data?.items || [];
  const options = useApiResource(useCallback(() => api.campsiteOptions(), []));
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const [category, setCategory] = useState('');
  const [amenity, setAmenity] = useState('');
  const [setting, setSetting] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const divisionUuid =
    !search && !countryUuid && !allRegions ? user?.divisionUuid || undefined : undefined;
  const campings = useExploreCampsites(
    {
      countryUuid: search ? undefined : countryUuid || undefined,
      divisionUuid,
      categoryUuid: category,
      amenityUuid: amenity,
      settingUuid: setting,
      query: search,
    },
    focused && !authLoading,
  );
  const results = campings.items;
  return (
    <Page
      top={16}
      scrollResetKey={JSON.stringify([
        search,
        divisionUuid,
        countryUuid,
        category,
        amenity,
        setting,
      ])}
      onScroll={({ nativeEvent }) => {
        if (
          listEnd.current > 0 &&
          !authLoading &&
          query.trim() === search &&
          nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
            listEnd.current - 400
        )
          campings.loadMore();
      }}
      header={
        <TopBar
          mode="home"
          country={
            search
              ? t('Busca global')
              : divisionUuid
                ? user?.divisionName || t('Seu estado')
                : country
          }
          onCountry={() => setSelecting(!selecting)}
        />
      }
    >
      {selecting && (
        <View className="gap-2 rounded-xl border border-line bg-white p-3">
          <CTA
            title={t('Todos os países')}
            outline
            onPress={() => {
              router.setParams({ country: '', countryUuid: '' });
              setAllRegions(true);
              setSelecting(false);
            }}
          />
          {!!user?.divisionUuid && (
            <CTA
              title={t('Meu estado: {name}', { name: user.divisionName || t('Seu estado') })}
              outline
              onPress={() => {
                router.setParams({ country: '', countryUuid: '' });
                setAllRegions(false);
                setQuery('');
                setSelecting(false);
              }}
            />
          )}
          {!countries.length && <T>{t('Nenhum país disponível no momento.')}</T>}
          <CTA
            title={t('Ver todos os países')}
            outline
            onPress={() => router.navigate('/countries')}
          />
          {countries.map((c) => (
            <Pressable
              key={c.uuid}
              accessibilityRole="button"
              onPress={() => {
                router.setParams({ country: c.name, countryUuid: c.uuid });
                setSelecting(false);
              }}
              className="flex-row justify-between p-2"
            >
              <T>{c.name}</T>
              {c.name === country && <SIcon name="check" size={18} />}
            </Pressable>
          ))}
        </View>
      )}
      <View className="gap-1">
        <View className="self-start flex-row items-center gap-1 rounded-full bg-[#ffdbce] px-2.5 py-0.5">
          <SIcon name="wb_sunny" size={12} color="#370e00" />
          <T className="font-bold text-[10px] leading-3 text-[#370e00]">
            {t(greeting)}
          </T>
        </View>
        <T
          accessibilityRole="header"
          className="font-bold text-[28px] leading-[34px] tracking-tight text-primary"
        >
          {t('Onde você vai acampar?')}
        </T>
        <T className="text-sm leading-5 text-ink-variant">
          {t('Descubra campings selvagens, glampings e refúgios com infraestrutura completa.')}
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
          contextMenuHidden={false}
          accessibilityLabel={t('Buscar campings')}
          value={query}
          maxLength={120}
          returnKeyType="search"
          onSubmitEditing={() => setSearch(query.trim())}
          onChangeText={setQuery}
          placeholder={t('Buscar por cidade, país ou camping...')}
          placeholderTextColor={C.outline}
          className="min-h-10 min-w-0 flex-1 font-jakarta text-sm text-ink"
        />
        <View className="mx-1 h-6 w-px bg-line" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Abrir filtros avançados')}
          onPress={() => setAdvanced(!advanced)}
          className="items-center justify-center rounded-full bg-[#1e3a2f] px-4 py-2.5"
        >
          <SIcon name="tune" size={18} color="#fff" />
        </Pressable>
      </View>
      {options.error ? (
        <>
          <Notice error>{options.error}</Notice>
          <CTA title={t('Recarregar filtros')} outline onPress={() => void options.reload()} />
        </>
      ) : null}
      {advanced && (
        <View className="gap-3 rounded-xl bg-white p-4">
          <T className="font-semibold">{t('Comodidades')}</T>
          <View className="flex-row flex-wrap gap-2">
            {options.data?.amenities.map((a) => (
              <ToggleChip
                key={a.uuid}
                icon="check"
                selected={amenity === a.uuid}
                onPress={() => setAmenity(amenity === a.uuid ? '' : a.uuid)}
              >
                {a.name}
              </ToggleChip>
            ))}
          </View>
          <T className="font-semibold">{t('Ambiente natural')}</T>
          <View className="flex-row flex-wrap gap-2">
            {options.data?.settings.map((a) => (
              <ToggleChip
                key={a.uuid}
                icon="forest"
                selected={setting === a.uuid}
                onPress={() => setSetting(setting === a.uuid ? '' : a.uuid)}
              >
                {a.name}
              </ToggleChip>
            ))}
          </View>
          <CTA
            title={t('Limpar filtros')}
            outline
            onPress={() => {
              setCategory('');
              setAmenity('');
              setSetting('');
              setQuery('');
            }}
          />
          <CTA title={t('Aplicar filtros')} onPress={() => setAdvanced(false)} />
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        <ToggleChip icon="camping" selected={!category} onPress={() => setCategory('')}>
          {t('Todos')}
        </ToggleChip>
        {options.data?.categories.map((c) => (
          <ToggleChip
            key={c.uuid}
            icon="camping"
            selected={category === c.uuid}
            onPress={() => setCategory(category === c.uuid ? '' : c.uuid)}
          >
            {c.name}
          </ToggleChip>
        ))}
      </ScrollView>
      <View
        className="gap-4"
        onLayout={({ nativeEvent }) => {
          listEnd.current = nativeEvent.layout.y + nativeEvent.layout.height;
        }}
      >
        <T className="font-bold text-[22px] text-primary">
          {search
            ? t('Resultados em todos os destinos')
            : divisionUuid
              ? t('Campings em {name}', { name: user?.divisionName || t('Seu estado') })
              : countryUuid
                ? t('Campings em {name}', { name: country })
                : t('Explore os campings')}
        </T>
        <T className="text-xs text-ink-variant">
          {search
            ? t('Busca por nome, cidade ou país, em todo o catálogo.')
            : t('Ordenados por melhor avaliação.')}
        </T>
        {!search && !countryUuid && !user?.divisionUuid && !authLoading && (
          <T className="text-xs text-ink-variant">
            {t('Como seu estado não foi informado, estamos mostrando todos os destinos.')}
          </T>
        )}
        {(campings.loading || authLoading || query.trim() !== search) && (
          <T>{t('Carregando campings...')}</T>
        )}
        {!!(category || amenity || setting) && (
          <View className="gap-2">
            <T className="text-xs text-ink-variant">
              {t('Filtros ativos:')}{' '}
              {[
                options.data?.categories.find((item) => item.uuid === category)?.name,
                options.data?.amenities.find((item) => item.uuid === amenity)?.name,
                options.data?.settings.find((item) => item.uuid === setting)?.name,
              ]
                .filter(Boolean)
                .join(' · ')}
            </T>
            <CTA
              title={t('Limpar filtros')}
              outline
              onPress={() => {
                setCategory('');
                setAmenity('');
                setSetting('');
              }}
            />
          </View>
        )}
        {campings.error ? (
          <>
            <Notice error>{campings.error}</Notice>
            <CTA title={t('Tentar novamente')} onPress={() => void campings.retry()} />
          </>
        ) : null}
        {!authLoading &&
          query.trim() === search &&
          !campings.loading &&
          !campings.error &&
          !results.length && (
            <Empty
              title={t('Nenhum camping encontrado')}
              text={t('Experimente outro filtro ou volte quando houver novos campings publicados.')}
            />
          )}
        <View className="gap-6">
          {results.map((c) => (
            <CampsiteCard key={c.uuid} campsite={c} />
          ))}
        </View>
        {campings.loadingMore && (
          <View
            className="flex-row items-center justify-center gap-2"
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator color={C.secondary} />
            <T>{t('Carregando mais campings...')}</T>
          </View>
        )}
        {!campings.loading &&
          !campings.loadingMore &&
          !campings.error &&
          results.length > 0 &&
          !campings.hasMore && (
            <T className="text-center text-xs text-ink-variant">
              {t('Você chegou ao fim dos resultados.')}
            </T>
          )}
      </View>
      <View className="gap-4 pt-4">
        <View className="flex-row items-end justify-between gap-6">
          <View className="flex-1">
            <T className="font-bold text-[10px] leading-3 uppercase tracking-[0.4px] text-secondary">
              {t('Mundo Selvagem')}
            </T>
            <T className="font-bold text-[22px] leading-7 text-primary">
              {t('Descubra por Países')}
            </T>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.navigate('/countries')}
            className="w-32 flex-row items-center gap-1"
          >
            <T className="flex-1 font-bold text-xs leading-4 text-secondary">{t('Mapa global')}</T>
            <SIcon name="chevron_right" size={16} color={C.secondary} />
          </Pressable>
        </View>
        {catalog.loading && <T>{t('Carregando países...')}</T>}
        {catalog.error ? (
          <>
            <Notice error>{catalog.error}</Notice>
            <CTA title={t('Tentar novamente')} onPress={() => void catalog.reload()} />
          </>
        ) : null}
        {!catalog.loading && !catalog.error && !countries.length && (
          <T>{t('Nenhum país disponível no momento.')}</T>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        >
          {countries.map((c) => (
            <CountryCard key={c.uuid} country={c} />
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
            <T className="font-bold text-[10px] leading-3 text-white">{t('Comunidade Kampive')}</T>
          </View>
          <T className="font-bold text-[22px] leading-7 text-white">
            {t('Conhece um camping ou glamping?')}
          </T>
          <T className="text-sm leading-5 text-[#caeada]">
            {t('Indique um lugar para nossa equipe cadastrar e validar as informações.')}
          </T>
          <View className="mt-2 self-start">
            <CTA
              compact
              title={t('Indicar um camping')}
              icon="add"
              onPress={() => router.push('/campsite/suggest')}
            />
          </View>
        </View>
      </LinearGradient>
    </Page>
  );
}
