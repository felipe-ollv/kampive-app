import { useTranslation } from '../../lib/i18n';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CountryCard } from '../../components/country-card';
import { CTA, Input, Page, ToggleChip, TopBar } from '../../components/stitch';
import { Empty, Notice, T } from '../../components/ui';
import { api, errorMessage, type Continent } from '../../lib/api';
import { useCountries } from '../../hooks/use-countries';
export default function Countries() {
  const { t } = useTranslation();
  const [continents, setContinents] = useState<Continent[]>([]);
  const [continent, setContinent] = useState<string>();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const countries = useCountries(continent, query);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);
  useEffect(() => {
    let active = true;
    setError('');
    api
      .continents()
      .then((data) => {
        if (active) setContinents(data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <Page header={<TopBar />}>
      <View className="gap-1">
        <T className="font-bold text-[10px] uppercase text-secondary">{t('Mundo Selvagem')}</T>
        <T className="font-bold text-[22px] text-primary">{t('Descubra por Países')}</T>
        <T>{t('Seu próximo refúgio pode estar em qualquer lugar.')}</T>
      </View>
      <Input
        label={t('Buscar país')}
        placeholder={t('Nome ou código do país')}
        value={text}
        onChangeText={setText}
        maxLength={120}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        <ToggleChip icon="public" selected={!continent} onPress={() => setContinent(undefined)}>
          {t('Todos')}
        </ToggleChip>
        {continents.map((option) => (
          <ToggleChip
            key={option.uuid}
            icon="public"
            selected={continent === option.uuid}
            onPress={() => setContinent(option.uuid)}
          >
            {option.name}
          </ToggleChip>
        ))}
      </ScrollView>
      {error || countries.error ? (
        <>
          <Notice error>{error || countries.error}</Notice>
          <CTA
            title={t('Tentar novamente')}
            onPress={() => {
              setRevision((n) => n + 1);
              void countries.reload();
            }}
          />
        </>
      ) : null}
      {countries.loading && <T>{t('Carregando países...')}</T>}
      {!countries.loading && !countries.error && !countries.data?.items.length && (
        <Empty
          title={t('Nenhum país encontrado')}
          text={t('Não há países disponíveis para esta seleção.')}
        />
      )}
      <View className="items-center gap-4">
        {countries.data?.items.map((c) => (
          <CountryCard key={c.uuid} country={c} variant="fullWidth" />
        ))}
      </View>
      {countries.data && countries.data.page + 1 < countries.data.totalPages && (
        <CTA
          title={t('Carregar mais países')}
          disabled={countries.loading}
          onPress={countries.loadMore}
        />
      )}
    </Page>
  );
}
