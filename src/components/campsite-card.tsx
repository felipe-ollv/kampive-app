import { useTranslation } from '../lib/i18n';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { errorMessage } from '../lib/api';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { CampsiteSummary } from '../lib/api';
import { campsitePrice, campsiteStatus, httpsPhoto } from '../lib/campsite-display';
import { useStore } from '../lib/store';
import { Notice, Photo, T } from './ui';
import { C, SIcon, cardShadow } from './stitch';
export function CampsiteCard({
  campsite: c,
  owned = false,
}: {
  campsite: CampsiteSummary;
  owned?: boolean;
}) {
  const { t, locale } = useTranslation();
  const { saved, toggleSaved, savedLoading, savedError, saving, refreshSaved } = useStore();
  const { user } = useAuth();
  const [error, setError] = useState('');
  async function save() {
    if (!user) {
      router.push('/login');
      return;
    }
    setError('');
    if (savedError) {
      await refreshSaved();
      return;
    }
    try {
      await toggleSaved(c.uuid);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const selected = saved.includes(c.uuid);
  const open = () =>
    owned
      ? router.push({ pathname: '/campsite/create', params: { uuid: c.uuid } })
      : router.push(`/campsite/${c.uuid}`);
  const cover = httpsPhoto(c.coverUrl);
  return (
    <View className="overflow-hidden rounded-2xl border border-line/60 bg-white" style={cardShadow}>
      <View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('Ver {name}', { name: c.name })}
          onPress={open}
        >
          {cover ? (
            <Photo uri={cover} style={{ aspectRatio: 16 / 10 }} />
          ) : (
            <View
              style={{ aspectRatio: 16 / 10 }}
              className="items-center justify-center bg-surface-container"
            >
              <SIcon name="camping" size={60} />
              <T>{t('Sem fotos')}</T>
            </View>
          )}
        </Pressable>
        <View className="absolute inset-x-3 top-3 flex-row items-center justify-between">
          <View>
            {c.verified && (
              <T className="rounded-full bg-primary px-3 py-1 text-xs text-white">
                {t('Verificado pela Kampive')}
              </T>
            )}
            {owned && (
              <T className="rounded-full bg-primary px-3 py-1 text-xs text-white">
                {t(campsiteStatus[c.status])}
              </T>
            )}
          </View>
          {!owned && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${selected ? t('Remover') : t('Salvar')} ${c.name}`}
              accessibilityState={{ selected }}
              disabled={savedLoading || saving}
              onPress={() => void save()}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            >
              <SIcon name="favorite" color={selected ? C.secondary : C.outline} />
            </Pressable>
          )}
        </View>
        <View className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1">
          <T className="font-bold text-xs text-white">
            {t(campsitePrice(c, locale))}
            {c.startingPricePerNight !== null ? t(' /noite') : ''}
          </T>
        </View>
      </View>
      {!!(error || savedError) && <Notice error>{error || savedError}</Notice>}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t('Detalhes de {name}', { name: c.name })}
        onPress={open}
        className="gap-3 p-4"
      >
        <View className="flex-row items-center gap-2">
          <T className="flex-1 font-semibold text-lg text-primary">{c.name}</T>
          <T className="text-xs">
            {c.averageRating !== null
              ? `★ ${c.averageRating.toLocaleString(locale)} (${c.reviewCount.toLocaleString(locale)})`
              : t('Sem avaliações')}
          </T>
        </View>
        <T className="text-xs text-ink-variant">
          {[c.cityName, c.countryName].filter(Boolean).join(' · ') ||
            t('Localização não informada')}
        </T>
        <T className="border-t border-line/40 pt-2 text-xs text-ink-variant">{c.categoryName}</T>
      </Pressable>
    </View>
  );
}
