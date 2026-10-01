import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CountryCard } from '../../components/country-card';
import { Page, ToggleChip, TopBar } from '../../components/stitch';
import { T } from '../../components/ui';
import { countries } from '../../data/campsites';
const continents = ['Todos', ...new Set(countries.map((country) => country.continent))];

export default function Countries() {
  const [continent, setContinent] = useState('Todos');
  const visibleCountries = countries.filter(
    (country) => continent === 'Todos' || country.continent === continent,
  );
  return (
    <Page header={<TopBar />}>
      <View className="gap-1">
        <T className="font-bold text-[10px] uppercase tracking-wider text-secondary">
          Mundo Selvagem
        </T>
        <T className="font-bold text-[24px] leading-[30px] text-primary">Descubra por Países</T>
        <T className="text-sm text-ink-variant">
          Seu próximo refúgio pode estar em qualquer lugar.
        </T>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {continents.map((option) => (
          <ToggleChip
            key={option}
            icon="public"
            selected={continent === option}
            onPress={() => setContinent(option)}
          >
            {option}
          </ToggleChip>
        ))}
      </ScrollView>
      <View className="items-center gap-4">
        {visibleCountries.map((c) => (
          <CountryCard key={c.name} country={c} variant="fullWidth" />
        ))}
      </View>
    </Page>
  );
}
