import { useState } from 'react';
import { View } from 'react-native';
import { Surface, ToggleChip } from './stitch';
import { Notice, T } from './ui';
import { languageNames, languages, useTranslation, type LanguagePreference } from '../lib/i18n';
export function LanguageSettings() {
  const { t, language, preference, setPreference, ready, saving, countryError } = useTranslation();
  const [error, setError] = useState(false);
  async function select(value: LanguagePreference) {
    setError(false);
    try {
      await setPreference(value);
    } catch {
      setError(true);
    }
  }
  return (
    <Surface>
      <T accessibilityRole="header" className="font-bold text-lg">
        {t('Idioma')}
      </T>
      <T>
        {t(
          'Use o país do seu cadastro ou escolha o idioma do app. A preferência fica salva neste dispositivo para sua conta.',
        )}
      </T>
      <View
        className="flex-row flex-wrap gap-2"
        pointerEvents={!ready || saving ? 'none' : 'auto'}
        accessibilityState={{ disabled: !ready || saving }}
      >
        <ToggleChip
          icon="language"
          selected={preference === 'auto'}
          onPress={() => void select('auto')}
        >
          {t('Automático pelo país')}
        </ToggleChip>
        {languages.map((value) => (
          <ToggleChip
            key={value}
            icon="language"
            selected={preference === value}
            onPress={() => void select(value)}
          >
            {languageNames[value]}
          </ToggleChip>
        ))}
      </View>
      <T accessibilityLiveRegion="polite">
        {saving
          ? t('Salvando...')
          : t('Idioma atual: {language}', { language: languageNames[language] })}
      </T>
      {countryError && preference === 'auto' && (
        <Notice>
          {t('Não foi possível consultar seu país. Usando o idioma do dispositivo por enquanto.')}
        </Notice>
      )}
      {error && <Notice error>{t('Não foi possível salvar o idioma. Tente novamente.')}</Notice>}
    </Surface>
  );
}
