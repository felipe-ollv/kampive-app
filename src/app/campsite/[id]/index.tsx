import { useTranslation } from '../../../lib/i18n';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { C, CTA, Heading, Page, RoundButton, SIcon, Surface } from '../../../components/stitch';
import { Notice, Photo, T } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { ReviewsList } from '../../../components/reviews-list';
import { api, errorMessage } from '../../../lib/api';
import { useApiResource } from '../../../hooks/use-api-resource';
import { campsitePrice, httpsPhoto } from '../../../lib/campsite-display';
import { useStore } from '../../../lib/store';
export default function Detail() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resource = useApiResource(
    useCallback(() => api.campsite(id), [id]),
    false,
  );
  const { reload } = resource;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const options = useApiResource(useCallback(() => api.campsiteOptions(), []));
  const { saved, toggleSaved, savedLoading, savedError, saving, refreshSaved } = useStore();
  const { user } = useAuth();
  const [gallery, setGallery] = useState(false);
  const [index, setIndex] = useState(0);
  const [actionError, setActionError] = useState('');
  const c = resource.data;
  const photos = c?.content.photos.filter((p) => httpsPhoto(p.url)) || [];
  const current = photos[index % Math.max(1, photos.length)];
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      setActionError('Não foi possível abrir o link.');
    }
  }
  return (
    <Page
      header={
        <View className="flex-row items-center gap-3 p-4">
          <RoundButton label={t('Voltar')} icon="arrow_back" onPress={back} />
          <T className="font-bold text-lg">{t('Detalhes do camping')}</T>
        </View>
      }
    >
      {resource.loading && <T>{t('Carregando camping...')}</T>}
      {resource.error ? (
        <>
          <Notice error>{resource.error}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void resource.reload()} />
        </>
      ) : null}
      {c && (
        <>
          <View className="overflow-hidden rounded-2xl bg-surface-container">
            {current ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Ampliar galeria')}
                onPress={() => setGallery(true)}
              >
                <Photo uri={httpsPhoto(current.url)!} style={{ aspectRatio: 1.2 }} />
                <T className="p-3">
                  {(index % photos.length) + 1} / {photos.length} {t('fotos · Toque para ampliar')}
                </T>
              </Pressable>
            ) : (
              <View className="items-center gap-3 p-12">
                <SIcon name="camping" size={60} />
                <T>{t('Sem fotos disponíveis')}</T>
              </View>
            )}
          </View>
          <Surface>
            {c.summary.verified && (
              <T className="font-bold text-secondary">{t('Dados verificados pela Kampive')}</T>
            )}
            <T className="font-bold text-[24px] text-primary">{c.summary.name}</T>
            <T>{[c.summary.cityName, c.summary.countryName].filter(Boolean).join(' · ')}</T>
            <T>{c.summary.categoryName}</T>
            <T className="font-bold text-secondary">
              {t(campsitePrice(c.summary, locale))}
              {c.summary.startingPricePerNight !== null ? t(' /noite') : ''}
            </T>
            <T>
              {c.summary.averageRating !== null
                ? `★ ${c.summary.averageRating?.toLocaleString(locale)} · ${t(c.summary.reviewCount === 1 ? '{count} avaliação' : '{count} avaliações', { count: c.summary.reviewCount })}`
                : t('Ainda sem avaliações')}
            </T>
            <CTA
              title={saved.includes(id) ? t('Remover dos salvos') : t('Salvar na minha conta')}
              outline
              icon="favorite"
              disabled={savedLoading || saving}
              onPress={() => {
                if (!user) {
                  router.push('/login');
                  return;
                }
                setActionError('');
                if (savedError) {
                  void refreshSaved();
                  return;
                }
                void toggleSaved(id).catch((e) => setActionError(errorMessage(e)));
              }}
            />
          </Surface>
          <Surface>
            <Heading icon="camping">{t('Sobre o camping')}</Heading>
            <T>{c.content.description || t('Descrição não informada.')}</T>
          </Surface>
          <Surface>
            <Heading icon="location_on">{t('Localização')}</Heading>
            <T>
              {[
                c.content.streetAddress,
                c.content.addressNumber,
                c.content.neighborhood,
                c.content.postalCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </T>
            {!!c.content.locationNotes && <T>{c.content.locationNotes}</T>}
            {c.content.latitude !== null && c.content.longitude !== null && (
              <CTA
                title={t('Ver rota no mapa')}
                outline
                icon="map"
                onPress={() =>
                  void open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.content.latitude},${c.content.longitude}`)}`,
                  )
                }
              />
            )}
          </Surface>
          <Surface>
            <Heading icon="hub">{t('Digital & Contato')}</Heading>
            {!c.content.contacts.length && <T>{t('Sem contatos informados.')}</T>}
            {c.content.contacts.map((contact) => (
              <View key={contact.typeUuid} className="gap-1 rounded-xl border border-line p-3">
                <T className="font-bold">
                  {options.data?.contactTypes.find((t) => t.uuid === contact.typeUuid)?.name ||
                    t('Contato')}
                </T>
                <T selectable>{contact.value}</T>
                {httpsPhoto(contact.value) && (
                  <CTA
                    title={t('Abrir link')}
                    outline
                    onPress={() => void open(httpsPhoto(contact.value)!)}
                  />
                )}
              </View>
            ))}
          </Surface>
          <Surface>
            <Heading icon="cottage">{t('Infraestrutura & Comodidades')}</Heading>
            {options.error ? (
              <>
                <Notice error>{options.error}</Notice>
                <CTA title={t('Recarregar comodidades')} onPress={() => void options.reload()} />
              </>
            ) : options.loading ? (
              <T>{t('Carregando comodidades...')}</T>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {options.data?.amenities
                  .filter((a) => c.content.amenityUuids.includes(a.uuid))
                  .map((a) => (
                    <T key={a.uuid} className="rounded-full bg-surface-container px-3 py-2">
                      {a.name}
                    </T>
                  ))}
                {options.data?.settings
                  .filter((a) => c.content.settingUuids.includes(a.uuid))
                  .map((a) => (
                    <T key={a.uuid} className="rounded-full bg-surface-container px-3 py-2">
                      {a.name}
                    </T>
                  ))}
                {!c.content.amenityUuids.length && !c.content.settingUuids.length && (
                  <T>{t('Nenhuma comodidade informada.')}</T>
                )}
              </View>
            )}
          </Surface>
          <Surface>
            <Heading icon="verified_user">{t('Este camping é seu?')}</Heading>
            <T>
              {t(
                'Solicite a verificação do seu vínculo. Nossa equipe entrará em contato e validará a propriedade antes de liberar a gestão.',
              )}
            </T>
            <CTA
              title={t('Sou proprietário deste camping')}
              outline
              onPress={() => router.push({ pathname: '/campsite/claim', params: { uuid: id } })}
            />
          </Surface>
          <Surface>
            <Heading icon="rate_review">{t('Avaliações da Comunidade')}</Heading>
            <ReviewsList campsiteUuid={id} />
            <CTA
              title={t('Avaliar camping')}
              onPress={() => router.push(user ? `/campsite/${id}/review` : '/login')}
            />
          </Surface>
        </>
      )}
      {!!(actionError || savedError) && <Notice error>{actionError || savedError}</Notice>}
      <Modal visible={gallery && !!current} onRequestClose={() => setGallery(false)}>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: C.primary }}>
          <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={{ flex: 1 }}>
            <View className="items-end p-4">
              <RoundButton
                label={t('Fechar galeria')}
                icon="close"
                onPress={() => setGallery(false)}
              />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              {current && (
                <Photo uri={httpsPhoto(current.url)!} style={{ width: '100%', aspectRatio: 1 }} />
              )}
              <View className="flex-row items-center justify-between p-4">
                <RoundButton
                  label={t('Foto anterior')}
                  icon="arrow_back"
                  onPress={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                />
                <T className="text-white">
                  {(index % Math.max(1, photos.length)) + 1} / {photos.length}
                </T>
                <RoundButton
                  label={t('Próxima foto')}
                  icon="arrow_forward"
                  onPress={() => setIndex((i) => (i + 1) % photos.length)}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </Page>
  );
}
